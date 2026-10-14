import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home.component';
import { PropertyDetailComponent } from './pages/property-detail.component';
import { authGuard, permissionGuard, unsavedChangesGuard } from './pages/panel/panel-guards';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'propiedades/:slug', component: PropertyDetailComponent },
  { path: 'tasacion', loadComponent: () => import('./pages/appraisal-request.component').then((m) => m.AppraisalRequestComponent) },
  { path: 'privacidad', loadComponent: () => import('./pages/privacy.component').then((m) => m.PrivacyComponent) },
  { path: 'calculadoras', loadComponent: () => import('./pages/calculators.component').then((m) => m.CalculatorsComponent) },
  { path: 'ig', loadComponent: () => import('./pages/link-in-bio.component').then((m) => m.LinkInBioComponent) },
  { path: 'panel/ingresar', loadComponent: () => import('./pages/panel/panel-login.component').then((m) => m.PanelLoginComponent) },
  { path: 'panel', loadComponent: () => import('./pages/panel/panel-dashboard.component').then((m) => m.PanelDashboardComponent), canActivate: [authGuard] },
  { path: 'panel/propiedades', loadComponent: () => import('./pages/panel/panel-list.component').then((m) => m.PanelListComponent), canActivate: [authGuard] },
  { path: 'panel/destacadas', loadComponent: () => import('./pages/panel/panel-featured.component').then((m) => m.PanelFeaturedComponent), canActivate: [authGuard] },
  {
    path: 'panel/ajustes',
    loadComponent: () => import('./pages/panel/panel-settings.component').then((m) => m.PanelSettingsComponent),
    canActivate: [permissionGuard('datos.respaldo')],
  },
  {
    path: 'panel/propiedad/:id',
    loadComponent: () => import('./pages/panel/panel-form.component').then((m) => m.PanelFormComponent),
    canActivate: [authGuard],
    canDeactivate: [unsavedChangesGuard],
  },
  { path: 'panel/consultas', loadComponent: () => import('./pages/panel/panel-inquiries.component').then((m) => m.PanelInquiriesComponent), canActivate: [authGuard] },
  { path: 'panel/estadisticas', loadComponent: () => import('./pages/panel/panel-stats.component').then((m) => m.PanelStatsComponent), canActivate: [authGuard] },
  { path: 'panel/tasaciones', loadComponent: () => import('./pages/panel/panel-appraisals.component').then((m) => m.PanelAppraisalsComponent), canActivate: [authGuard] },
  { path: 'panel/mapa', loadComponent: () => import('./pages/panel/panel-map.component').then((m) => m.PanelMapComponent), canActivate: [authGuard] },
  { path: 'panel/contactos', loadComponent: () => import('./pages/panel/panel-contacts.component').then((m) => m.PanelContactsComponent), canActivate: [permissionGuard('contactos.gestionar')] },
  { path: 'panel/visitas', loadComponent: () => import('./pages/panel/panel-visits.component').then((m) => m.PanelVisitsComponent), canActivate: [permissionGuard('contactos.gestionar')] },
  { path: 'panel/busquedas', loadComponent: () => import('./pages/panel/panel-searches.component').then((m) => m.PanelSearchesComponent), canActivate: [permissionGuard('contactos.gestionar')] },
  { path: 'panel/contratos', loadComponent: () => import('./pages/panel/panel-leases.component').then((m) => m.PanelLeasesComponent), canActivate: [permissionGuard('contratos.gestionar')] },
  { path: 'panel/documentos', loadComponent: () => import('./pages/panel/panel-documents.component').then((m) => m.PanelDocumentsComponent), canActivate: [permissionGuard('documentos.generar')] },
  { path: 'panel/expedientes', loadComponent: () => import('./pages/panel/panel-cases.component').then((m) => m.PanelCasesComponent), canActivate: [permissionGuard('expedientes.gestionar')] },
  { path: 'panel/propiedad/:id/cartel', loadComponent: () => import('./pages/panel/panel-poster.component').then((m) => m.PanelPosterComponent), canActivate: [authGuard] },
  { path: 'panel/propiedad/:id/informe', loadComponent: () => import('./pages/panel/panel-owner-report.component').then((m) => m.PanelOwnerReportComponent), canActivate: [authGuard] },
  {
    path: 'panel/usuarios',
    loadComponent: () => import('./pages/panel/panel-users.component').then((m) => m.PanelUsersComponent),
    canActivate: [permissionGuard('usuarios.gestionar')],
  },
  { path: '**', redirectTo: '' },
];
