# Oktatási Platform

**Diplomadolgozat projekt**  
Készítette: Tóth Kevin | Szak: Gazdasági-Informatika | Témavezető: Madaras Szilárd

Modern oktatási platform mesterséges intelligencia integrációval és gamifikációs elemekkel. Django REST API backend, React frontend, Ollama helyi AI modell.

---

## Funkciók

- Szerepkörök: diák, tanár, vezető
- Kurzusok, feladatok, beadások, jegyek kezelése
- AI tanulmányi asszisztens (chat widget)
- AI alapú feladat értékelés (tanárnak javaslat, diáknak visszajelzés)
- AI kvíz generátor — tanár generálja, diák kitölti, automatikus értékelés
- RAG rendszer: 3 tantárgy tananyaga (Internet története, Földrajz, Biológia)
- Valós idejű közösségi chat (WebSocket)
- Ranglista, dicsőségfal (Hónap/Év Diákja)
- Hírek szekció
- Sötét mód, háromnyelvű felület (magyar, román, angol)

---

## Rendszerkövetelmények

- Python 3.11+
- Node.js 18+
- Git
- Ollama
- Minimum 8 GB RAM (az AI modell miatt)

---

## Telepítési útmutató

### 1. Repo letöltése

```bash
git clone https://github.com/tothkevin-1/ktatasi-platform.git
cd ktatasi-platform
```

### 2. Ollama telepítése és modell letöltése

1. Töltsd le és telepítsd az Ollama-t: https://ollama.com
2. Nyiss egy parancssort és futtasd:

```bash
ollama pull llama3.2:3b
```

Ez kb. 2 GB letöltés — csak egyszer kell.

### 3. Backend telepítése

```bash
cd backend
python -m venv venv
```

**Windows:**
```bash
.\venv\Scripts\activate
```

**Mac/Linux:**
```bash
source venv/bin/activate
```

```bash
pip install django djangorestframework djangorestframework-simplejwt django-cors-headers pillow channels daphne requests chromadb sentence-transformers psycopg2-binary PyJWT
python manage.py migrate
python manage.py createsuperuser
```

A `createsuperuser` parancs bekéri a felhasználónevet, e-mailt és jelszót — ezzel fogsz bejelentkezni.

### 4. Frontend telepítése

Nyiss egy **új** parancssori ablakot:

```bash
cd frontend
npm install
```

---

## Indítás

Minden indításhoz **3 parancssori ablak** szükséges:

**1. ablak — Ollama:**
```bash
ollama serve
```

**2. ablak — Backend:**
```bash
cd backend
.\venv\Scripts\activate       # Windows
python manage.py runserver
```

**3. ablak — Frontend:**
```bash
cd frontend
npm start
```

Ezután nyisd meg a böngészőben: **http://localhost:3000**

---

## Bejelentkezés

A `createsuperuser` paranccsal létrehozott fiókkal jelentkezhetsz be.

A felhasználói szerepkört (diák / tanár / vezető) az admin felületen lehet beállítani:  
**http://localhost:8000/admin**

Új felhasználók létrehozásához is az admin felület használható.

---

## Az AI funkciók tesztelése

### AI Chat Asszisztens
- Bejelentkezés után a jobb alsó sarokban megjelenik egy kék AI gomb
- Kattints rá és tegyél fel kérdést pl: *"Mi a fotoszintézis?"* vagy *"Mikor találták fel az internetet?"*

### AI Kvíz generátor (csak tanároknak)
- Felső menüben: **Dolgozat**
- Válassz tantárgyat és kérdésszámot → **Kvíz generálása**
- Átnézés után: **Kiadás feladatként** → kurzus és határidő megadása

### AI Feladat értékelés
- Tanárként nyiss meg egy beadott feladatot → **AI javaslat** gomb
- Diákként beadás után → **AI visszajelzés kérése** gomb

### Közösségi Chat
- Felső menüben: **Chat**
- Valós idejű üzenetküldés WebSocket alapon

---

## Projekt struktúra

```
ktatasi-platform/
├── backend/
│   ├── api/
│   │   ├── models.py        # Adatmodellek
│   │   ├── views.py         # API végpontok + AI logika
│   │   ├── consumers.py     # WebSocket chat
│   │   ├── rag.py           # RAG rendszer (ChromaDB)
│   │   └── serializers.py   # API szerializálás
│   ├── core/
│   │   ├── settings.py      # Django konfiguráció
│   │   └── asgi.py          # WebSocket konfiguráció
│   └── tananyag/            # RAG tananyag fájlok
│       ├── biologia.txt
│       ├── foldrajz.txt
│       └── internet_tortenete.txt
└── frontend/
    └── src/
        ├── pages/           # Oldalak
        ├── components/      # Komponensek
        └── context/         # Auth + Notification
```

---

## Technológiai stack

| Réteg | Technológia |
|-------|------------|
| Backend | Django 5.2, Django REST Framework |
| Autentikáció | JWT (SimpleJWT) |
| WebSocket | Django Channels, Daphne |
| AI modell | Ollama (llama3.2:3b) |
| RAG | ChromaDB, sentence-transformers |
| Frontend | React 19, Material UI 7 |
| Adatbázis | SQLite (fejlesztés) |
