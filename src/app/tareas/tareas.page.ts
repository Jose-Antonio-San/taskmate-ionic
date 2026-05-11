import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonBadge,
  IonCheckbox,
  IonContent,
  IonFab,
  IonFabButton,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonSearchbar,
  IonSegment,
  IonSegmentButton,
  IonTitle,
  IonToolbar,
  ModalController,
  ToastController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { add } from 'ionicons/icons';
import { AddTaskModalComponent } from '../components/add-task-modal/add-task-modal.component';
import { Task } from '../models/task.models';
import { TaskService } from '../models/services/task.service';

@Component({
  selector: 'app-tab2',
  standalone: true,
  templateUrl: 'tareas.page.html',
  styleUrls: ['tareas.page.scss'],
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonSearchbar,
    IonSegment,
    IonSegmentButton,
    IonLabel,
    IonList,
    IonItem,
    IonCheckbox,
    IonBadge,
    IonFab,
    IonFabButton,
    IonIcon,
  ],
})
export class TareasPage {
  tasks: Task[] = [];
  filteredTasks: Task[] = [];
  selectedFilter = 'all';

  constructor(
    private taskService: TaskService,
    private router: Router,
    private modalCtrl: ModalController,
    private toastCtrl: ToastController
  ) {
    addIcons({ add });
  }

  ionViewWillEnter() {
    this.tasks = this.taskService.getTasks();
    this.applyFilter();
  }

  filterTasks(event: any) {
    const query = event.target.value?.toLowerCase() || '';
    this.filteredTasks = this.tasks.filter((t) => t.title.toLowerCase().includes(query));
  }

  applyFilter() {
    if (this.selectedFilter === 'pending') this.filteredTasks = this.tasks.filter((t) => !t.completed);
    else if (this.selectedFilter === 'done') this.filteredTasks = this.tasks.filter((t) => t.completed);
    else this.filteredTasks = [...this.tasks];
  }

  onToggle(task: Task) {
    this.taskService.setCompleted(task.id, task.completed);
    this.applyFilter();
  }

  goToDetail(id: number) { this.router.navigate(['/task-detail', id]); }

  async openAddModal() {
    const modal = await this.modalCtrl.create({ component: AddTaskModalComponent });
    await modal.present();

    const { data } = await modal.onWillDismiss();

    if (data) {
      this.taskService.addTask({ ...data, completed: false });
      this.tasks = this.taskService.getTasks();
      this.applyFilter();

      const toast = await this.toastCtrl.create({
        message: '✅ Tarea creada correctamente',
        duration: 2000,
        position: 'bottom',
        color: 'success',
      });
      await toast.present();
    }
  }
}