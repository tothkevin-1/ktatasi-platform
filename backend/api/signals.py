from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Beadas, CustomUser

# A receiver (fogadó) egy dekorátor. Ez a függvény akkor fut le,
# ha a post_save jel érkezik a Beadas modellből.
@receiver(post_save, sender=Beadas)
def update_user_points_on_submission(sender, instance, created, **kwargs):
    # Csak akkor fut le, ha egy ÚJ Beadas objektumot hoztak létre
    if created:
        # A pontszám, amit a diák kap a beadásért (pl. 10 pont)
        PONT_ERTEK = 10 
        
        # Lekérjük a beadást végző felhasználót
        user = instance.diak
        
        # Csak diákoknak adjunk pontot
        if user.role == 'diak':
            # Frissítjük a felhasználó pontszámát
            user.pontszam += PONT_ERTEK
            user.save()

            # Opcionális: a konzolon jelzi, hogy a pontszám frissült
            print(f"DEBUG: {user.username} pontszáma frissült: +{PONT_ERTEK} pont.")