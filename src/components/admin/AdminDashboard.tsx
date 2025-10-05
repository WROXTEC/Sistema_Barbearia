import React, { useState } from 'react';
import { Calendar, Package, Settings, LogOut, Users, UserCheck, Info } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { Dashboard } from './Dashboard';
import { AppointmentManager } from './AppointmentManager';
import { ServiceManager } from './ServiceManager';
import { ProductManager } from './ProductManager';
import { ClientManager } from './ClientManager';
import { EmployeeManager } from './EmployeeManager';
import { BarberInfoManager } from './BarberInfoManager';

export function AdminDashboard() {
  const { setIsAdmin, setCurrentView } = useApp();
  const [activeTab, setActiveTab] = useState('appointments');

  const handleLogout = () => {
    setIsAdmin(false);
    setCurrentView('home');
  };

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: Calendar },
    { id: 'appointments', label: 'Agendamentos', icon: Calendar },
    { id: 'clients', label: 'Clientes', icon: Users },
    { id: 'employees', label: 'Funcionários', icon: UserCheck },
    { id: 'services', label: 'Serviços', icon: Settings },
    { id: 'products', label: 'Produtos', icon: Package },
    { id: 'info', label: 'Informações', icon: Info }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'appointments':
        return <AppointmentManager />;
      case 'clients':
        return <ClientManager />;
      case 'employees':
        return <EmployeeManager />;
      case 'services':
        return <ServiceManager />;
      case 'products':
        return <ProductManager />;
      case 'info':
        return <BarberInfoManager />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-800">Painel Administrativo</h1>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 text-red-600 hover:text-red-700 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Sair</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4">
        <div className="bg-white rounded-lg shadow-sm">
          <div className="border-b">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 border-b-2 font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'border-red-600 text-red-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
          
          <div className="p-6">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}