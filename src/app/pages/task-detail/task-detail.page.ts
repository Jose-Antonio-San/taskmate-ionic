// Esta pantalla muestra los detalles de una tarea específica ya sea para verla o para editarla


import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, IonBackButton, IonBadge, IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonNote, IonTitle, IonToolbar } from '@ionic/angular/standalone';
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
  ],
})
export class TaskDetailPage implements OnInit {
  task: Task | undefined;

  constructor(
    private route: ActivatedRoute,
    private taskService: TaskService,
    private router: Router,
    private alertCtrl: AlertController
  ) {
    addIcons({ trash, refresh, checkmark });
  }

  ngOnInit() {
    const id = parseInt(this.route.snapshot.paramMap.get('id') || '0');
    this.task = this.taskService.getTaskById(id);
  }

  toggleComplete() {
    if (this.task) {
      this.taskService.toggleComplete(this.task.id);
      this.task = this.taskService.getTaskById(this.task.id);
    }
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
            this.taskService.deleteTask(this.task!.id);
            this.router.navigate(['/tabs/tab2']);
          },
        },
      ],
    });
    await alert.present();
  }
}
