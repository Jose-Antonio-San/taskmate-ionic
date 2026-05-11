//Servicio para gestionar las tareas en el localStorage

import { Injectable } from '@angular/core';
import { Task } from '../task.models';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private tasks: Task[] = [];
  private nextId = 1;
  private readonly STORAGE_KEY = 'taskmate_tasks';
  private readonly NEXT_ID_KEY = 'taskmate_nextId';

  constructor() {
    this.loadFromStorage();
  }

  private saveToStorage(): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.tasks));
    localStorage.setItem(this.NEXT_ID_KEY, String(this.nextId));
  }

  private loadFromStorage(): void {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    const savedId = localStorage.getItem(this.NEXT_ID_KEY);
    if (saved) {
      try {
        this.tasks = JSON.parse(saved).map((t: Task) => ({
          ...t,
          createdAt: new Date(t.createdAt as unknown as string),
        }));
      } catch {
        this.tasks = [];
      }
    }
    if (savedId) {
      const parsed = parseInt(savedId, 10);
      if (!Number.isNaN(parsed)) this.nextId = parsed;
    }
  }

  getTasks(): Task[] {
    return [...this.tasks];
  }

  getTaskById(id: number): Task | undefined {
    return this.tasks.find((t) => t.id === id);
  }

  addTask(data: Omit<Task, 'id' | 'createdAt'>): Task {
    const task: Task = { ...data, id: this.nextId++, createdAt: new Date() };
    this.tasks.push(task);
    this.saveToStorage();
    return task;
  }

  toggleComplete(id: number): void {
    const task = this.tasks.find((t) => t.id === id);
    if (task) {
      task.completed = !task.completed;
      this.saveToStorage();
    }
  }

  setCompleted(id: number, completed: boolean): void {
    const task = this.tasks.find((t) => t.id === id);
    if (task) {
      task.completed = completed;
      this.saveToStorage();
    }
  }

  deleteTask(id: number): void {
    this.tasks = this.tasks.filter((t) => t.id !== id);
    this.saveToStorage();
  }

  getStats() {
    return {
      total: this.tasks.length,
      completed: this.tasks.filter((t) => t.completed).length,
      pending: this.tasks.filter((t) => !t.completed).length,
    };
  }
}
