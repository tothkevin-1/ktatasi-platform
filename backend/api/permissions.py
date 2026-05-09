from rest_framework import permissions

class IsCourseTeacher(permissions.BasePermission):
    """
    Egyedi jogosultság, ami csak a kurzus tanárának engedélyezi
    a beadások értékelését.
    """

    def has_object_permission(self, request, view, obj):
        # Az 'obj' itt maga a 'Beadas' objektum, amit értékelni akarunk.
        # A kurzus tanára megegyezik a kérést küldő felhasználóval?
        # Biztonsági ellenőrzés: csak akkor fut le, ha az obj-nak van feladata, stb.
        if hasattr(obj, 'feladat') and hasattr(obj.feladat, 'kurzus'):
            return obj.feladat.kurzus.tanar == request.user
        return False

class IsTeacher(permissions.BasePermission):
    """
    Egyedi jogosultság, ami ellenőrzi, hogy a felhasználó tanár-e.
    """
    def has_permission(self, request, view):
        # A felhasználó be van jelentkezve ÉS a szerepköre 'tanar'?
        return request.user and request.user.is_authenticated and request.user.role == 'tanar'
    
class IsTeacherOrAdmin(permissions.BasePermission):
    """
    Jogosultság, ami ellenőrzi, hogy a felhasználó tanár vagy vezetőség tagja-e.
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and (request.user.role == 'tanar' or request.user.role == 'vezeto')