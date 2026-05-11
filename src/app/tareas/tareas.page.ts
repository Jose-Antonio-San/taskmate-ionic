import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
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
  IonSpinner,
  IonTitle,
  IonToolbar,
  ModalController,
  ToastController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { add, clipboardOutline } from 'ionicons/icons';
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
    IonSpinner,
  ],
})
export class TareasPage {
  tasks: Task[] = [];
  filteredTasks: Task[] = [];
  selectedFilter = 'all';
  loadingTasks = false;

  constructor(
    private taskService: TaskService,
    private router: Router,
    private modalCtrl: ModalController,
    private toastCtrl: ToastController
  ) {
    addIcons({ add, clipboardOutline });
  }

  ionViewWillEnter() {
    this.refreshTasks();
  }

  private async showApiErrorToast() {
    const toast = await this.toastCtrl.create({
      message: 'La API no responde o ha fallado. Comprueba el servidor en el puerto 3000.',
      duration: 4000,
      color: 'danger',
    });
    await toast.present();
  }

  private refreshTasks() {
    this.loadingTasks = true;
    this.taskService
      .getTasks()
      .pipe(finalize(() => (this.loadingTasks = false)))
      .subscribe({
        next: (tasks) => {
          this.tasks = tasks;
          this.applyFilter();
        },
        error: async () => {
          await this.showApiErrorToast();
        },
      });
  }

  filterTasks(event: CustomEvent<{ value?: string | null }>) {
    const query = (event.detail.value ?? '').toLowerCase();
    this.filteredTasks = this.tasks.filter((t) => t.title.toLowerCase().includes(query));
  }

  applyFilter() {
    if (this.selectedFilter === 'pending') this.filteredTasks = this.tasks.filter((t) => !t.completed);
    else if (this.selectedFilter === 'done') this.filteredTasks = this.tasks.filter((t) => t.completed);
    else this.filteredTasks = [...this.tasks];
  }

  onToggle(task: Task) {
    const next = task.completed;
    this.taskService.setCompleted(task.id, next).subscribe({
      next: () => this.refreshTasks(),
      error: async () => {
        task.completed = !next;
        const toast = await this.toastCtrl.create({
          message: 'No se pudo guardar en la API',
          duration: 2000,
          color: 'danger',
        });
        await toast.present();
      },
    });
  }

  goToDetail(id: number) {
    void this.router.navigate(['/task-detail', id]);
  }

  async openAddModal() {
    const modal = await this.modalCtrl.create({ component: AddTaskModalComponent });
    await modal.present();

    const { data } = await modal.onWillDismiss();

    if (data) {
      this.taskService.addTask({ ...data, completed: false }).subscribe({
        next: async () => {
          this.refreshTasks();
          const toast = await this.toastCtrl.create({
            message: '✅ Tarea creada correctamente',
            duration: 2000,
            position: 'bottom',
            color: 'success',
          });
          await toast.present();
        },
        error: async () => {
          await this.showApiErrorToast();
        },
      });
    }
  }
}
