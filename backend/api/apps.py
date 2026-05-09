from django.apps import AppConfig

class ApiConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'api'
    
    # EZT A RÉSZT ADD HOZZÁ:
    def ready(self):
        import api.signals