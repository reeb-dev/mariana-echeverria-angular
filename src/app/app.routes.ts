import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home.component';
import { PropertyDetailComponent } from './pages/property-detail.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'propiedades/:slug', component: PropertyDetailComponent },
  { path: '**', redirectTo: '' },
];
