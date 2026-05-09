import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from rest_framework_simplejwt.tokens import AccessToken
from django.contrib.auth import get_user_model

User = get_user_model()

class ChatConsumer(AsyncWebsocketConsumer):
    GROUP_NAME = 'global_chat'

    async def connect(self):
        token = self.scope['query_string'].decode().replace('token=', '')
        self.user = await self.get_user(token)

        if self.user is None:
            await self.close()
            return

        await self.channel_layer.group_add(self.GROUP_NAME, self.channel_name)
        await self.accept()

        # Elküldjük az utolsó 30 üzenetet
        for uzenet in await self.get_regi_uzenetek():
            await self.send(text_data=json.dumps(uzenet))

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.GROUP_NAME, self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)
        szoveg = data.get('szoveg', '').strip()
        if not szoveg:
            return

        uzenet = await self.uzenet_mentese(szoveg)
        await self.channel_layer.group_send(
            self.GROUP_NAME,
            {'type': 'chat_message', 'uzenet': uzenet}
        )

    async def chat_message(self, event):
        await self.send(text_data=json.dumps(event['uzenet']))

    @database_sync_to_async
    def get_user(self, token):
        try:
            validated = AccessToken(token)
            return User.objects.get(id=validated['user_id'])
        except Exception:
            return None

    @database_sync_to_async
    def get_regi_uzenetek(self):
        from .models import ChatUzenet
        uzenetek = ChatUzenet.objects.select_related('felhasznalo').order_by('-letrehozva')[:30]
        return [
            {
                'id': u.id,
                'felhasznalo': u.felhasznalo.first_name or u.felhasznalo.username,
                'felhasznalo_id': u.felhasznalo.id,
                'szoveg': u.szoveg,
                'ido': u.letrehozva.strftime('%H:%M'),
            }
            for u in reversed(list(uzenetek))
        ]

    @database_sync_to_async
    def uzenet_mentese(self, szoveg):
        from .models import ChatUzenet
        u = ChatUzenet.objects.create(felhasznalo=self.user, szoveg=szoveg)
        return {
            'id': u.id,
            'felhasznalo': self.user.first_name or self.user.username,
            'felhasznalo_id': self.user.id,
            'szoveg': szoveg,
            'ido': u.letrehozva.strftime('%H:%M'),
        }
