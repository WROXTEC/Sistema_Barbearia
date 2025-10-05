import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Tipos para o banco de dados
export interface DatabaseService {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DatabaseProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DatabaseClient {
  id: string;
  name: string;
  phone: string;
  email?: string;
  is_blocked: boolean;
  total_appointments: number;
  created_at: string;
  updated_at: string;
}

export interface DatabaseEmployee {
  id: string;
  name: string;
  phone: string;
  email?: string;
  specialties: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DatabaseAppointment {
  id: string;
  client_id?: string;
  client_name: string;
  client_phone: string;
  appointment_date: string;
  appointment_time: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  total_price: number;
  total_duration: number;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface DatabaseAppointmentService {
  id: string;
  appointment_id: string;
  service_id?: string;
  service_name: string;
  service_price: number;
  service_duration: number;
}

export interface DatabaseBarberInfo {
  id: string;
  name: string;
  address: string;
  phone: string;
  whatsapp: string;
  instagram: string;
  business_hours: Record<string, string>;
  created_at: string;
  updated_at: string;
}