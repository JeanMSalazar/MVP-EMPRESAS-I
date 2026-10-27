# ManoCerca — MVP de servicios para el hogar

Marketplace web responsive para Arequipa. Un cliente publica una solicitud, un maestro envía una cotización, el cliente la acepta, se realiza el servicio y ambos pueden calificarlo. El proyecto usa **Angular 21** y **Supabase**; Vercel sirve el frontend estático.

## Probar el mockup ahora

```bash
npm ci
npm start
```

Abre `http://localhost:4200`. Sin variables de Supabase se activa el **modo demostración**: en **Ingresar** puedes entrar como cliente o maestro sin contraseña. Los cambios se guardan en `localStorage` del navegador. Hay una solicitud con una cotización pendiente y un servicio completado para mostrar el flujo. Son datos ficticios.

Recorrido recomendado para capturas:

1. Portada de clientes (`/`) y portada de maestros (`/maestros`).
2. Explorar maestros (`/explorar`) y abrir un perfil.
3. Ingresar como cliente, abrir **Mi espacio** y la solicitud «Reparar fuga bajo el lavadero».
4. Aceptar la cotización; luego entrar como maestro para marcar **en camino** y **completado**.
5. Volver a cliente, dejar una reseña y revisar el historial. También puedes crear una solicitud con mapa y fotos.

El modo demo es solo para presentaciones. Para un piloto con usuarios reales hay que configurar Supabase siguiendo los pasos siguientes.

## Configurar Supabase

1. Crea un proyecto Supabase y ejecuta **todo el contenido actualizado** de [`supabase/migrations/202609290001_mvp.sql`](supabase/migrations/202609290001_mvp.sql) en el SQL Editor. La migración crea PostGIS, tablas, políticas RLS, Storage privado y funciones para cotizaciones y estados. Si una ejecución anterior falló, vuelve a ejecutar el archivo completo; la migración se puede reintentar.
2. En **Authentication → Sign In / Providers**, permite registro con correo y contraseña y mantén **Confirm email** activado. En **Authentication → URL Configuration**, el proyecto usa `https://manocerca-mvp.vercel.app` como **Site URL**. Las **Redirect URLs** incluyen ese dominio y `http://localhost:4200` para desarrollo local. La app avisa al usuario que debe confirmar el correo antes de ingresar.
3. Copia `.env.example` a `.env` para desarrollo local y configura estas variables. En Vercel, agrégalas en **Environment Variables**:

   | Variable | Valor |
   |---|---|
   | `SUPABASE_URL` | URL del proyecto (`https://...supabase.co`) |
   | `SUPABASE_PUBLISHABLE_KEY` | Clave pública `sb_publishable_...` |

   Nunca uses `service_role` ni una clave secreta en el frontend. `scripts/write-config.mjs` genera la configuración pública durante `npm start` y `npm run build`. El archivo generado se ignora en Git.
4. Ejecuta `npm run build` y prueba el registro de cliente y maestro con correos que puedas confirmar. Si publicas desde Vercel, añade tu dominio a **Authentication → URL Configuration** de Supabase.

El mapa usa Leaflet + OpenStreetMap y se centra en Arequipa. La búsqueda real usa `search_professionals` con PostGIS, filtros y orden por reputación. Las fotos de solicitudes se almacenan en un bucket privado y se muestran con URLs firmadas de una hora. Las fotos de perfil y portafolio son públicas porque forman parte del perfil visible del maestro.

## Desplegar en Vercel

El MVP está publicado en [manocerca-mvp.vercel.app](https://manocerca-mvp.vercel.app) dentro del proyecto `mvp-fei/manocerca-mvp`. [`vercel.json`](vercel.json) fija el comando `npm run build`, el directorio `dist/hogar-cerca/browser` y la redirección de rutas de Angular. Las variables `SUPABASE_URL` y `SUPABASE_PUBLISHABLE_KEY` están configuradas para Production y Preview. El nombre anterior `SUPABASE_ANON_KEY` también se acepta por compatibilidad.

El proyecto de Vercel se desplegó desde esta carpeta con la CLI; todavía no está conectado a un repositorio Git para despliegues automáticos. Para publicar cambios desde el checkout vinculado, ejecuta `npx vercel@latest deploy --prod --scope mvp-fei`. Los archivos `.env*` y la configuración generada se excluyen de la subida con [`.vercelignore`](.vercelignore).

Node.js 22.12 o posterior es compatible con la versión Angular usada aquí. Se recomienda fijar Node 22 en la configuración del proyecto Vercel.

## Email opcional

Las notificaciones internas se actualizan en tiempo real al aplicar la migración. Para enviar también email:

1. Verifica un dominio en Resend y configura los secretos `RESEND_API_KEY`, `EMAIL_FROM` y `NOTIFICATION_WEBHOOK_SECRET` en Supabase Edge Functions.
2. Despliega `supabase/functions/send-notification-email` con `supabase functions deploy send-notification-email --no-verify-jwt`.
3. Crea un **Database Webhook** sobre `public.notifications`, evento `INSERT`, dirigido a la URL de esa Edge Function. Añade la cabecera `x-webhook-secret` con el mismo secreto configurado en la función.

La función busca la notificación y el correo del destinatario del lado del servidor. El frontend nunca recibe la clave de Resend. Sin esta configuración, la bandeja interna sigue operativa y no se envían emails.

## Alcance y límites del MVP

Incluye landings duales, perfiles con foto y portafolio, solicitudes con fotos y pin, filtrado, cotizaciones versionadas, seguimiento, reseñas bilaterales solo después de completar, historial, recontratación, incidencias y notificaciones internas. No incluye pagos, chat, verificación de identidad ni panel administrativo, según [`MODULES.md`](MODULES.md) y [`roadmap.md`](roadmap.md). El equipo puede revisar incidencias desde Supabase Studio.

El SQL de Supabase es la fuente de verdad del esquema y las políticas. Se eligieron migraciones SQL en vez de ejecutar Prisma en el navegador: PostGIS, RLS y las transiciones transaccionales necesitan funciones de PostgreSQL. No hay un servidor propio en el MVP.

## Comandos

| Comando | Uso |
|---|---|
| `npm start` | Servidor local |
| `npm run build` | Build de producción |
| `npm test` | Pruebas Angular |
# MVP-EMPRESAS-I
