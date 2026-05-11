import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { provideIonicAngular } from '@ionic/angular/standalone';
import { environment } from '../../../environments/environment';
import { TaskDetailPage } from './task-detail.page';

describe('TaskDetailPage', () => {
  let component: TaskDetailPage;
  let fixture: ComponentFixture<TaskDetailPage>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskDetailPage],
      providers: [
        provideIonicAngular(),
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: convertToParamMap({ id: '1' }) } },
        },
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(TaskDetailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();

    const req = httpMock.expectOne(`${environment.apiUrl}/tasks/1`);
    req.flush({
      success: true,
      data: {
        id: 1,
        title: 'Test',
        description: null,
        priority: 'Media',
        completed: false,
        category: null,
        createdAt: new Date().toISOString(),
      },
    });
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
