import React, { useState } from 'react';
import { ArrowLeft, Search, Calendar, Clock, User, Phone, XCircle, AlertTriangle } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { supabase } from '../lib/supabase';

interface AppointmentWithTotal extends typeof appointments[0] {
  totalPrice?: number;
}

export function MyAppointments() {
  const { setCurrentView, appointments, setAppointments } = useApp();
  const [searchPhone, setSearchPhone] = useState('');
  const [foundAppointments, setFoundAppointments] = useState<AppointmentWithTotal[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async () => {
    if (!searchPhone.trim()) return;
    
    setIsLoading(true);
    try {
      // Buscar agendamentos no banco de dados
      const { data: dbAppointments, error } = await supabase
        .from('appointments')
        .select(`
          *,
          appointment_services (
            service_name,
            service_price,
            service_duration
          )
        `)
        .ilike('client_phone', `%${searchPhone.trim()}%`)
        .order('appointment_date', { ascending: false });

      if (error) {
        console.error('Erro ao buscar agendamentos:', error);
        alert('Erro ao buscar agendamentos. Tente novamente.');
        return;
      }

      // Converter dados do banco para formato local
      const convertedAppointments = dbAppointments.map(dbApp => ({
        id: dbApp.id,
        clientName: dbApp.client_name,
        clientPhone: dbApp.client_phone,
        services: dbApp.appointment_services && dbApp.appointment_services.length > 0
          ? dbApp.appointment_services.map((service: any) => ({
              id: '',
              name: service.service_name,
              description: '',
              price: parseFloat(service.service_price) || 0,
              duration: service.service_duration
            }))
          : [],
        date: dbApp.appointment_date,
        time: dbApp.appointment_time,
        status: dbApp.status as 'scheduled' | 'completed' | 'cancelled',
        totalPrice: parseFloat(dbApp.total_price) || 0
      }));

      setFoundAppointments(convertedAppointments);
      setHasSearched(true);
    } catch (error) {
      console.error('Erro geral na busca:', error);
      alert('Erro ao buscar agendamentos. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const canCancelAppointment = (appointment: typeof appointments[0]) => {
    if (appointment.status !== 'scheduled') return false;
    
    const appointmentDateTime = new Date(`${appointment.date}T${appointment.time}`);
    const now = new Date();
    const timeDifference = appointmentDateTime.getTime() - now.getTime();
    const hoursUntilAppointment = timeDifference / (1000 * 60 * 60);
    
    return hoursUntilAppointment >= 2;
  };

  const getTimeUntilAppointment = (appointment: typeof appointments[0]) => {
    const appointmentDateTime = new Date(`${appointment.date}T${appointment.time}`);
    const now = new Date();
    const timeDifference = appointmentDateTime.getTime() - now.getTime();
    const hoursUntilAppointment = timeDifference / (1000 * 60 * 60);
    
    if (hoursUntilAppointment < 0) return 'Horário passou';
    if (hoursUntilAppointment < 1) return `${Math.round(hoursUntilAppointment * 60)} minutos`;
    return `${Math.round(hoursUntilAppointment * 10) / 10} horas`;
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    const appointment = appointments.find(a => a.id === appointmentId);
    if (!appointment) return;

    if (!canCancelAppointment(appointment)) {
      alert('Não é possível cancelar agendamentos com menos de 2 horas de antecedência.\n\nPara cancelamentos de última hora, entre em contato diretamente com a barbearia.');
      return;
    }

    if (confirm('Tem certeza que deseja cancelar este agendamento?')) {
      try {
        // Cancelar no banco de dados
        const { error } = await supabase
          .from('appointments')
          .update({ status: 'cancelled' })
          .eq('id', appointmentId);

        if (error) {
          console.error('Erro ao cancelar agendamento:', error);
          alert('Erro ao cancelar agendamento. Tente novamente.');
          return;
        }

        // Atualizar estados locais
        setAppointments(appointments.map(a =>
          a.id === appointmentId
            ? { ...a, status: 'cancelled' as const }
            : a
        ));
        
        setFoundAppointments(foundAppointments.map(a =>
          a.id === appointmentId
            ? { ...a, status: 'cancelled' as const }
            : a
        ));
        
        alert('Agendamento cancelado com sucesso!');
      } catch (error) {
        console.error('Erro geral no cancelamento:', error);
        alert('Erro ao cancelar agendamento. Tente novamente.');
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'text-blue-600 bg-blue-100';
      case 'completed': return 'text-green-600 bg-green-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'scheduled': return 'Agendado';
      case 'completed': return 'Concluído';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center mb-6">
          <button
            onClick={() => setCurrentView('home')}
            className="mr-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <h2 className="text-2xl font-bold text-gray-800">Meus Agendamentos</h2>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Phone className="inline w-4 h-4 mr-2" />
            Digite seu telefone para buscar agendamentos
          </label>
          <div className="flex space-x-2">
            <input
              type="tel"
              value={searchPhone}
              onChange={(e) => setSearchPhone(e.target.value)}
              placeholder="Ex: (11) 99999-9999"
              className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
            <button
              onClick={handleSearch}
              disabled={isLoading}
              className="px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Search className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {hasSearched && (
          <div className="space-y-4">
            {foundAppointments.length === 0 ? (
              <div className="text-center py-8">
                <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Nenhum agendamento encontrado para este número.</p>
              </div>
            ) : (
              foundAppointments.map((appointment) => (
                <div key={appointment.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-800 mb-1">
                        {appointment.services.length > 0
                          ? appointment.services.map(s => s.name).join(' + ')
                          : 'Agendamento'}
                      </h3>
                      {appointment.services.length > 1 && (
                        <div className="text-xs text-gray-500">
                          {appointment.services.length} serviços selecionados
                        </div>
                      )}
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                      {getStatusText(appointment.status)}
                    </span>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center text-gray-600">
                      <User className="w-4 h-4 mr-2" />
                      {appointment.clientName}
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Calendar className="w-4 h-4 mr-2" />
                      {appointment.date.split('-').reverse().join('/')}
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Clock className="w-4 h-4 mr-2" />
                      {appointment.time}
                    </div>
                    <div className="text-gray-800 font-medium">
                      R$ {(appointment.totalPrice || appointment.services.reduce((total, service) => total + service.price, 0)).toFixed(2)}
                    </div>
                    
                    {appointment.status === 'scheduled' && (
                      <div className="mt-2 pt-2 border-t border-gray-200">
                        <div className="flex items-center justify-between">
                          <div className="text-xs text-gray-500">
                            Tempo restante: {getTimeUntilAppointment(appointment)}
                          </div>
                          {canCancelAppointment(appointment) ? (
                            <button
                              onClick={() => handleCancelAppointment(appointment.id)}
                              className="flex items-center space-x-1 px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs transition-colors"
                            >
                              <XCircle className="w-3 h-3" />
                              <span>Cancelar</span>
                            </button>
                          ) : (
                            <div className="flex items-center space-x-1 text-xs text-gray-500">
                              <AlertTriangle className="w-3 h-3" />
                              <span>Cancelamento indisponível</span>
                            </div>
                          )}
                        </div>
                        {!canCancelAppointment(appointment) && appointment.status === 'scheduled' && (
                          <div className="text-xs text-red-600 mt-1">
                            Cancelamentos só são permitidos até 2h antes do horário
                          </div>
                        )}
                      </div>
                    )}
                    
                    {appointment.services.length > 0 && (
                      <div className="text-xs text-gray-500 mt-2 pt-2 border-t border-gray-200">
                        <div className="font-medium text-gray-700 mb-1">Serviços:</div>
                        <div className="space-y-1">
                          {appointment.services.map((service, index) => (
                            <div key={index} className="flex justify-between">
                              <span>{service.name}</span>
                              <span>R$ {service.price.toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}