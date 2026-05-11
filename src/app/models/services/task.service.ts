import { Injectable } from '@angular/core';
import { Task } from '../task.models';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private tasks: Task[] = [
    { id: 1, title: 'Aprender Ionic', description: 'Completar el Sprint 2', priority: 'Alta', completed: false, createdAt: new Date() },
    { id: 2, title: 'Hacer ejercicio', description: '30 minutos de cardio', priority: 'Media', completed: true, createdAt: new Date() },
    { id: 3, title: 'Leer libro', description: 'Continuar por el capítulo 3', priority: 'Baja', completed: false, createdAt: new Date() },
  ];
  private nextId = 4;

  getTasks(): Task[] { return [...this.tasks]; }

  getTaskById(id: number): Task | undefined {
    return this.tasks.find(t => t.id === id);
  }

  addTask(data: Omit<Task, 'id' | 'createdAt'>): Task {
    const task: Task = { ...data, id: this.nextId++, createdAt: new Date() };
    this.tasks.push(task);
    return task;
  }

  toggleComplete(id: number): void {
    const task = this.tasks.find(t => t.id === id);
    if (task) task.completed = !task.completed;
  }

  setCompleted(id: number, completed: boolean): void {
    const task = this.tasks.find(t => t.id === id);
    if (task) task.completed = completed;
  }

  deleteTask(id: number): void {
    this.tasks = this.tasks.filter(t => t.id !== id);
  }

  getStats() {
    return {
      total: this.tasks.length,
      completed: this.tasks.filter(t => t.completed).length,
      pending: this.tasks.filter(t => !t.completed).length,
    };
  }
}