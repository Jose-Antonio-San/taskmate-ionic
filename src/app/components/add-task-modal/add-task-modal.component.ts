// Componente para añadir una nueva tarea
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonInput,
  IonItem,
  IonLabel,
  IonNote,
  IonSelect,
  IonSelectOption,
  IonTextarea,
  IonTitle,
  IonToolbar,
  ModalController,
} from '@ionic/angular/standalone';

/** Valores del <ion-select>; al guardar se convierten a la prioridad del modelo Task. */
type FormPriority = 'alta' | 'media' | 'baja';

@Component({
  selector: 'app-add-task-modal',
  standalone: true,
  templateUrl: './add-task-modal.component.html',
  styleUrls: ['./add-task-modal.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonContent,
    IonItem,
    IonLabel,
    IonNote,
    IonInput,
    IonTextarea,
    IonSelect,
    IonSelectOption,
  ],
})
export class AddTaskModalComponent implements OnInit {
  taskForm!: FormGroup;

  private readonly priorityToTask: Record<FormPriority, 'Alta' | 'Media' | 'Baja'> = {
    alta: 'Alta',
    media: 'Media',
    baja: 'Baja',
  };

  constructor(
    private fb: FormBuilder,
    private modalCtrl: ModalController
  ) {}

  ngOnInit(): void {
    this.taskForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      description: ['', Validators.maxLength(500)],
      priority: ['media' as FormPriority, Validators.required],
      category: ['personal'],
    });
  }

  get titleError(): string {
    const ctrl = this.taskForm.get('title');
    if (ctrl?.hasError('required')) return 'El título es obligatorio';
    if (ctrl?.hasError('minlength')) return 'Mínimo 3 caracteres';
    if (ctrl?.hasError('maxlength')) return 'Máximo 100 caracteres';
    return '';
  }

  get descriptionError(): string {
    const ctrl = this.taskForm.get('description');
    if (ctrl?.hasError('maxlength')) return 'Máximo 500 caracteres';
    return '';
  }

  dismiss(): void {
    this.modalCtrl.dismiss();
  }

  save(): void {
    if (this.taskForm.invalid) {
      this.taskForm.markAllAsTouched();
      return;
    }
    const v = this.taskForm.getRawValue();
    const priority = this.priorityToTask[v.priority as FormPriority] ?? 'Media';
    this.modalCtrl.dismiss({
      title: v.title.trim(),
      description: (v.description ?? '').trim(),
      priority,
      category: v.category,
    });
  }
}
