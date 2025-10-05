import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Service, Product, Appointment, BarberInfo, Client, Employee } from '../types';

interface AppContextType {
  currentView: string;
  setCurrentView: (view: string) => void;
  isAdmin: boolean;
  setIsAdmin: (isAdmin: boolean) => void;
  services: Service[];
  setServices: (services: Service[]) => void;
  products: Product[];
  setProducts: (products: Product[]) => void;
  appointments: Appointment[];
  setAppointments: (appointments: Appointment[]) => void;
  clients: Client[];
  setClients: (clients: Client[]) => void;
  employees: Employee[];
  setEmployees: (employees: Employee[]) => void;
  barberInfo: BarberInfo;
  setBarberInfo: (info: BarberInfo) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const initialServices: Service[] = [
  {
    id: '1',
    name: 'Corte Masculino',
    description: 'Corte moderno com acabamento perfeito',
    price: 35,
    duration: 30
  },
  {
    id: '2',
    name: 'Barba Completa',
    description: 'Aparar e modelar barba com produtos premium',
    price: 25,
    duration: 20
  },
  {
    id: '3',
    name: 'Corte + Barba',
    description: 'Combo completo para um visual impecável',
    price: 55,
    duration: 45
  }
];

const initialProducts: Product[] = [
  {
    id: '1',
    name: 'Pomada Modeladora',
    description: 'Pomada para modelar e fixar o cabelo',
    price: 28,
    stock: 15
  },
  {
    id: '2',
    name: 'Óleo para Barba',
    description: 'Óleo hidratante para barba macia',
    price: 32,
    stock: 8
  }
];

const initialBarberInfo: BarberInfo = {
  name: 'WRX Barbearia',
  address: 'Rua das Tesouras, 123 - Centro',
  phone: '(17) 98826-4100',
  whatsapp: '5517988264100',
  instagram: '@wendelroliveira',
  hours: {
    monday: '9:00 - 18:00',
    tuesday: '9:00 - 18:00',
    wednesday: '9:00 - 18:00',
    thursday: '9:00 - 18:00',
    friday: '9:00 - 19:00',
    saturday: '8:00 - 16:00',
    sunday: 'Fechado'
  }
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentView, setCurrentView] = useState('home');
  const [isAdmin, setIsAdmin] = useState(false);
  const [services, setServices] = useState<Service[]>(initialServices);
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [barberInfo, setBarberInfo] = useState<BarberInfo>(initialBarberInfo);

  // Debug: Log quando isAdmin muda
  React.useEffect(() => {
    console.log('isAdmin changed to:', isAdmin);
  }, [isAdmin]);

  return (
    <AppContext.Provider value={{
      currentView,
      setCurrentView,
      isAdmin,
      setIsAdmin,
      services,
      setServices,
      products,
      setProducts,
      appointments,
      setAppointments,
      clients,
      setClients,
      employees,
      setEmployees,
      barberInfo,
      setBarberInfo
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}