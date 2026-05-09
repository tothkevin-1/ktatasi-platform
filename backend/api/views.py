from rest_framework import viewsets, permissions, generics, parsers
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView
from datetime import datetime, timezone
from django.db.models import Avg, Count
import requests as http_requests

from .models import CustomUser, Tantargy, Kurzus, Feladat, Beadas, Hir
from .serializers import (
    UserSerializer,
    TantargySerializer,
    KurzusSerializer,
    FeladatSerializer,
    BeadasSerializer,
    ErtekelesSerializer,
    ChangePasswordSerializer,
    HirSerializer
)
from .permissions import IsCourseTeacher, IsTeacher, IsTeacherOrAdmin

class UserViewSet(viewsets.ModelViewSet):
    queryset = CustomUser.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

class TantargyViewSet(viewsets.ModelViewSet):
    queryset = Tantargy.objects.all()
    serializer_class = TantargySerializer
    permission_classes = [permissions.IsAuthenticated]

class KurzusViewSet(viewsets.ModelViewSet):
    serializer_class = KurzusSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'diak':
            return Kurzus.objects.filter(diakok=user)
        elif user.role == 'tanar':
            return Kurzus.objects.filter(tanar=user)
        return Kurzus.objects.all()

class FeladatViewSet(viewsets.ModelViewSet):
    queryset = Feladat.objects.all()
    serializer_class = FeladatSerializer
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            self.permission_classes = [IsTeacher]
        else:
            self.permission_classes = [permissions.IsAuthenticated]
        return super().get_permissions()
    
class BeadasViewSet(viewsets.ModelViewSet):
    queryset = Beadas.objects.all()
    serializer_class = BeadasSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        import json as json_lib
        feladat_id = self.request.data.get('feladat')
        if Beadas.objects.filter(diak=self.request.user, feladat_id=feladat_id).exists():
            from rest_framework.exceptions import ValidationError
            raise ValidationError('Ezt a feladatot már beadtad.')
        beadas = serializer.save(diak=self.request.user)
        # Automatikus kvíz értékelés
        feladat = beadas.feladat
        if feladat.tipus == 'kviz' and feladat.kviz_kerdesek:
            try:
                valaszok = json_lib.loads(beadas.szoveges_valasz)
                kerdesek = feladat.kviz_kerdesek
                helyes = sum(1 for i, k in enumerate(kerdesek) if valaszok.get(str(i)) == k['helyes'])
                szazalek = helyes / len(kerdesek)
                erdemjegy = max(1, min(5, round(1 + szazalek * 4)))
                beadas.erdemjegy = erdemjegy
                beadas.tanari_visszajelzes = f"Automatikus értékelés: {helyes}/{len(kerdesek)} helyes válasz ({round(szazalek*100)}%)"
                beadas.save()
            except Exception:
                pass

    @action(detail=True, methods=['patch'], permission_classes=[IsCourseTeacher])
    def ertekel(self, request, pk=None):
        beadas = self.get_object()
        serializer = ErtekelesSerializer(beadas, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(BeadasSerializer(beadas).data)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class HirViewSet(viewsets.ModelViewSet):
    queryset = Hir.objects.all()
    serializer_class = HirSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            self.permission_classes = [IsTeacherOrAdmin]
        else:
            self.permission_classes =[permissions.IsAuthenticated]
        return super().get_permissions()
    
    def perform_create(self, serializer):
        serializer.save(szerzo=self.request.user)

class RanglistaView(generics.ListAPIView):
    serializer_class = UserSerializer
    permission_classes =[permissions.IsAuthenticated]

    def get_queryset(self):
        return CustomUser.objects.filter(role='diak').order_by('-pontszam')[:10]

class ChangePasswordView(generics.UpdateAPIView):
    serializer_class = ChangePasswordSerializer
    model = CustomUser
    permission_classes = [permissions.IsAuthenticated]
    def get_object(self, queryset=None):
        return self.request.user
    def update(self, request, *args, **kwargs):
        self.object = self.get_object()
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            if not self.object.check_password(serializer.data.get("old_password")):
                return Response({"old_password":["Hibás régi jelszó."]}, status=status.HTTP_400_BAD_REQUEST)
            if len(serializer.data.get("new_password")) < 8:
                return Response({"new_password":["Az új jelszónak legalább 8 karakter hosszúnak kell lennie."]}, status=status.HTTP_400_BAD_REQUEST)
            self.object.set_password(serializer.data.get("new_password"))
            self.object.save()
            return Response({"status": "Jelszó sikeresen megváltoztatva"}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# EZ AZ ÚJ RÉSZ A DIGITÁLIS NAPLÓHOZ
# backend/api/views.py (Csak a JegyekView változik)

class JegyekView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user
        if user.role != 'diak':
            return Response([])

        # Lekérjük a diák összes értékelt beadását, a dátum szerint sorba rendezve
        beadasok = Beadas.objects.filter(
            diak=user, 
            erdemjegy__isnull=False
        ).select_related('feladat__kurzus__tantargy').order_by('beadas_datuma')

        tantargyak_dict = {}

        # Csoportosítjuk a jegyeket tantárgyak szerint
        for beadas in beadasok:
            tantargy_nev = beadas.feladat.kurzus.tantargy.nev
            
            if tantargy_nev not in tantargyak_dict:
                tantargyak_dict[tantargy_nev] = {
                    'tantargy_nev': tantargy_nev,
                    'jegyek':[],
                    'szumma': 0,
                    'darab': 0
                }
            
            # Hozzáadjuk a jegyet a tantárgy listájához
            tantargyak_dict[tantargy_nev]['jegyek'].append({
                'erdemjegy': beadas.erdemjegy,
                'feladat_cim': beadas.feladat.cim,
                'tanari_visszajelzes': beadas.tanari_visszajelzes,
                'datum': beadas.beadas_datuma.strftime("%Y.%m.%d")
            })
            
            # Az átlagszámításhoz gyűjtjük az értékeket
            tantargyak_dict[tantargy_nev]['szumma'] += beadas.erdemjegy
            tantargyak_dict[tantargy_nev]['darab'] += 1

        eredmeny =[]
        # Kiszámoljuk a végső átlagokat és listává alakítjuk a szótárat
        for t_nev, data in tantargyak_dict.items():
            data['atlag'] = round(data['szumma'] / data['darab'], 2)
            del data['szumma'] # Ezekre a frontendnek már nincs szüksége
            del data['darab']
            eredmeny.append(data)

        return Response(eredmeny)
    
# backend/api/views.py (A fájl vége)

# ... A többi nézet (RanglistaView, ChangePasswordView, JegyekView, stb.) marad ...

# ÚJ NÉZET: Csak a Dicsőségfal adatait adja vissza
class DicsosegfalView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        top_diakok = CustomUser.objects.filter(role='diak').order_by('-pontszam')
        ev_diakja = None
        honap_diakja = None

        if top_diakok.exists():
            ev_diakja = UserSerializer(top_diakok.first()).data
            if top_diakok.count() > 1:
                honap_diakja = UserSerializer(top_diakok[1]).data
            else:
                honap_diakja = ev_diakja

        return Response({
            'ev_diakja': ev_diakja,
            'honap_diakja': honap_diakja
        })

class AIChatView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        uzenet = request.data.get('uzenet', '').strip()
        if not uzenet:
            return Response({'error': 'Üres üzenet'}, status=status.HTTP_400_BAD_REQUEST)

        # RAG: releváns tananyagrészek keresése
        kontextus = ''
        try:
            from .rag import kereses
            kontextus = kereses(uzenet)
        except Exception:
            pass

        if kontextus:
            prompt = (
                "Te egy barátságos, türelmes iskolai tanulmányi asszisztens vagy. "
                "Kizárólag magyarul válaszolj, röviden és érthetően. "
                "Az alábbi tananyagrészletek alapján válaszolj a diák kérdésére. "
                "Ha a választ nem találod a tananyagban, mondd meg őszintén.\n\n"
                f"Tananyag:\n{kontextus}\n\n"
                f"Diák kérdése: {uzenet}"
            )
        else:
            prompt = (
                "Te egy barátságos, türelmes iskolai tanulmányi asszisztens vagy. "
                "Kizárólag magyarul válaszolj, röviden és érthetően. "
                f"A diák kérdése: {uzenet}"
            )

        try:
            ollama_response = http_requests.post(
                'http://localhost:11434/api/generate',
                json={'model': 'llama3.2:3b', 'prompt': prompt, 'stream': False},
                timeout=90
            )
            ollama_response.raise_for_status()
            valasz = ollama_response.json().get('response', 'Nem érkezett válasz.')
        except Exception as e:
            return Response({'error': f'Ollama hiba: {str(e)}'}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

        return Response({'valasz': valasz})


class AIDolgozatView(APIView):
    permission_classes = [IsTeacher]

    TANTARGYAK = {
        'internet_tortenete': 'Az internet története',
        'foldrajz': 'Földrajz',
        'biologia': 'Biológia',
    }

    def post(self, request, *args, **kwargs):
        tantargy = request.data.get('tantargy', '').strip()
        kerdesek_szama = int(request.data.get('kerdesek_szama', 5))

        if tantargy not in self.TANTARGYAK:
            return Response({'error': 'Ismeretlen tantárgy'}, status=status.HTTP_400_BAD_REQUEST)

        kerdesek_szama = max(3, min(kerdesek_szama, 10))

        try:
            from .rag import kereses
            kontextus = kereses(self.TANTARGYAK[tantargy], n_results=6)
        except Exception:
            kontextus = ''

        import re, json as json_lib

        # Angolul kérjük a JSON-t — a kis modell megbízhatóbban teljesít
        prompt = (
            f"Create {kerdesek_szama} multiple choice questions in HUNGARIAN language based on this text:\n\n"
            f"{kontextus}\n\n"
            f"Return ONLY a JSON array, no other text. Use this exact format:\n"
            f'[{{"q":"question text in hungarian","a":"option A","b":"option B","c":"option C","d":"option D","ans":"b"}}]\n\n'
            f"The 'ans' field must be one of: a, b, c, d. Vary which option is correct. Output only the JSON array:"
        )

        try:
            ollama_response = http_requests.post(
                'http://localhost:11434/api/generate',
                json={'model': 'llama3.2:3b', 'prompt': prompt, 'stream': False},
                timeout=120
            )
            ollama_response.raise_for_status()
            szoveg = ollama_response.json().get('response', '').strip()

            import logging
            logging.warning(f"AI RAW: {szoveg[:500]}")

            # JSON tömb kinyerése
            match = re.search(r'\[[\s\S]*?\]', szoveg)
            if not match:
                return Response({'error': 'Az AI nem adott vissza JSON-t. Próbáld újra.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            json_szoveg = match.group()
            json_szoveg = re.sub(r',\s*([}\]])', r'\1', json_szoveg)  # trailing comma javítás
            json_szoveg = json_szoveg.replace("'", '"')  # szimpla → dupla idézőjel

            nyers = json_lib.loads(json_szoveg)

            # Konvertálás a mi formátumunkra + validálás
            validalt = []
            for k in nyers:
                try:
                    kerdes_szoveg = k.get('q') or k.get('kerdes') or k.get('question', '')
                    helyes = k.get('ans') or k.get('helyes') or k.get('correct', '')
                    valaszok = {
                        'a': k.get('a') or (k.get('valaszok') or {}).get('a', ''),
                        'b': k.get('b') or (k.get('valaszok') or {}).get('b', ''),
                        'c': k.get('c') or (k.get('valaszok') or {}).get('c', ''),
                        'd': k.get('d') or (k.get('valaszok') or {}).get('d', ''),
                    }
                    if kerdes_szoveg and helyes in ['a','b','c','d'] and all(valaszok.values()):
                        validalt.append({'kerdes': kerdes_szoveg, 'valaszok': valaszok, 'helyes': helyes})
                except Exception:
                    continue

            if not validalt:
                return Response({'error': 'Az AI érvénytelen kérdéseket generált. Próbáld újra.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            return Response({'kerdesek': validalt, 'tantargy': self.TANTARGYAK[tantargy]})

        except json_lib.JSONDecodeError as e:
            return Response({'error': f'JSON hiba: {str(e)}. Próbáld újra.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Exception as e:
            return Response({'error': f'Hiba: {str(e)}'}, status=status.HTTP_503_SERVICE_UNAVAILABLE)


class AIErtekelesView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        beadas_id = request.data.get('beadas_id')
        if not beadas_id:
            return Response({'error': 'Hiányzó beadas_id'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            beadas = Beadas.objects.select_related('feladat').get(id=beadas_id)
        except Beadas.DoesNotExist:
            return Response({'error': 'Beadás nem található'}, status=status.HTTP_404_NOT_FOUND)

        # Csak a beadás diákja vagy a kurzus tanára kérhet értékelést
        user = request.user
        if user.role == 'diak' and beadas.diak != user:
            return Response({'error': 'Nincs jogosultságod'}, status=status.HTTP_403_FORBIDDEN)

        feladat_leiras = beadas.feladat.leiras
        diak_valasz = beadas.szoveges_valasz or ''

        if user.role == 'tanar':
            prompt = (
                f"Te egy tapasztalt tanár asszisztens vagy. "
                f"A feladat leírása: {feladat_leiras}\n"
                f"A diák válasza: {diak_valasz}\n\n"
                f"Adj egy rövid, konstruktív értékelési javaslatot magyarul, és javasolj egy 1-5 közötti érdemjegyet. "
                f"Legyen tömör, max 5 mondat."
            )
        else:
            prompt = (
                f"Te egy segítőkész tanár asszisztens vagy. "
                f"A feladat leírása: {feladat_leiras}\n"
                f"A diák válasza: {diak_valasz}\n\n"
                f"Adj rövid, bátorító visszajelzést magyarul arról, hogy mi sikerült jól és min lehetne javítani. "
                f"Ez NEM a végleges jegy, csak segítség a fejlődéshez. Max 4 mondat."
            )

        try:
            ollama_response = http_requests.post(
                'http://localhost:11434/api/generate',
                json={'model': 'llama3.2:3b', 'prompt': prompt, 'stream': False},
                timeout=60
            )
            ollama_response.raise_for_status()
            ai_szoveg = ollama_response.json().get('response', 'Nem érkezett válasz.')
        except Exception as e:
            return Response({'error': f'Ollama hiba: {str(e)}'}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

        return Response({'ertekeles': ai_szoveg})


# MÓDOSÍTOTT NÉZET: A DashboardView-ból kivettük a dicsőségfalat
class DashboardView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user
        data = {}

        if user.role == 'diak':
            now = datetime.now(timezone.utc)
            beadott_feladat_idk = Beadas.objects.filter(diak=user).values_list('feladat_id', flat=True)
            kozelgo_feladatok = Feladat.objects.filter(
                kurzus__diakok=user, hatarido__gte=now
            ).exclude(
                id__in=beadott_feladat_idk
            ).order_by('hatarido')[:3]
            data['kozelgo_feladatok'] = FeladatSerializer(kozelgo_feladatok, many=True).data
            
        elif user.role == 'tanar':
            kurzusok = Kurzus.objects.filter(tanar=user)
            ertekelendo_kurzusok =[]
            for kurzus in kurzusok:
                ertekelendo_count = Beadas.objects.filter(
                    feladat__kurzus=kurzus, erdemjegy__isnull=True
                ).count()
                if ertekelendo_count > 0:
                    ertekelendo_kurzusok.append({
                        'id': kurzus.id, 'kurzus_neve': kurzus.kurzus_neve, 'ertekelendo_count': ertekelendo_count
                    })
            data['ertekelendo_kurzusok'] = ertekelendo_kurzusok
            
        return Response(data)