import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import {
  IonBadge,
  IonButton,
  IonCard,
  IonCardContent,
  IonCheckbox,
  IonCol,
  IonContent,
  IonFab,
  IonFabButton,
  IonGrid,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonProgressBar,
  IonRefresher,
  IonRefresherContent,
  IonRow,
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
  selector: 'app-tab1',
  standalone: true,
  templateUrl: 'inicio.page.html',
  styleUrls: ['inicio.page.scss'],
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonCard,
    IonCardContent,
    IonGrid,
    IonRow,
    IonCol,
    IonRefresher,
    IonRefresherContent,
    IonProgressBar,
    IonSearchbar,
    IonSegment,
    IonSegmentButton,
    IonLabel,
    IonList,
    IonItem,
    IonCheckbox,
    IonBadge,
    IonButton,
    IonFab,
    IonFabButton,
    IonIcon,
    IonSpinner,
  ],
})
export class Tab1Page {
  stats = { total: 0, completed: 0, pending: 0 };
  tasks: Task[] = [];
  filteredTasks: Task[] = [];
  searchQuery = '';
  selectedPriority: 'all' | Task['priority'] = 'all';
  selectedStatus: 'all' | 'pending' | 'done' = 'all';
  /** Spinner inicial / recarga explícita (no en cada toggle para no parpadear). */
  loadingTasks = false;

  constructor(
    private taskService: TaskService,
    private modalCtrl: ModalController,
    private toastCtrl: ToastController,
    private router: Router
  ) {
    addIcons({ add, clipboardOutline });
  }

  ionViewWillEnter() {
    this.loadTasksAndStats(true);
  }

  private async showApiErrorToast() {
    const toast = await this.toastCtrl.create({
      message:
        'La API no responde o ha fallado. Comprueba que el backend esté en marcha (puerto 3000) y CORS.',
      duration: 4000,
      position: 'bottom',
      color: 'danger',
    });
    await toast.present();
  }

  private loadTasksAndStats(showSpinner: boolean) {
    if (showSpinner) {
      this.loadingTasks = true;
    }
    this.taskService
      .getTasks()
      .pipe(
        finalize(() => {
          if (showSpinner) {
            this.loadingTasks = false;
          }
        })
      )
      .subscribe({
        next: (tasks) => {
          this.tasks = tasks;
          this.stats = this.taskService.computeStats(tasks);
          this.applyFilter();
        },
        error: async () => {
          await this.showApiErrorToast();
        },
      });
  }

  applyFilter() {
    const q = this.searchQuery.trim().toLowerCase();
    let list = [...this.tasks];

    if (this.selectedStatus === 'pending') {
      list = list.filter((t) => !t.completed);
    } else if (this.selectedStatus === 'done') {
      list = list.filter((t) => t.completed);
    }

    if (this.selectedPriority !== 'all') {
      list = list.filter((t) => t.priority === this.selectedPriority);
    }

    if (q) {
      list = list.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          (t.description?.toLowerCase().includes(q) ?? false)
      );
    }

    this.filteredTasks = list;
    this.stats = this.taskService.computeStats(this.tasks);
  }

  doRefresh(event: CustomEvent) {
    const target = event.target as HTMLIonRefresherElement;
    this.taskService
      .getTasks()
      .pipe(finalize(() => void target.complete()))
      .subscribe({
        next: (tasks) => {
          this.tasks = tasks;
          this.stats = this.taskService.computeStats(tasks);
          this.applyFilter();
        },
        error: async () => {
          const toast = await this.toastCtrl.create({
            message: 'La API no responde. No se pudo actualizar.',
            duration: 2500,
            color: 'warning',
          });
          await toast.present();
        },
      });
  }

  clearFilters() {
    this.searchQuery = '';
    this.selectedPriority = 'all';
    this.selectedStatus = 'all';
    this.applyFilter();
  }

  onToggle(task: Task) {
    const next = task.completed;
    this.taskService.setCompleted(task.id, next).subscribe({
      next: () => {
        this.loadTasksAndStats(false);
      },
      error: async () => {
        task.completed = !next;
        const toast = await this.toastCtrl.create({
          message: 'No se pudo guardar el estado en la API',
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
          const toast = await this.toastCtrl.create({
            message: '✅ Tarea creada correctamente',
            duration: 2000,
            position: 'bottom',
            color: 'success',
          });
          await toast.present();

          await this.router.navigate(['/tabs/tab2']);
        },
        error: async () => {
          await this.showApiErrorToast();
        },
      });
    }
  }
}
