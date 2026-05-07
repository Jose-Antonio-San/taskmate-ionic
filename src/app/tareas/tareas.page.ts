import { Component } from '@angular/core';
import {
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { clipboardOutline } from 'ionicons/icons';

export interface Tarea {
  id: string;
  titulo: string;
}

@Component({
  selector: 'app-tareas',
  templateUrl: 'tareas.page.html',
  styleUrls: ['tareas.page.scss'],
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonIcon,
  ],
})
export class TareasPage {
  /** Cuando esté vacío se muestra el mensaje de lista vacía. */
  tareas: Tarea[] = [];

  constructor() {
    addIcons({ clipboardOutline });
  }
}
