import { ReactNode } from "react";

export interface Agency {
  id: string;
  name: string;
  description: string;
  location: string;
  image: string;
  rating: number;
  totalCars: number;
}

export interface Car {
  agencyName: ReactNode;
  description: any;
  id: string;
  agencyId: string;
  name: string;
  brand?: string;
  type: string;
  image: string;
  pricePerDay: number;
  seats: number;
  transmission: 'automatic' | 'manual';
  fuelType: string;
  available: boolean;
}

export interface Booking {
  id: string;
  carId: string;
  startDate: Date;
  endDate: Date;
  customerName: string;
  customerEmail: string;
  status: 'pending' | 'confirmed' | 'cancelled';
}
