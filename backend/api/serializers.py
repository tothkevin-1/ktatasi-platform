from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.db.models import Avg, Count
from .models import CustomUser, Tantargy, Kurzus, Feladat, Beadas, Hir, Hianyzas

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['user_id'] = user.id
        token['username'] = user.username
        token['role'] = user.role
        token['first_name'] = user.first_name
        return token

class TantargySerializer(serializers.ModelSerializer):
    class Meta:
        model = Tantargy
        fields = ['id', 'nev', 'leiras']

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'first_name', 'last_name', 'email', 'role', 'pontszam']

class BeadasSerializer(serializers.ModelSerializer):
    diak = UserSerializer(read_only=True)
    class Meta:
        model = Beadas
        fields = ['id', 'feladat', 'diak', 'beadas_datuma', 'szoveges_valasz', 'erdemjegy', 'tanari_visszajelzes']

class ErtekelesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Beadas
        fields = ['erdemjegy', 'tanari_visszajelzes']

class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)
    new_password_confirm = serializers.CharField(required=True)
    def validate(self, data):
        if data['new_password'] != data['new_password_confirm']:
            raise serializers.ValidationError({"new_password": "A két új jelszó nem egyezik."})
        return data

class FeladatSerializer(serializers.ModelSerializer):
    kurzus = serializers.ReadOnlyField(source='kurzus.id')
    kurzus_id = serializers.PrimaryKeyRelatedField(queryset=Kurzus.objects.all(), source='kurzus', write_only=True)
    beadasok = BeadasSerializer(many=True, read_only=True)
    beadasok_szama = serializers.SerializerMethodField()
    jegyek_atlaga = serializers.SerializerMethodField()
    jegy_eloszlas = serializers.SerializerMethodField()
    class Meta:
        model = Feladat
        fields = ['id', 'kurzus', 'kurzus_id', 'cim', 'leiras', 'hatarido', 'tipus', 'kviz_kerdesek', 'beadasok', 'beadasok_szama', 'jegyek_atlaga', 'jegy_eloszlas']
    def get_beadasok_szama(self, obj): return obj.beadasok.count()
    def get_jegyek_atlaga(self, obj):
        atlag = obj.beadasok.aggregate(Avg('erdemjegy'))['erdemjegy__avg']
        return round(atlag, 2) if atlag is not None else 0.0
    def get_jegy_eloszlas(self, obj):
        # ... változatlan ...
        eloszlas_query = obj.beadasok.values('erdemjegy').annotate(darab=Count('erdemjegy')).order_by('erdemjegy')
        teljes_eloszlas = {jegy: 0 for jegy in range(1, 11)}
        for item in eloszlas_query:
            if item['erdemjegy'] is not None: teljes_eloszlas[item['erdemjegy']] = item['darab']
        return [{'name': str(jegy), 'darab': darab} for jegy, darab in teljes_eloszlas.items()]

class KurzusSerializer(serializers.ModelSerializer):
    tanar = UserSerializer(read_only=True)
    tantargy = TantargySerializer(read_only=True)
    diakok = UserSerializer(many=True, read_only=True)
    feladatok = FeladatSerializer(many=True, read_only=True) 
    tanar_id = serializers.PrimaryKeyRelatedField(queryset=CustomUser.objects.all(), source='tanar', write_only=True)
    tantargy_id = serializers.PrimaryKeyRelatedField(queryset=Tantargy.objects.all(), source='tantargy', write_only=True)
    class Meta:
        model = Kurzus
        fields = ['id', 'kurzus_neve', 'tantargy', 'tantargy_id', 'tanar', 'tanar_id', 'diakok', 'feladatok']


class HianyzasSerializer(serializers.ModelSerializer):
    diak = UserSerializer(read_only=True)
    diak_id = serializers.PrimaryKeyRelatedField(
        queryset=CustomUser.objects.filter(role='diak'), source='diak', write_only=True
    )
    kurzus_neve = serializers.ReadOnlyField(source='kurzus.kurzus_neve')

    class Meta:
        model = Hianyzas
        fields = ['id', 'diak', 'diak_id', 'kurzus', 'kurzus_neve', 'datum', 'igazolt', 'megjegyzes', 'letrehozva']

class HirSerializer(serializers.ModelSerializer):
    # A szerző adatait beágyazzuk, hogy a frontendnek ne kelljen külön lekérdeznie
    szerzo = UserSerializer(read_only=True)

    class Meta:
        model = Hir
        fields = ['id', 'cim', 'tartalom', 'szerzo', 'letrehozas_datuma', 'modositas_datuma']