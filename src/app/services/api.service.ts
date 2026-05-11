import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { Task } from '../models/task.models';

/** Respuesta JSON estándar del backend Express (`taskmate-api`). */
export interface ApiSuccess<T> {
  success: true;
  data: T;
}

/** Cuerpo que envía/recibe la API (fechas en ISO). */
export interface TaskApiDto {
  id: number;
  title: string;
  description: string | null;
  priority: Task['priority'];
  completed: boolean;
  category: string | null;
  createdAt: string;
}

export interface CreateTaskBody {
  title: string;
  description?: string;
  priority: Task['priority'];
  completed: boolean;
  category?: string | null;
}

/**
 * Capa HTTP contra el backend Express.
 * La URL base viene de `environment` (pista del profesor: cambiar host sin tocar lógica).
 * Rutas: GET/POST `${apiUrl}/tasks` (el servidor también expone `/api/tasks`).
 */
@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  getTasks(): Observable<TaskApiDto[]> {
    return this.http
      .get<ApiSuccess<TaskApiDto[]>>(`${this.apiUrl}/tasks`)
      .pipe(map((r) => r.data));
  }

  getTaskById(id: number): Observable<TaskApiDto> {
    return this.http
      .get<ApiSuccess<TaskApiDto>>(`${this.apiUrl}/tasks/${id}`)
      .pipe(map((r) => r.data));
  }

  createTask(task: CreateTaskBody): Observable<TaskApiDto> {
    return this.http
      .post<ApiSuccess<TaskApiDto>>(`${this.apiUrl}/tasks`, task)
      .pipe(map((r) => r.data));
  }

  updateTask(id: number, body: Partial<Pick<TaskApiDto, 'title' | 'description' | 'priority' | 'category' | 'completed'>>): Observable<TaskApiDto> {
    return this.http
      .patch<ApiSuccess<TaskApiDto>>(`${this.apiUrl}/tasks/${id}`, body)
      .pipe(map((r) => r.data));
  }

  replaceTask(id: number, body: CreateTaskBody): Observable<TaskApiDto> {
    return this.http
      .put<ApiSuccess<TaskApiDto>>(`${this.apiUrl}/tasks/${id}`, body)
      .pipe(map((r) => r.data));
  }

  deleteTask(id: number): Observable<{ id: number; deleted: boolean }> {
    return this.http
      .delete<ApiSuccess<{ id: number; deleted: boolean }>>(`${this.apiUrl}/tasks/${id}`)
      .pipe(map((r) => r.data));
  }
}
