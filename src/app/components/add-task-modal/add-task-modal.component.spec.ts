import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ModalController } from '@ionic/angular/standalone';

import { AddTaskModalComponent } from './add-task-modal.component';

describe('AddTaskModalComponent', () => {
  let component: AddTaskModalComponent;
  let fixture: ComponentFixture<AddTaskModalComponent>;

  beforeEach(waitForAsync(() => {
    const modalCtrlMock = jasmine.createSpyObj<ModalController>('ModalController', ['dismiss']);

    TestBed.configureTestingModule({
      imports: [AddTaskModalComponent],
      providers: [{ provide: ModalController, useValue: modalCtrlMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(AddTaskModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
