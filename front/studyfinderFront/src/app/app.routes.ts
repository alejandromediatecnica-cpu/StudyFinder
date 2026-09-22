import { Routes } from '@angular/router';
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

export const routes: Routes = [
  { path: '', component: LandingComponent, pathMatch: 'full' },
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: 'main', component: MainComponent },
      { path: 'materias', component: MateriasComponent },
      { path: 'calendario', component: CalendarioComponent },
      { path: 'tareas', component: TareasComponent },
      { path: 'ia', component: IaComponent },
      { path: 'estadisticas', component: EstadisticasComponent },
      { path: 'configuracion', component: ConfiguracionComponent },
      { path: 'login', component: LoginComponent },
      { path: 'signup', component: SignupComponent },
      { path: 'landing', component: LandingComponent },
    ]
  },
  { path: '**', redirectTo: '' }
];