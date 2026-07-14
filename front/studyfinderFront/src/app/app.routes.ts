import { Routes } from '@angular/router';
import { MainComponent } from './app/pages/main/main';
import { MateriasComponent } from './app/pages/materias/materias';
import { CalendarioComponent } from './app/pages/calendario/calendario';
import { TareasComponent } from './app/pages/tareas/tareas';
import { IaComponent } from './app/pages/ia/ia';
import { EstadisticasComponent } from './app/pages/estadisticas/estadisticas';
import { ConfiguracionComponent } from './app/pages/configuracion/configuracion';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'main',
    pathMatch: 'full'
  },
  {
    path: 'main',
    component: MainComponent
  },
  {
    path: 'materias',
    component: MateriasComponent
  },
  {
    path: 'calendario',
    component: CalendarioComponent
  },
  {
    path: 'tareas',
    component: TareasComponent
  },
  {
    path: 'ia',
    component: IaComponent
  },
  {
    path: 'estadisticas',
    component: EstadisticasComponent
  },
  {
    path: 'configuracion',
    component: ConfiguracionComponent
  },
  {
    path: '**',
    redirectTo: 'main'
  }
];