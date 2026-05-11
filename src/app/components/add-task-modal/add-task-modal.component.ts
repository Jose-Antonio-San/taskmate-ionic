//Componente para añadir una nueva tarea
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonInput,
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonTextarea,
  IonTitle,
  IonToolbar,
  ModalController,
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-add-task-modal',
  standalone: true,
  templateUrl: './add-task-modal.component.html',
  styleUrls: ['./add-task-modal.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonContent,
    IonItem,
    IonLabel,
    IonInput,
    IonTextarea,
    IonSelect,
    IonSelectOption,
  ],
})
export class AddTaskModalComponent {
  title = '';
  description = '';
  priority: 'Alta' | 'Media' | 'Baja' = 'Media';

  constructor(private modalCtrl: ModalController) {}

  dismiss() {
    this.modalCtrl.dismiss();
  }

  save() {
    if (!this.title.trim()) return;
    this.modalCtrl.dismiss({
      title: this.title.trim(),
      description: this.description.trim(),
      priority: this.priority,
    });
  }
}
