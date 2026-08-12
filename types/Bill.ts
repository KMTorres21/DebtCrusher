export interface Bill {
  id: string;
  name: string;
  amount: number;
  dueDay: number;
  paid: boolean;
  category: string;
  notes?: string;
  createdAt: string;
}
