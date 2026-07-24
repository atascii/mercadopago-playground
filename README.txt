
## Configuración

1. Dentro del archivo .env, completar el access token que se genera al crear
   las credenciales de la aplicación (en Tus Integraciones de Mercado Pago):

   MP_ACCESS_TOKEN=...

## Levantar la aplicación

Abrir una primera terminal:

- Instalar dependencias: npm install
- Ejecutar la aplicación: npm start

Esto levanta un servidor Express (server/server.js) en el puerto 3000
y el front (Vite) en el puerto 5173.

Acceder por navegador a http://localhost:5173

## Exponer el servidor con ngrok

Abrir una segunda terminal y ejecutar:

ngrok http 3000

(Instalarlo desde https://ngrok.com/use-cases/share-localhost)

Esta herramienta expone el puerto 3000 de manera pública en internet.
Copiar la URL "Forwarding" y en server.js asignarla a la variable backUrlsDomain.
Por ejemplo:

const backUrlsDomain = "https://f35a-181-99-160-130.ngrok-free.app"

Esto es necesario para que Mercado Pago pueda enviar las notificaciones webhook
y para que las back_urls de redirección funcionen correctamente.
