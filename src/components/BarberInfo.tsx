import React, { useEffect, useState } from 'react';
import { ArrowLeft, MapPin, Phone, Clock, Instagram, Users } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { supabase } from '../lib/supabase';
import { Employee } from '../types';

export function BarberInfo() {
  const { setCurrentView, barberInfo } = useApp();
  const [employees, setEmployees] = useState<Employee[]>([]);

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;

      if (data) {
        const employeesData: Employee[] = data.map(emp => ({
          id: emp.id,
          name: emp.name,
          phone: emp.phone,
          email: emp.email,
          specialties: emp.specialties || [],
          isActive: emp.is_active,
          createdAt: emp.created_at,
          photoUrl: emp.photo_url
        }));
        setEmployees(employeesData);
      }
    } catch (error) {
      console.error('Erro ao carregar funcionários:', error);
    }
  };

  const daysOfWeek = [
    { key: 'monday', label: 'Segunda-feira' },
    { key: 'tuesday', label: 'Terça-feira' },
    { key: 'wednesday', label: 'Quarta-feira' },
    { key: 'thursday', label: 'Quinta-feira' },
    { key: 'friday', label: 'Sexta-feira' },
    { key: 'saturday', label: 'Sábado' },
    { key: 'sunday', label: 'Domingo' }
  ];

  const getSpecialtyLabel = (specialty: string) => {
    const labels: Record<string, string> = {
      'cabeleireiro': 'Cabeleireiro',
      'barbeiro': 'Barbeiro',
      'manicure': 'Manicure',
      'pedicure': 'Pedicure',
      'esteticista': 'Esteticista'
    };
    return labels[specialty] || specialty;
  };

  const getSpecialtyColor = (specialty: string) => {
    const colors: Record<string, string> = {
      'cabeleireiro': 'bg-blue-100 text-blue-800',
      'barbeiro': 'bg-gray-100 text-gray-800',
      'manicure': 'bg-pink-100 text-pink-800',
      'pedicure': 'bg-purple-100 text-purple-800',
      'esteticista': 'bg-green-100 text-green-800'
    };
    return colors[specialty] || 'bg-gray-100 text-gray-800';
  };

  const googleMapsUrl = `https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${encodeURIComponent(barberInfo.address)}`;

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center mb-6">
            <button
              onClick={() => setCurrentView('home')}
              className="mr-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </button>
            <h2 className="text-2xl font-bold text-gray-800">Informações</h2>
          </div>

          <div className="space-y-6">
            <div className="text-center pb-6 border-b">
              <h3 className="text-xl font-bold text-gray-800 mb-2">{barberInfo.name}</h3>
              <p className="text-gray-600">Barbearia tradicional com toque moderno</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-red-600 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-gray-800">Endereço</h4>
                    <p className="text-gray-600">{barberInfo.address}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Phone className="w-5 h-5 text-red-600 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-gray-800">Contato</h4>
                    <p className="text-gray-600">{barberInfo.phone}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Instagram className="w-5 h-5 text-red-600 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-gray-800">Instagram</h4>
                    <a
                      href={`https://instagram.com/${barberInfo.instagram.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-red-600 hover:text-red-700 transition-colors"
                    >
                      {barberInfo.instagram}
                    </a>
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Clock className="w-5 h-5 text-red-600 mt-1 flex-shrink-0" />
                <div className="flex-1">
                  <h4 className="font-medium text-gray-800 mb-2">Horário de Funcionamento</h4>
                  <div className="space-y-1">
                    {daysOfWeek.map((day) => (
                      <div key={day.key} className="flex justify-between text-sm">
                        <span className="text-gray-600">{day.label}:</span>
                        <span className="text-gray-800 font-medium">
                          {barberInfo.hours[day.key as keyof typeof barberInfo.hours]}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {employees.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Users className="w-5 h-5 text-red-600 mr-2" />
              Nossa Equipe
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {employees.map((employee) => (
                <div key={employee.id} className="flex flex-col items-center text-center">
                  {employee.photoUrl ? (
                    <img
                      src={employee.photoUrl}
                      alt={employee.name}
                      className="w-24 h-24 object-cover rounded-full border-4 border-red-100 mb-3"
                    />
                  ) : (
                    <div className="w-24 h-24 bg-gray-200 rounded-full border-4 border-red-100 flex items-center justify-center mb-3">
                      <Users className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                  <h4 className="font-semibold text-gray-800 mb-1">{employee.name}</h4>
                  <div className="flex flex-wrap gap-1 justify-center">
                    {employee.specialties.map((specialty) => (
                      <span
                        key={specialty}
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getSpecialtyColor(specialty)}`}
                      >
                        {getSpecialtyLabel(specialty)}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <MapPin className="w-5 h-5 text-red-600 mr-2" />
            Nossa Localização
          </h3>
          <div className="w-full h-96 rounded-lg overflow-hidden border border-gray-300">
            <iframe
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              src={googleMapsUrl}
            />
          </div>
        </div>
      </div>
    </div>
  );
}