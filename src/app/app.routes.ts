// Rutas de la aplicación que se encarga de la navegación entre las pantallas 

import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./tabs/tabs.routes').then((m) => m.routes),
  },
  {
    path: 'task-detail',
    loadComponent: () => import('./pages/task-detail/task-detail.page').then( m => m.TaskDetailPage)
  },
  {
    path: 'task-detail/:id',
    loadComponent: () => import('./pages/task-detail/task-detail.page')
      .then(m => m.TaskDetailPage)
  }
];
