import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, of, throwError } from 'rxjs';
import { ApiService, CreateTaskBody, TaskApiDto } from '../../services/api.service';
import { Task } from '../task.models';

/**
 * Lógica de dominio de tareas: delega HTTP en {@link ApiService}
 * (HttpClient devuelve Observables → subscribe o async pipe).
 */
@Injectable({ providedIn: 'root' })
export class TaskService {
  private readonly api = inject(ApiService);

  private normalize(dto: TaskApiDto): Task {
    return {
      id: dto.id,
      title: dto.title,
      description: dto.description ?? undefined,
      priority: dto.priority,
      completed: dto.completed,
      category: dto.category ?? undefined,
      createdAt: new Date(dto.createdAt),
    };
  }

  getTasks(): Observable<Task[]> {
    return this.api.getTasks().pipe(
      map((rows) => rows.map((r) => this.normalize(r))),
      catchError((err) => {
        console.error('TaskService.getTasks', err);
        return throwError(() => err);
      })
    );
  }

  getTaskById(id: number): Observable<Task | null> {
    return this.api.getTaskById(id).pipe(
      map((r) => this.normalize(r)),
      catchError((err) => {
        if (err?.status === 404) {
          return of(null);
        }
        console.error('TaskService.getTaskById', err);
        return throwError(() => err);
      })
    );
  }

  addTask(data: Omit<Task, 'id' | 'createdAt'>): Observable<Task> {
    const body: CreateTaskBody = {
      title: data.title,
      description: data.description ?? '',
      priority: data.priority,
      completed: data.completed,
      category: data.category ?? null,
    };
    return this.api.createTask(body).pipe(map((r) => this.normalize(r)));
  }

  setCompleted(id: number, completed: boolean): Observable<Task> {
    return this.api.updateTask(id, { completed }).pipe(map((r) => this.normalize(r)));
  }

  deleteTask(id: number): Observable<void> {
    return this.api.deleteTask(id).pipe(map(() => undefined));
  }

  computeStats(tasks: Task[]) {
    return {
      total: tasks.length,
      completed: tasks.filter((t) => t.completed).length,
      pending: tasks.filter((t) => !t.completed).length,
    };
  }
}
