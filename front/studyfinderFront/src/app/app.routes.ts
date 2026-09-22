import { inject } from '@angular/core';
import { CanActivateFn, Routes, Router } from '@angular/router';
import { LayoutComponent } from './app/pages/layout/layout';
import { MainComponent } from './app/pages/main/main';
import { MateriasComponent } from './app/pages/materias/materias';
import { CalendarioComponent } from './app/pages/calendario/calendario';
import { TareasComponent } from './app/pages/tareas/tareas';
import { IaComponent } from './app/pages/ia/ia';
import { EstadisticasComponent } from './app/pages/estadisticas/estadisticas';
import { ConfiguracionComponent } from './app/pages/configuracion/configuracion';
import { LoginComponent } from './app/pages/login/login';
import { SignupComponent } from './app/pages/signup/signup';
import { LandingComponent } from './app/pages/landing/landing';
import { UploadComponent } from './app/pages/upload/upload';
import { AuthService } from './services/auth.service';

const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.isLoggedIn() ? true : router.createUrlTree(['/login']);
};

export const routes: Routes = [
  { path: '', component: LandingComponent, pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: 'main', component: MainComponent },
      { path: 'materias', component: MateriasComponent },
      { path: 'calendario', component: CalendarioComponent },
      { path: 'tareas', component: TareasComponent },
      { path: 'subir', component: UploadComponent },
      { path: 'estadisticas', component: EstadisticasComponent },
      { path: 'configuracion', component: ConfiguracionComponent },
      { path: 'landing', component: LandingComponent },
    ]
  },
  { path: '**', redirectTo: '' }
];