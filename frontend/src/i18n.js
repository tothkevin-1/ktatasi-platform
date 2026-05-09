import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  hu: {
    translation: {
      "oktatasi_platform": "Oktatási Platform",
      "hirek": "Hírek",
      "jegyek": "Jegyek",
      "kurzusaim": "Kurzusaim",
      "ranglista": "Ranglista",
      "bejelentkezes": "Bejelentkezés",
      "kijelentkezes": "Kijelentkezés",
      "profil": "Profil",
      "beallitasok": "Beállítások",
      "udv": "Üdvözlünk",
      
      // Login oldal
      "login_cim": "Bejelentkezés",
      "felhasznalonev": "Felhasználónév",
      "jelszo": "Jelszó",
      "gomb_bejelentkezes": "Bejelentkezés",

      // Dashboard / Dicsőségfal
      "dicsosegfal_cim": "Dicsőségfal",
      "ev_diakja": "Az Év Diákja",
      "honap_diakja": "A Hónap Diákja",
      "nincs_helyezett": "Még nincs helyezett",
      "pont": "Pont",
      "kozelgo_hataridok": "Közelgő Határidők",
      "hatarido": "Határidő",
      "nincs_kozelgo_feladat": "Nincsenek közelgő határidőid. Szép munka!",
      "ertekelendo_kurzusok": "Értékelésre Váró Kurzusok",
      "db_ertekelendo_beadas": "db értékelésre váró beadás",
      "nincs_ertekelendo_beadas": "Nincs értékelésre váró beadás. Jó pihenést!",
      "vezeto_fejlesztes_alatt": "Vezetői nézet fejlesztés alatt...",

      // Digitális Napló (Jegyek)
      "digitalis_naplo": "Digitális Napló",
      "naplo_leiras": "Itt láthatod a tantárgyaidat, a megszerzett jegyeket és az átlagodat. Vidd az egeret egy jegy fölé a részletekért!",
      "tanulmanyi_osszatlag": "Tanulmányi Összátlag",
      "tanar": "Tanár",
      "atlag": "Átlag",
      "nincs_jegy": "Még nincsenek rögzített érdemjegyeid.",
      "datum": "Dátum",

      // Ranglista
      "ranglista_cim": "Ranglista (Top 10)",
      "nincs_ranglista_adat": "A ranglista betöltése nem sikerült vagy nincsenek adatok.",

      // Hírek
      "hirek_cim": "Hírek és Közlemények",
      "publikalva": "Publikálva",
      "szerzo": "Szerző",
      "ismeretlen": "Ismeretlen",
      "nincsenek_hirek": "Jelenleg nincsenek hírek.",
      "uj_hir_kozzetetele": "Új Hír Közzététele",
      "hir_cime": "Hír Címe",
      "tartalom": "Tartalom",
      "kozzetetel": "Közzététel",
      "minden_mezot_ki_kell_tolteni": "Minden mezőt ki kell tölteni!",
      "hir_sikeresen_kozzeteve": "Hír sikeresen közzétéve!",
      "hir_hiba": "Hiba történt a hír közzétételekor.",

      // --- ÚJ: Profil ---
      "szerepkor_diak": "Diák",
      "szerepkor_tanar": "Tanár",
      "szerepkor_vezeto": "Vezetőség",
      "teljesitmeny": "Teljesítmény",
      "osszegyujtott_pontok": "Összegyűjtött pontok",
      "hely": "Hely",
      "nincs_top10": "Nincs a Top 10-ben",
      "helyezes_ranglistan": "Helyezés a ranglistán",

      // --- ÚJ: Beállítások ---
      "jelszo_megvaltoztatasa": "Jelszó megváltoztatása",
      "regi_jelszo": "Régi jelszó",
      "uj_jelszo": "Új jelszó (min. 8 karakter)",
      "uj_jelszo_megerositese": "Új jelszó megerősítése",
      "jelszo_mentese": "Jelszó mentése",
      "jelszo_sikeres": "Jelszó sikeresen megváltoztatva!",
      "hiba": "Hiba"
    }
  },
  ro: {
    translation: {
      "oktatasi_platform": "Platformă Educațională",
      "hirek": "Noutăți",
      "jegyek": "Note",
      "kurzusaim": "Cursurile Mele",
      "ranglista": "Clasament",
      "bejelentkezes": "Autentificare",
      "kijelentkezes": "Deconectare",
      "profil": "Profil",
      "beallitasok": "Setări",
      "udv": "Salut",
      
      "login_cim": "Autentificare",
      "felhasznalonev": "Nume de utilizator",
      "jelszo": "Parolă",
      "gomb_bejelentkezes": "Conectare",

      "dicsosegfal_cim": "Panoul de Onoare",
      "ev_diakja": "Elevul Anului",
      "honap_diakja": "Elevul Lunii",
      "nincs_helyezett": "Niciun elev clasat",
      "pont": "Puncte",
      "kozelgo_hataridok": "Termene limită viitoare",
      "hatarido": "Termen limită",
      "nincs_kozelgo_feladat": "Nu ai termene limită viitoare. Bună treabă!",
      "ertekelendo_kurzusok": "Cursuri care așteaptă evaluare",
      "db_ertekelendo_beadas": "trimiteri în așteptarea evaluării",
      "nincs_ertekelendo_beadas": "Fără trimiteri de evaluat. Odihnește-te!",
      "vezeto_fejlesztes_alatt": "Vizualizare admin în dezvoltare...",

      "digitalis_naplo": "Catalog Digital",
      "naplo_leiras": "Aici poți vedea materiile, notele obținute și media. Treci cu mouse-ul peste o notă pentru detalii!",
      "tanulmanyi_osszatlag": "Media Generală",
      "tanar": "Profesor",
      "atlag": "Media",
      "nincs_jegy": "Încă nu există note înregistrate.",
      "datum": "Data",

      "ranglista_cim": "Clasament (Top 10)",
      "nincs_ranglista_adat": "Încărcarea clasamentului a eșuat sau nu există date.",

      "hirek_cim": "Știri și Anunțuri",
      "publikalva": "Publicat",
      "szerzo": "Autor",
      "ismeretlen": "Necunoscut",
      "nincsenek_hirek": "În prezent nu există știri.",
      "uj_hir_kozzetetele": "Publică o știre nouă",
      "hir_cime": "Titlul știrii",
      "tartalom": "Conținut",
      "kozzetetel": "Publică",
      "minden_mezot_ki_kell_tolteni": "Toate câmpurile trebuie completate!",
      "hir_sikeresen_kozzeteve": "Știre publicată cu succes!",
      "hir_hiba": "A apărut o eroare la publicarea știrii.",

      // --- ÚJ: Profil ---
      "szerepkor_diak": "Elev",
      "szerepkor_tanar": "Profesor",
      "szerepkor_vezeto": "Conducere",
      "teljesitmeny": "Performanță",
      "osszegyujtott_pontok": "Puncte acumulate",
      "hely": "Locul",
      "nincs_top10": "Nu este în Top 10",
      "helyezes_ranglistan": "Locul în clasament",

      // --- ÚJ: Beállítások ---
      "jelszo_megvaltoztatasa": "Schimbare parolă",
      "regi_jelszo": "Parolă veche",
      "uj_jelszo": "Parolă nouă (min. 8 caractere)",
      "uj_jelszo_megerositese": "Confirmare parolă nouă",
      "jelszo_mentese": "Salvează parola",
      "jelszo_sikeres": "Parola a fost schimbată cu succes!",
      "hiba": "Eroare"
    }
  },
  en: {
    translation: {
      "oktatasi_platform": "Education Platform",
      "hirek": "News",
      "jegyek": "Grades",
      "kurzusaim": "My Courses",
      "ranglista": "Leaderboard",
      "bejelentkezes": "Login",
      "kijelentkezes": "Logout",
      "profil": "Profile",
      "beallitasok": "Settings",
      "udv": "Welcome",
      
      "login_cim": "Login",
      "felhasznalonev": "Username",
      "jelszo": "Password",
      "gomb_bejelentkezes": "Sign In",

      "dicsosegfal_cim": "Wall of Fame",
      "ev_diakja": "Student of the Year",
      "honap_diakja": "Student of the Month",
      "nincs_helyezett": "No ranked student yet",
      "pont": "Points",
      "kozelgo_hataridok": "Upcoming Deadlines",
      "hatarido": "Deadline",
      "nincs_kozelgo_feladat": "No upcoming deadlines. Good job!",
      "ertekelendo_kurzusok": "Courses pending evaluation",
      "db_ertekelendo_beadas": "submissions pending evaluation",
      "nincs_ertekelendo_beadas": "No submissions to evaluate. Rest well!",
      "vezeto_fejlesztes_alatt": "Admin view under development...",

      "digitalis_naplo": "Digital Diary",
      "naplo_leiras": "Here you can see your subjects, acquired grades and average. Hover over a grade for details!",
      "tanulmanyi_osszatlag": "Overall Average",
      "tanar": "Teacher",
      "atlag": "Average",
      "nincs_jegy": "No grades recorded yet.",
      "datum": "Date",

      "ranglista_cim": "Leaderboard (Top 10)",
      "nincs_ranglista_adat": "Failed to load leaderboard or no data available.",

      "hirek_cim": "News and Announcements",
      "publikalva": "Published",
      "szerzo": "Author",
      "ismeretlen": "Unknown",
      "nincsenek_hirek": "There is no news at the moment.",
      "uj_hir_kozzetetele": "Publish New News",
      "hir_cime": "News Title",
      "tartalom": "Content",
      "kozzetetel": "Publish",
      "minden_mezot_ki_kell_tolteni": "All fields must be filled!",
      "hir_sikeresen_kozzeteve": "News published successfully!",
      "hir_hiba": "An error occurred while publishing the news.",

      // --- ÚJ: Profil ---
      "szerepkor_diak": "Student",
      "szerepkor_tanar": "Teacher",
      "szerepkor_vezeto": "Administration",
      "teljesitmeny": "Performance",
      "osszegyujtott_pontok": "Collected points",
      "hely": "Place",
      "nincs_top10": "Not in Top 10",
      "helyezes_ranglistan": "Leaderboard ranking",

      // --- ÚJ: Beállítások ---
      "jelszo_megvaltoztatasa": "Change Password",
      "regi_jelszo": "Old password",
      "uj_jelszo": "New password (min. 8 characters)",
      "uj_jelszo_megerositese": "Confirm new password",
      "jelszo_mentese": "Save password",
      "jelszo_sikeres": "Password changed successfully!",
      "hiba": "Error"
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "hu", 
    fallbackLng: "hu", 
    interpolation: {
      escapeValue: false 
    }
  });

export default i18n;