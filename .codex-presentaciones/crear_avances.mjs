import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { Presentation, PresentationFile } from '@oai/artifact-tool';

const workspaceDir = '/home/jm-legion5/Proyects/ucsp/formacionDeEmpresas-I/MVP';
const SKILL_DIR = '/home/jm-legion5/.codex/plugins/cache/openai-primary-runtime/presentations/26.1025.11240/skills/presentations';
const RUNTIME_PYTHON = '/home/jm-legion5/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3';
const FINAL_PPTX = path.join(workspaceDir, 'entregables/ManoCerca_avances_MVP_octubre_2026_v2.pptx');
const buildDir = path.join(workspaceDir, '.codex-presentaciones');
await fs.mkdir(buildDir, { recursive: true });
await fs.mkdir(path.dirname(FINAL_PPTX), { recursive: true });

const C = {
  bg: '#FAF9F5', green: '#143F37', green2: '#21665A', orange: '#EB805F',
  ink: '#183B35', muted: '#667D75', line: '#D6DFD8', white: '#FFFFFF',
};
const FONT = 'Noto Sans';
const p = Presentation.create({ slideSize: { width: 1280, height: 720 } });

function txt(slide, value, x, y, w, h, size = 22, color = C.ink, bold = false, align = 'left') {
  const shape = slide.shapes.add({
    geometry: 'textbox', position: { left: x, top: y, width: w, height: h },
    fill: 'none', line: { style: 'solid', fill: 'none', width: 0 },
  });
  shape.text = value;
  shape.text.style = { typeface: FONT, fontSize: size, color, bold, alignment: align,
    verticalAlignment: 'middle', wrap: true };
  return shape;
}
function slide(title, subtitle = '') {
  const s = p.slides.add(); s.background.fill = C.bg;
  txt(s, title, 66, 45, 1125, 60, 37, C.green, true);
  if (subtitle) txt(s, subtitle, 68, 108, 1120, 52, 19, C.muted);
  const n = String(p.slides.items.length).padStart(2, '0');
  txt(s, `MANOCERCA  ·  AVANCES DEL MVP`, 68, 671, 700, 25, 12, C.muted, true);
  txt(s, n, 1176, 671, 38, 25, 12, C.muted, true, 'right');
  return s;
}
async function shot(s, file, x, y, w, h, alt) {
  const b = await fs.readFile(path.join(workspaceDir, 'mockups', file));
  s.images.add({ blob: b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength),
    contentType: 'image/jpeg', alt, fit: 'contain', position: {left:x,top:y,width:w,height:h} });
}
function label(s, value, x, y, w) { txt(s, value, x, y, w, 25, 14, C.muted, true); }
function bullet(s, heading, body, x, y, w=500) {
  txt(s, heading, x, y, w, 35, 22, C.green, true);
  txt(s, body, x, y+36, w, 78, 19, C.ink);
}

// 1. Portada
{
  const s=p.slides.add(); s.background.fill=C.bg;
  txt(s, 'MANOCERCA', 70, 65, 570, 63, 49, C.green, true);
  txt(s, 'Avances del MVP', 70, 145, 550, 76, 43, C.orange, true);
  txt(s, 'Marketplace web de servicios para el hogar en Arequipa', 72, 240, 505, 93, 25, C.ink);
  txt(s, 'Frontend, backend, funcionalidades y despliegue', 72, 370, 505, 66, 21, C.muted);
  txt(s, 'Octubre de 2026', 72, 595, 350, 34, 18, C.green, true);
  txt(s, 'manocerca-mvp.vercel.app', 72, 635, 480, 30, 17, C.muted);
  await shot(s,'01-inicio-cliente.jpg',620,80,605,525,'Portada de clientes de ManoCerca en modo demo');
  label(s,'Captura de interfaz · modo demostración',706,611,500);
}
// 2. Estado
{
  const s=slide('Estado actual del proyecto','El MVP ya permite recorrer el servicio completo con dos roles.');
  bullet(s,'Frontend publicado','Angular 21 en Vercel. La página pública responde y las rutas cargan correctamente.',70,205,530);
  bullet(s,'Backend conectado','Supabase ofrece autenticación, base de datos, archivos y notificaciones.',70,340,530);
  bullet(s,'Flujo funcional','Cliente y maestro pueden completar solicitud, cotización, aceptación, servicio y reseña.',70,475,530);
  await shot(s,'03-explorar.jpg',650,205,555,360,'Exploración de maestros en modo demo');
  label(s,'Captura de interfaz · modo demostración',750,573,450);
}
// 3. Alcance
{
  const s=slide('Ámbito del MVP','Piloto web responsive enfocado en la contratación de un servicio del hogar.');
  const rows=[
    ['01','Cliente publica','Describe el trabajo, ubica el servicio y añade fotos.'],
    ['02','Maestro cotiza','Consulta solicitudes de su oficio y envía precio y alcance.'],
    ['03','Cliente decide','Acepta o rechaza una cotización.'],
    ['04','Se realiza el trabajo','El maestro informa el avance y marca la finalización.'],
    ['05','Ambos califican','La reseña aparece después de completar el servicio.'],
  ];
  rows.forEach((r,i)=>{const y=186+i*89; txt(s,r[0],78,y,65,44,29,C.orange,true);
    txt(s,r[1],155,y,340,39,23,C.green,true); txt(s,r[2],495,y+2,700,53,19,C.ink);});
}
// 4. público
{
  const s=slide('Frontend público','Dos páginas de entrada y un catálogo para descubrir profesionales.');
  await shot(s,'02-inicio-maestros.jpg',67,187,540,340,'Inicio para maestros');
  await shot(s,'03-explorar.jpg',672,187,540,340,'Listado de maestros');
  label(s,'INICIO PARA MAESTROS',75,548,530); label(s,'EXPLORAR PROFESIONALES',680,548,530);
  txt(s,'La portada comunica el valor para cada rol. Los filtros permiten buscar por especialidad, distrito y disponibilidad.',74,588,1125,56,20,C.ink);
  label(s,'Capturas de interfaz · modo demostración',75,645,610);
}
// 5. cliente solicitud
{
  const s=slide('Cliente: publicar una solicitud','La interfaz recoge la necesidad y la ubicación del trabajo. Capturas del modo demostración.');
  await shot(s,'08-nueva-solicitud.jpg',67,180,545,345,'Formulario de solicitud');
  await shot(s,'09-solicitud-mapa-fotos.jpg',667,180,545,345,'Mapa y fotos en solicitud');
  label(s,'DESCRIPCIÓN DEL TRABAJO',75,544,520); label(s,'MAPA Y FOTOS',675,544,520);
  txt(s,'El cliente elige oficio, explica el problema y marca un punto en Leaflet con OpenStreetMap. Las fotos se guardan en Supabase Storage.',74,584,1120,72,19,C.ink);
}
// 6. cliente contratación
{
  const s=slide('Cliente: cotizar y contratar','El panel reúne solicitudes, propuestas y estados de cada servicio. Capturas del modo demostración.');
  await shot(s,'07-panel-cliente.jpg',67,180,545,345,'Panel de cliente');
  await shot(s,'10-detalle-cotizacion.jpg',667,180,545,345,'Detalle de cotización');
  label(s,'MIS SOLICITUDES',75,544,520); label(s,'DECISIÓN SOBRE LA COTIZACIÓN',675,544,520);
  txt(s,'Una nueva propuesta muestra precio y alcance. Los cambios de precio crean una versión nueva de la cotización.',74,584,1110,65,20,C.ink);
}
// 7. maestro
{
  const s=slide('Maestro: responder y ejecutar','El profesional atiende solicitudes de su especialidad y actualiza el servicio. Capturas del modo demostración.');
  await shot(s,'12-panel-maestro.jpg',67,180,545,345,'Panel del maestro');
  await shot(s,'13-cotizacion-maestro.jpg',667,180,545,345,'Formulario de cotización');
  label(s,'BANDEJA DE TRABAJOS',75,544,520); label(s,'PROPUESTA DE PRECIO Y ALCANCE',675,544,520);
  txt(s,'El maestro envía la propuesta desde el detalle de la solicitud y continúa con el seguimiento cuando el cliente la acepta.',74,584,1110,65,20,C.ink);
}
// 8. cierre
{
  const s=slide('Seguimiento y cierre','El estado del servicio queda visible para ambos usuarios. Capturas del modo demostración.');
  await shot(s,'21-seguimiento-maestro.jpg',67,180,545,345,'Seguimiento del servicio');
  await shot(s,'23-resena-maestro.jpg',667,180,545,345,'Reseña del servicio');
  label(s,'SEGUIMIENTO',75,544,520); label(s,'RESEÑA POSTERIOR',675,544,520);
  txt(s,'Al terminar, el cliente y el maestro pueden dejar reseñas. El historial facilita volver a contratar y los avisos muestran cambios relevantes.',74,584,1110,70,19,C.ink);
}
// 9. stack frontend
{
  const s=slide('Frontend y frameworks','Interfaz web responsive construida en TypeScript.');
  bullet(s,'Angular 21','Componentes standalone, Angular Router y signals organizan vistas y estado.',78,202,510);
  bullet(s,'HTML y CSS','Diseño propio, adaptable a escritorio y móvil. Angular Material está instalado, pero aún no define la interfaz.',78,355,510);
  bullet(s,'Leaflet y OpenStreetMap','El cliente marca en el mapa la ubicación de la solicitud.',78,508,510);
  await shot(s,'04-perfil-maestro.jpg',655,215,550,355,'Perfil de profesional');
  label(s,'Perfil público · captura en modo demostración',700,582,500);
}
// 10. backend
{
  const s=slide('Backend y datos: Supabase','El MVP usa servicios administrados; no requiere servidor propio.');
  const x1=75,x2=665;
  bullet(s,'Auth','Correo y contraseña para los roles de cliente y maestro. La confirmación de correo está activa.',x1,196,500);
  bullet(s,'PostgreSQL + PostGIS','Tablas relacionales y búsqueda de maestros por especialidad, zona y distancia.',x1,345,500);
  bullet(s,'Storage','Fotos privadas de solicitudes y medios públicos de perfiles profesionales.',x1,494,500);
  bullet(s,'RLS y funciones SQL','Políticas por participante y funciones para cotizar, decidir y cambiar estados.',x2,196,500);
  bullet(s,'Notificaciones','Bandeja interna con eventos en tiempo real mediante Supabase Realtime.',x2,345,500);
  bullet(s,'Edge Function opcional','El envío de correos está preparado en código y requiere configurar proveedor y secretos.',x2,494,500);
}
// 11. arquitectura
{
  const s=slide('Arquitectura y despliegue','La aplicación está publicada en Vercel y consulta Supabase Cloud.');
  txt(s,'Navegador del usuario',75,216,330,50,26,C.green,true);
  txt(s,'Interfaz Angular · cliente y maestro',75,271,330,62,20,C.ink);
  txt(s,'Vercel',475,216,290,50,26,C.green,true);
  txt(s,'Sirve los archivos del frontend y redirige las rutas de la SPA.',475,271,290,100,20,C.ink);
  txt(s,'Supabase Cloud',825,216,355,50,26,C.green,true);
  txt(s,'Auth, PostgreSQL, PostGIS, Storage, funciones SQL y Realtime.',825,271,355,105,20,C.ink);
  txt(s,'manocerca-mvp.vercel.app',75,458,960,54,31,C.orange,true);
  txt(s,'Despliegue actual por CLI. La conexión Git para publicación automática queda como siguiente paso.',75,531,1100,84,21,C.ink);
}
// 12. evidencia y próximos pasos
{
  const s=slide('Avance comprobado y siguiente iteración','Estado de la entrega al 28 de octubre de 2026.');
  bullet(s,'Comprobado','Build de producción correcto. Tres pruebas automatizadas pasan. La URL pública respondió HTTP 200.',78,200,525);
  bullet(s,'Validación funcional','El flujo con Supabase fue probado con cuentas de cliente y maestro. La página pública mostró un profesional real.',78,393,525);
  bullet(s,'Siguiente paso','Conectar el repositorio correcto a Vercel para desplegar automáticamente y ampliar las pruebas del flujo real.',670,200,530);
  bullet(s,'Fuera de este MVP','Pagos integrados, chat, verificación de identidad y panel administrativo.',670,393,530);
  txt(s,'Demo: https://manocerca-mvp.vercel.app',80,596,1050,47,24,C.orange,true);
}

const { finalizePresentation } = await import(pathToFileURL(path.join(SKILL_DIR,'container_tools/artifact_tool_utils.mjs')).href);
const stagingDir = path.join(workspaceDir,'.codex-finalizer');
await fs.mkdir(stagingDir,{recursive:true});
const candidatePath = path.join(stagingDir,'candidate-avances.pptx');
await (await PresentationFile.exportPptx(p)).save(candidatePath);
const result = await finalizePresentation({
  workspaceDir, candidatePath, finalPath: FINAL_PPTX,
  pythonExecutable: RUNTIME_PYTHON,
  integrityValidatorPath: path.join(SKILL_DIR,'container_tools/inspect_presentation_package_integrity.py'),
  layoutValidatorPath: path.join(SKILL_DIR,'container_tools/inspect_presentation_layout_geometry.py'),
  layoutArgs: ['--expected-slide-size-emu','12192000,6858000','--validate-bullet-geometry','--validate-heading-fit'],
  requiredNativeTableOwnerSlides: [],
  fontPolicy: {basis:'design',families:[FONT]},
  verifyArtifactToolImport: true,
  receiptPath: path.join(stagingDir,'avances-v2.validation.json'),
});
console.log(JSON.stringify({slides:p.slides.items.length,final:FINAL_PPTX,result},null,2));
