import React from 'react';
import { Calendar, MessageCircle, Instagram, Info, User, Shield, Ban, CheckCircle } from 'lucide-react';
import { useApp } from '../contexts/AppContext';

export function MainMenu() {
  const { setCurrentView, setIsAdmin } = useApp();

  const menuItems = [
    {
      icon: Calendar,
      text: 'Agende seu horário',
      action: () => setCurrentView('schedule')
    },
    {
      icon: MessageCircle,
      text: 'Whatsapp',
      action: () => window.open('https://wa.me/5517988264100', '_blank')
    },
    {
      icon: Instagram,
      text: 'Instagram',
      action: () => window.open('https://www.instagram.com/wendelroliveira/', '_blank')
    },
    {
      icon: Info,
      text: 'Informações da barbearia',
      action: () => setCurrentView('info')
    },
    {
      icon: User,
      text: 'Meus agendamentos',
      action: () => setCurrentView('my-appointments')
    }
  ];

  const handleAdminAccess = () => {
    console.log('Admin access button clicked');
    const password = prompt('Digite a senha de administrador:');
    console.log('Password entered:', password ? 'Yes' : 'No');
    if (password === 'W13n12a26l28@') {
      console.log('Password correct, setting admin to true');
      setIsAdmin(true);
    } else if (password) {
      console.log('Password incorrect');
      alert('Senha incorreta!');
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-4">
      {menuItems.map((item, index) => (
        <button
          key={index}
          onClick={item.action}
          className="w-full bg-gray-700 hover:bg-gray-600 text-white py-4 px-6 rounded-lg flex items-center justify-center space-x-3 transition-all duration-300 transform hover:scale-105 shadow-lg"
        >
          <item.icon className="w-6 h-6" />
          <span className="font-medium">{item.text}</span>
        </button>
      ))}
      
      {/* Admin Access - Shield Icon - Top Right */}
      <div className="fixed top-6 right-6 z-50">
        <button
          onClick={handleAdminAccess}
          className="w-12 h-12 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center shadow-lg transition-all duration-300 transform hover:scale-110"
          title="Acesso Administrativo"
        >
          <Shield className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}