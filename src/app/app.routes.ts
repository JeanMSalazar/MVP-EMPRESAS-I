import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./marketing').then((m) => m.LandingPage),
    title: 'ManoCerca | Un buen maestro más cerca de casa',
  },
  {
    path: 'maestros',
    loadComponent: () => import('./marketing').then((m) => m.MastersLandingPage),
    title: 'Para maestros | ManoCerca',
  },
  {
    path: 'como-funciona',
    loadComponent: () => import('./marketing').then((m) => m.HowPage),
    title: 'Cómo funciona | ManoCerca',
  },
  {
    path: 'explorar',
    loadComponent: () => import('./discover').then((m) => m.ExplorePage),
    title: 'Encuentra maestros | ManoCerca',
  },
  {
    path: 'profesional/:id',
    loadComponent: () => import('./discover').then((m) => m.ProfessionalPage),
    title: 'Perfil profesional | ManoCerca',
  },
  {
    path: 'ingresar',
    loadComponent: () => import('./discover').then((m) => m.AuthPage),
    title: 'Ingresar | ManoCerca',
  },
  {
    path: 'registro',
    loadComponent: () => import('./discover').then((m) => m.AuthPage),
    title: 'Crear cuenta | ManoCerca',
  },
  {
    path: 'recuperar-contrasena',
    loadComponent: () => import('./discover').then((m) => m.PasswordRecoveryPage),
    title: 'Recuperar contraseña | ManoCerca',
  },
  {
    path: 'solicitar',
    loadComponent: () => import('./discover').then((m) => m.RequestFormPage),
    title: 'Solicitar servicio | ManoCerca',
  },
  {
    path: 'panel',
    loadComponent: () => import('./workspace').then((m) => m.DashboardPage),
    title: 'Mi espacio | ManoCerca',
  },
  {
    path: 'solicitudes/:id',
    loadComponent: () => import('./workspace').then((m) => m.RequestDetailPage),
    title: 'Solicitud | ManoCerca',
  },
  { path: '**', redirectTo: '' },
];
