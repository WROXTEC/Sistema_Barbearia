export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number; // em minutos
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
}

export interface Appointment {
  id: string;
  clientName: string;
  clientPhone: string;
  services: Service[];
  date: string;
  time: string;
  status: 'scheduled' | 'completed' | 'cancelled';
}

export interface BarberInfo {
  name: string;
  address: string;
  phone: string;
  whatsapp: string;
  instagram: string;
  hours: {
    monday: string;
    tuesday: string;
    wednesday: string;
    thursday: string;
    friday: string;
    saturday: string;
    sunday: string;
  };
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  email?: string;
  createdAt: string;
  lastAppointment?: string;
  totalAppointments: number;
  isBlocked: boolean;
}

export interface Employee {
  id: string;
  name: string;
  phone: string;
  email?: string;
  specialties: string[];
  isActive: boolean;
  createdAt: string;
  photoUrl?: string;
}

export type EmployeeSpecialty = 'cabeleireiro' | 'manicure' | 'pedicure' | 'barbeiro' | 'esteticista';