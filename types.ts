
export enum Category {
  FOOD = 'food',
  DRINK = 'drink',
  GAME = 'game'
}

export interface Product {
  id: number;
  name: string;
  price: number;
  category: Category;
  isActive: boolean;
  image: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface LogEntry {
  id: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  endpoint: string;
  status: number;
  timestamp: string;
}

export interface Order {
  id: string;
  customerName: string;
  phone: string;
  address: string;
  items: CartItem[];
  total: number;
  timestamp: string;
}
