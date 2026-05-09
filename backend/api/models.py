from django.db import models
from django.contrib.auth.models import AbstractUser

class CustomUser(AbstractUser):
    ROLE_CHOICES = (
        ('diak', 'Diák'),
        ('tanar', 'Tanár'),
        ('vezeto', 'Vezetőség'),
    )
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, verbose_name="Szerepkör")
    pontszam = models.IntegerField(default=0, verbose_name="Pontszám")

class Tantargy(models.Model):
    # ... változatlan ...
    nev = models.CharField(max_length=255, verbose_name="Tantárgy neve")
    leiras = models.TextField(blank=True, null=True, verbose_name="Leírás")
    class Meta: verbose_name_plural = "Tantárgyak"
    def __str__(self): return self.nev

class Kurzus(models.Model):
    # ... változatlan ...
    tantargy = models.ForeignKey(Tantargy, on_delete=models.CASCADE, related_name='kurzusok')
    tanar = models.ForeignKey(CustomUser, on_delete=models.CASCADE, limit_choices_to={'role': 'tanar'}, related_name='oktatott_kurzusok')
    diakok = models.ManyToManyField(CustomUser, limit_choices_to={'role': 'diak'}, related_name='resztvett_kurzusok', blank=True)
    kurzus_neve = models.CharField(max_length=255, verbose_name="Kurzus neve (pl. 9.A Matek)")
    class Meta: verbose_name_plural = "Kurzusok"
    def __str__(self): return self.kurzus_neve

class Feladat(models.Model):
    TIPUS_CHOICES = (('szoveges', 'Szöveges'), ('kviz', 'Kvíz'))
    kurzus = models.ForeignKey(Kurzus, on_delete=models.CASCADE, related_name='feladatok')
    cim = models.CharField(max_length=255)
    leiras = models.TextField()
    letrehozas_datuma = models.DateTimeField(auto_now_add=True)
    hatarido = models.DateTimeField()
    tipus = models.CharField(max_length=10, choices=TIPUS_CHOICES, default='szoveges')
    kviz_kerdesek = models.JSONField(null=True, blank=True)
    class Meta: verbose_name_plural = "Feladatok"
    def __str__(self): return f"{self.kurzus.kurzus_neve} - {self.cim}"

class Beadas(models.Model):
    # ... változatlan ...
    feladat = models.ForeignKey(Feladat, on_delete=models.CASCADE, related_name='beadasok')
    diak = models.ForeignKey(CustomUser, on_delete=models.CASCADE, limit_choices_to={'role': 'diak'})
    beadas_datuma = models.DateTimeField(auto_now_add=True)
    szoveges_valasz = models.TextField(blank=True, null=True)
    erdemjegy = models.IntegerField(blank=True, null=True, verbose_name="Érdemjegy")
    tanari_visszajelzes = models.TextField(blank=True, null=True, verbose_name="Tanári visszajelzés")
    class Meta: verbose_name_plural = "Beadások"
    def __str__(self): return f"{self.diak.username} beadása a(z) {self.feladat.cim} feladatra"

class ChatUzenet(models.Model):
    felhasznalo = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    szoveg = models.TextField()
    letrehozva = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['letrehozva']

    def __str__(self):
        return f"{self.felhasznalo.username}: {self.szoveg[:30]}"

class Hir(models.Model):
    cim = models.CharField(max_length=255, verbose_name="Cím")
    tartalom = models.TextField(verbose_name="Tartalom")
    szerzo = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, verbose_name="Szerző")
    letrehozas_datuma = models.DateTimeField(auto_now_add=True)
    modositas_datuma = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = "Hírek"
        ordering = ['-letrehozas_datuma'] # A legfrissebb legyen elöl

    def __str__(self):
        return self.cim