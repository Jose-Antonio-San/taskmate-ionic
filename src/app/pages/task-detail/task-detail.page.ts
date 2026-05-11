// Esta pantalla muestra los detalles de una tarea específica ya sea para verla o para editarla

import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import {
  AlertController,
  IonBackButton,
  IonBadge,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonNote,
  IonSpinner,
  IonTitle,
  IonToolbar,
  ToastController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { checkmark, refresh, trash } from 'ionicons/icons';
import { Task } from '../../models/task.models';
import { TaskService } from '../../models/services/task.service';

@Component({
  selector: 'app-task-detail',
  standalone: true,
  templateUrl: './task-detail.page.html',
  styleUrls: ['./task-detail.page.scss'],
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonBackButton,
    IonTitle,
    IonButton,
    IonIcon,
    IonContent,
    IonBadge,
    IonNote,
    IonSpinner,
  ],
})
export class TaskDetailPage implements OnInit {
  task: Task | undefined;
  loadingDetail = true;

  constructor(
    private route: ActivatedRoute,
    private taskService: TaskService,
    private router: Router,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController
  ) {
    addIcons({ trash, refresh, checkmark });
  }

  ngOnInit() {
    const id = parseInt(this.route.snapshot.paramMap.get('id') || '0', 10);
    this.loadingDetail = true;
    this.taskService
      .getTaskById(id)
      .pipe(finalize(() => (this.loadingDetail = false)))
      .subscribe({
        next: (task) => {
          this.task = task ?? undefined;
          if (!this.task) {
            void this.router.navigate(['/tabs/tab2']);
          }
        },
        error: async () => {
          const toast = await this.toastCtrl.create({
            message: 'La API no responde o la tarea no existe.',
            duration: 2500,
            color: 'danger',
          });
          await toast.present();
          void this.router.navigate(['/tabs/tab2']);
        },
      });
  }

  toggleComplete() {
    if (!this.task) return;
    const next = !this.task.completed;
    this.taskService.setCompleted(this.task.id, next).subscribe({
      next: (updated) => {
        this.task = updated;
      },
      error: async () => {
        const toast = await this.toastCtrl.create({
          message: 'No se pudo actualizar en la API',
          duration: 2000,
          color: 'danger',
        });
        await toast.present();
      },
    });
  }

  async deleteTask() {
    const alert = await this.alertCtrl.create({
      header: 'Eliminar tarea',
      message: '¿Estas seguro? Esta accion no se puede deshacer.',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => {
            if (!this.task) return;
            this.taskService.deleteTask(this.task.id).subscribe({
              next: () => {
                void this.router.navigate(['/tabs/tab2']);
              },
              error: async () => {
                const toast = await this.toastCtrl.create({
                  message: 'La API no pudo eliminar la tarea',
                  duration: 2000,
                  color: 'danger',
                });
                await toast.present();
              },
            });
          },
        },
      ],
    });
    await alert.present();
  }
}
