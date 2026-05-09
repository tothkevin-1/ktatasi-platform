from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
# 1. Importáld be az új modelleket is
from .models import CustomUser, Tantargy, Kurzus, Feladat, Beadas

# Ez a rész már megvolt a CustomUser-höz
class CustomUserAdmin(UserAdmin):
    model = CustomUser
    list_display = ('username', 'email', 'first_name', 'last_name', 'role', 'pontszam', 'is_staff')
    
    fieldsets = UserAdmin.fieldsets + (
            (None, {'fields': ('role',)}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
            (None, {'fields': ('role',)}),
    )


# Regisztráljuk a modelleket
admin.site.register(CustomUser, CustomUserAdmin)
admin.site.register(Tantargy)

# 2. Add hozzá ezt a három sort az új modellek regisztrálásához
admin.site.register(Kurzus)
admin.site.register(Feladat)
admin.site.register(Beadas)