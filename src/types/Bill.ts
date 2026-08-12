export interface Bill {
  id: string;
 
  name: string;
 
  amount: number;
 
  dueDay: number;
 
  category: string;
 
  paid: boolean;
 
  recurring: boolean;
 
  autoPay: boolean;
 
  notes: string;
 
  createdAt: string;
 
  updatedAt?: string;
}
 
