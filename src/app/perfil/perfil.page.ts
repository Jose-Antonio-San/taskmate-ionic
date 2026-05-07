import { Component } from '@angular/core';
import {IonAvatar,IonBadge,IonCard,IonCardContent,IonCardHeader,IonCardSubtitle,IonChip,IonContent,IonHeader,IonIcon,IonItem,IonLabel,IonList,IonTitle,IonToolbar} from '@ionic/angular/standalone';

@Component({
  selector: 'app-tab3',
  templateUrl: 'perfil.page.html',
  styleUrls: ['perfil.page.scss'],
  imports: [IonHeader,IonToolbar,IonTitle,IonContent,IonAvatar,IonBadge,IonCard,IonCardHeader,IonCardSubtitle,IonCardContent,IonChip,IonLabel,IonList,IonItem,IonIcon],
})
export class PerfilPage {
  constructor() {}
} 
