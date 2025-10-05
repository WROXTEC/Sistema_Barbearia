import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, Phone, CheckCircle, XCircle, CreditCard as Edit, UserCheck } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { supabase } from '../../lib/supabase';
import { Appointment, Employee } from '../../types';

interface AppointmentWithEmployee extends Appointment {
  employeeName?: string;
  employeeId?: string;
}

export function AppointmentManager() {
  const { appointments, setAppointments } = useApp();
  const [filter, setFilter] = useState<'all' | 'scheduled' | 'completed' | 'cancelled'>('all');
  const [employeeFilter, setEmployeeFilter] = useState<string>('all');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [appointmentsWithEmployee, setAppointmentsWithEmployee] = useState<AppointmentWithEmployee[]>([]);

  useEffect(() => {
    loadEmployees();
    loadAppointments();
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

  const loadAppointments = async () => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          appointment_services (
            service_name,
            service_price,
            service_duration
          )
        `)
        .order('appointment_date', { ascending: false })
        .order('appointment_time', { ascending: false });

      if (error) throw error;

      if (data) {
        const appointmentsData: AppointmentWithEmployee[] = data.map(dbApp => ({
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
          employeeName: dbApp.employee_name,
          employeeId: dbApp.employee_id
        }));
        setAppointmentsWithEmployee(appointmentsData);
        setAppointments(appointmentsData);
      }
    } catch (error) {
      console.error('Erro ao carregar agendamentos:', error);
    }
  };

  const updateAppointmentStatus = async (appointmentId: string, newStatus: Appointment['status']) => {
    try {
      // Atualizar no banco de dados
      const { error } = await supabase
        .from('appointments')
        .update({ status: newStatus })
        .eq('id', appointmentId);

      if (error) {
        console.error('Erro ao atualizar status:', error);
        alert('Erro ao atualizar agendamento. Tente novamente.');
        return;
      }

      // Atualizar estado local
      setAppointments(appointments.map(appointment =>
        appointment.id === appointmentId
          ? { ...appointment, status: newStatus }
          : appointment
      ));

      const statusText = {
        scheduled: 'reagendado',
        completed: 'concluído',
        cancelled: 'cancelado'
      };

      alert(`Agendamento ${statusText[newStatus]} com sucesso!`);
    } catch (error) {
      console.error('Erro geral na atualização:', error);
      alert('Erro ao atualizar agendamento. Tente novamente.');
    }
  };

  const filteredAppointments = appointmentsWithEmployee.filter(appointment => {
    if (filter !== 'all' && appointment.status !== filter) return false;
    if (employeeFilter !== 'all') {
      if (employeeFilter === 'none') {
        return !appointment.employeeId;
      }
      return appointment.employeeId === employeeFilter;
    }
    return true;
  });

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
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Gerenciar Agendamentos</h2>

        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <UserCheck className="inline w-4 h-4 mr-1" />
              Filtrar por profissional
            </label>
            <select
              value={employeeFilter}
              onChange={(e) => setEmployeeFilter(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="all">Todos os profissionais</option>
              <option value="none">Sem profissional definido</option>
              {employees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex space-x-2">
          {(['all', 'scheduled', 'completed', 'cancelled'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                filter === status
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {status === 'all' ? 'Todos' : getStatusText(status)}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {filteredAppointments.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Nenhum agendamento encontrado.</p>
          </div>
        ) : (
          filteredAppointments.map((appointment) => (
            <div key={appointment.id} className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="mb-2">
                    <h3 className="text-lg font-medium text-gray-800 mb-1">
                      {appointment.services.map(s => s.name).join(' + ')}
                    </h3>
                    {appointment.services.length > 1 && (
                      <div className="text-sm text-gray-500">
                        {appointment.services.length} serviços selecionados
                      </div>
                    )}
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                    {getStatusText(appointment.status)}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-gray-800">
                    R$ {appointment.services.reduce((total, service) => total + service.price, 0).toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-500">
                    {appointment.services.reduce((total, service) => total + service.duration, 0)} min
                  </div>
                </div>
              </div>

              {appointment.services.length > 1 && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Detalhes dos serviços:</h4>
                  <div className="space-y-1">
                    {appointment.services.map((service, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="text-gray-600">{service.name}</span>
                        <div className="text-right">
                          <span className="text-gray-800 font-medium">R$ {service.price.toFixed(2)}</span>
                          <span className="text-gray-500 ml-2">({service.duration}min)</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                  <div className="flex items-center text-gray-600">
                    <User className="w-4 h-4 mr-2" />
                    <span className="font-medium">{appointment.clientName}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Phone className="w-4 h-4 mr-2" />
                    <span>{appointment.clientPhone}</span>
                  </div>
                  {appointment.employeeName && (
                    <div className="flex items-center text-gray-600">
                      <UserCheck className="w-4 h-4 mr-2" />
                      <span className="text-red-600 font-medium">{appointment.employeeName}</span>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <div className="flex items-center text-gray-600">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>{appointment.date.split('-').reverse().join('/')}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Clock className="w-4 h-4 mr-2" />
                    <span>{appointment.time}</span>
                  </div>
                </div>
              </div>

              <div className="flex space-x-2">
                {appointment.status === 'scheduled' && (
                  <>
                    <button
                      onClick={() => updateAppointmentStatus(appointment.id, 'completed')}
                      className="flex items-center space-x-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Concluir</span>
                    </button>
                    <button
                      onClick={() => updateAppointmentStatus(appointment.id, 'cancelled')}
                      className="flex items-center space-x-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Cancelar</span>
                    </button>
                  </>
                )}
                {appointment.status === 'cancelled' && (
                  <button
                    onClick={() => updateAppointmentStatus(appointment.id, 'scheduled')}
                    className="flex items-center space-x-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Reagendar</span>
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}