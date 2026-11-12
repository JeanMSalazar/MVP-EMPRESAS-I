import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { Presentation, PresentationFile } from '@oai/artifact-tool';

const workspaceDir='/home/jm-legion5/Proyects/ucsp/formacionDeEmpresas-I/MVP';
const SKILL_DIR='/home/jm-legion5/.codex/plugins/cache/openai-primary-runtime/presentations/26.1025.11240/skills/presentations';
const RUNTIME_PYTHON='/home/jm-legion5/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3';
const FINAL_PPTX=path.join(workspaceDir,'entregables/ManoCerca_avances_MVP_Vercel_movil_2026_v2.pptx');
const C={bg:'#FAF9F5',green:'#143F37',orange:'#EB805F',ink:'#183B35',muted:'#657D75'};
const FONT='Noto Sans';
const p=Presentation.create({slideSize:{width:1280,height:720}});

function tx(s,v,x,y,w,h,z=22,c=C.ink,b=false,align='left'){
 const o=s.shapes.add({geometry:'textbox',position:{left:x,top:y,width:w,height:h},fill:'none',line:{style:'solid',fill:'none',width:0}});
 o.text=v; o.text.style={typeface:FONT,fontSize:z,color:c,bold:b,alignment:align,wrap:true,verticalAlignment:'middle'}; return o;
}
function page(title,sub=''){
 const s=p.slides.add();s.background.fill=C.bg;
 tx(s,title,70,44,1135,58,36,C.green,true);
 if(sub)tx(s,sub,72,109,1130,56,19,C.muted);
 tx(s,'MANOCERCA  ·  AVANCES EN PRODUCCIÓN',72,678,700,22,12,C.muted,true);
 tx(s,String(p.slides.items.length).padStart(2,'0'),1173,678,37,22,12,C.muted,true,'right');
 return s;
}
async function img(s,name,x,y,h){
 const f=path.join(workspaceDir,'capturas-vercel',name);const b=await fs.readFile(f);
 s.images.add({blob:b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength),contentType:'image/jpeg',alt:`Captura móvil de ${name} en el sitio publicado de ManoCerca`,fit:'contain',position:{left:x,top:y,width:h*375/812,height:h}});
}
function blurb(s,h,b,x,y,w=500){tx(s,h,x,y,w,42,24,C.green,true);tx(s,b,x,y+48,w,105,20,C.ink);}
function cap(s,v,x,y,w=265){tx(s,v,x,y,w,30,14,C.muted,true);}

// 1
{
 const s=p.slides.add();s.background.fill=C.bg;
 tx(s,'MANOCERCA',76,68,615,65,49,C.green,true);
 tx(s,'Avances del MVP',76,151,590,74,44,C.orange,true);
 tx(s,'Frontend, backend y pantallas del entorno publicado',78,257,590,117,27,C.ink);
 tx(s,'Capturas móviles de la versión en Vercel',78,403,560,55,21,C.muted);
 tx(s,'Octubre de 2026',78,575,400,38,19,C.green,true);
 tx(s,'manocerca-mvp.vercel.app',78,623,500,33,18,C.muted);
 await img(s,'09-inicio-cliente.jpg',826,74,567);
 cap(s,'Portada para clientes · producción',806,647,350);
}
// 2
{
 const s=page('Qué funciona hoy','El sitio público está desplegado y conectado con Supabase.');
 blurb(s,'Versión publicada','La aplicación Angular se sirve desde Vercel. El dominio respondió correctamente durante esta revisión.',76,190,590);
 blurb(s,'Datos reales del piloto','La sesión abierta muestra 1 solicitud, 1 cotización y 0 servicios completados. La búsqueda muestra 1 maestro.',76,356,590);
 tx(s,'https://manocerca-mvp.vercel.app',76,565,640,55,27,C.orange,true);
 await img(s,'01-panel-cliente.jpg',878,176,454);
 cap(s,'Panel del cliente · producción',843,637,345);
}
// 3
{
 const s=page('Entradas para dos roles','El frontend ofrece páginas distintas para atraer clientes y maestros.');
 blurb(s,'Cliente','La portada permite iniciar una solicitud y explica la propuesta de valor del servicio.',72,208,458);
 blurb(s,'Maestro','La página profesional invita a crear un perfil y explica cómo recibir trabajos de la zona.',72,413,458);
 await img(s,'09-inicio-cliente.jpg',630,177,442);
 await img(s,'10-inicio-maestros.jpg',898,177,442);
 cap(s,'CLIENTE',656,628,215);cap(s,'MAESTRO',927,628,215);
}
// 4
{
 const s=page('Búsqueda de profesionales','El catálogo consulta la base de datos y devuelve perfiles del piloto.');
 blurb(s,'Filtros disponibles','Especialidad, distrito y disponibilidad permiten acotar la búsqueda desde el teléfono.',72,207,440);
 blurb(s,'Resultado en producción','La consulta devolvió un profesional de Electricidad con su zona y acceso al perfil.',72,414,440);
 await img(s,'05-explorar-filtros.jpg',615,177,440);
 await img(s,'04-explorar-resultados.jpg',896,177,440);
 cap(s,'FILTROS',640,628,220);cap(s,'RESULTADOS',919,628,220);
}
// 5
{
 const s=page('Perfil profesional','Cada maestro tiene una ficha pública para que el cliente evalúe su experiencia.');
 blurb(s,'Información visible','Oficio, distrito, años de experiencia, disponibilidad, calificación y trabajos completados.',78,207,650);
 blurb(s,'Acción principal','El cliente puede iniciar una solicitud dirigida al profesional desde esta ficha.',78,423,650);
 await img(s,'06-perfil-profesional.jpg',885,174,468);
 cap(s,'Perfil real del piloto · producción',839,648,362);
}
// 6
{
 const s=page('Publicar una solicitud','El cliente describe el trabajo y marca la ubicación en un mapa.');
 blurb(s,'Datos del trabajo','Oficio, título y descripción. Si se llega desde un perfil, la especialidad queda preseleccionada.',72,205,455);
 blurb(s,'Ubicación y evidencia','Leaflet muestra OpenStreetMap. El formulario admite fotos, urgencia y fecha preferida.',72,411,455);
 await img(s,'08-solicitud-formulario.jpg',625,178,441);
 await img(s,'07-solicitud-mapa-fotos.jpg',901,178,441);
 cap(s,'FORMULARIO',648,628,220);cap(s,'MAPA Y FOTOS',920,628,220);
}
// 7
{
 const s=page('Panel y avisos del cliente','El espacio personal reúne solicitudes y novedades del servicio.');
 blurb(s,'Resumen','El panel muestra el número de solicitudes, cotizaciones recibidas y servicios en el historial.',72,205,455);
 blurb(s,'Notificaciones','Una nueva propuesta aparece en la bandeja del usuario y enlaza con la solicitud.',72,411,455);
 await img(s,'01-panel-cliente.jpg',625,178,441);
 await img(s,'03-notificaciones.jpg',901,178,441);
 cap(s,'RESUMEN',650,628,220);cap(s,'NUEVA COTIZACIÓN',915,628,250);
}
// 8
{
 const s=page('Cotización recibida','La propuesta publicada muestra precio, descripción y decisión del cliente.');
 blurb(s,'Propuesta versionada','La tarjeta indica la versión de la cotización y el importe ofrecido por el maestro.',78,205,630);
 blurb(s,'Decisión del cliente','Aceptar o rechazar actualiza la solicitud mediante funciones transaccionales de PostgreSQL.',78,417,630);
 await img(s,'02-cotizacion-cliente.jpg',884,174,470);
 cap(s,'Cotización real del piloto · producción',844,648,363);
}
// 9
{
 const s=page('Frontend y frameworks','Web responsive desarrollada con Angular y TypeScript.');
 blurb(s,'Angular 21','Componentes standalone, rutas con Angular Router y estado con signals.',78,194,500);
 blurb(s,'Interfaz HTML y CSS','Diseño propio que adapta navegación, formularios y paneles a pantallas móviles.',78,355,500);
 blurb(s,'Mapas','Leaflet y OpenStreetMap permiten ubicar el servicio con un pin.',78,516,500);
 tx(s,'Angular Material está instalado, pero esta versión usa principalmente componentes y estilos propios.',685,258,485,130,25,C.green,true);
 tx(s,'La presentación usa capturas móviles tomadas directamente del sitio publicado en Vercel.',685,442,485,105,22,C.ink);
}
// 10
{
 const s=page('Backend: Supabase','Servicios administrados para ejecutar el MVP sin servidor propio.');
 blurb(s,'Autenticación','Supabase Auth gestiona cuentas de cliente y maestro con correo y contraseña.',76,193,500);
 blurb(s,'Datos y búsqueda','PostgreSQL almacena solicitudes, cotizaciones y servicios. PostGIS soporta distancia y zona.',76,353,500);
 blurb(s,'Archivos','Storage guarda fotos de solicitudes y medios del perfil profesional.',76,513,500);
 blurb(s,'Seguridad y estados','Políticas RLS delimitan el acceso. Funciones SQL gestionan propuestas, aceptación y avance.',665,193,520);
 blurb(s,'Notificaciones','Supabase Realtime actualiza la bandeja interna cuando ocurren eventos.',665,353,520);
 blurb(s,'Correo opcional','La Edge Function está preparada en código; el envío exige configurar proveedor y secretos.',665,513,520);
}
// 11
{
 const s=page('Arquitectura, pruebas y próximos pasos','Estado de la revisión del 28 de octubre de 2026.');
 blurb(s,'Arquitectura','Vercel entrega la aplicación Angular. El navegador se comunica con Supabase Cloud para Auth, datos y archivos.',76,195,520);
 blurb(s,'Verificación','La compilación de producción pasó. Las tres pruebas automatizadas pasaron. El dominio respondió HTTP 200.',76,401,520);
 blurb(s,'Siguiente iteración','Conectar el repositorio correcto a Vercel para despliegues automáticos y ampliar pruebas del flujo real.',665,195,510);
 blurb(s,'Alcance pendiente','Pagos integrados, chat, verificación de identidad y panel administrativo siguen fuera del MVP.',665,401,510);
 tx(s,'Demo en vivo: manocerca-mvp.vercel.app',79,616,1040,42,25,C.orange,true);
}

const {finalizePresentation}=await import(pathToFileURL(path.join(SKILL_DIR,'container_tools/artifact_tool_utils.mjs')).href);
const stagingDir=path.join(workspaceDir,'.codex-finalizer');await fs.mkdir(stagingDir,{recursive:true});
const candidatePath=path.join(stagingDir,'candidate-avances-vercel.pptx');
await (await PresentationFile.exportPptx(p)).save(candidatePath);
const result=await finalizePresentation({workspaceDir,candidatePath,finalPath:FINAL_PPTX,
 pythonExecutable:RUNTIME_PYTHON,
 integrityValidatorPath:path.join(SKILL_DIR,'container_tools/inspect_presentation_package_integrity.py'),
 layoutValidatorPath:path.join(SKILL_DIR,'container_tools/inspect_presentation_layout_geometry.py'),
 layoutArgs:['--expected-slide-size-emu','12192000,6858000','--validate-bullet-geometry','--validate-heading-fit'],
 requiredNativeTableOwnerSlides:[],fontPolicy:{basis:'design',families:[FONT]},verifyArtifactToolImport:true,
 receiptPath:path.join(stagingDir,'avances-vercel-v2.validation.json')});
console.log(JSON.stringify({slides:p.slides.items.length,final:FINAL_PPTX,layoutFindings:result.presentationLayout.findingCount},null,2));
