export interface Task {
    id: number;
    title: string;
    description?: string;
    priority: 'Alta' | 'Media' | 'Baja';
    completed: boolean;
    createdAt: Date;
    category?: string;
  }