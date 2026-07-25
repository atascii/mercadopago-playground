
## Configuración y puesta en marcha

1. Instalar las dependencias una sola vez:

   npm install

2. Copiar el archivo `.env.example` como `.env` y completar el access token
   de prueba que se genera en Tus Integraciones de Mercado Pago:

   MP_ACCESS_TOKEN=...

3. En una primera terminal, iniciar ngrok antes de la aplicación:

   ngrok http 3000

   (Instalarlo desde https://ngrok.com/use-cases/share-localhost)

4. Copiar la URL HTTPS `Forwarding` que muestra ngrok y asignarla a
   `MP_PUBLIC_BASE_URL` dentro de `.env`:

   Ejemplo:
   MP_PUBLIC_BASE_URL=https://tu-subdominio.ngrok-free.app

5. En una segunda terminal, iniciar la aplicación:

   npm start

Esto levanta el servidor Express en el puerto 3000 y el frontend Vite en el
puerto 5173. Accedé desde el navegador a http://localhost:5173.

Si reiniciás ngrok y cambia su URL, actualizá `MP_PUBLIC_BASE_URL` en `.env` y
reiniciá `npm start` para que el servidor lea el nuevo valor.

La URL pública es necesaria para que Mercado Pago pueda enviar los webhooks y
para que funcionen las `back_urls` de redirección.
