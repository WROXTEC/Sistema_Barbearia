import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, Clock, ChevronDown, Check, X, UserCheck } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { supabase } from '../lib/supabase';
import { Appointment, Client, Employee } from '../types';

export function ScheduleForm() {
  const { setCurrentView, services, appointments, setAppointments, clients, setClients } = useApp();
  const [isServiceDropdownOpen, setIsServiceDropdownOpen] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [formData, setFormData] = useState({
    clientName: '',
    clientPhone: '',
    selectedServices: [] as string[],
    employeeId: '',
    date: '',
    time: ''
  });

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

  const availableTimes = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const existingClient = clients.find(client => client.phone === formData.clientPhone);

    const selectedServices = services.filter(s => formData.selectedServices.includes(s.id));
    if (selectedServices.length === 0) {
      alert('Por favor, selecione pelo menos um serviço.');
      return;
    }

    try {
      let clientId = existingClient?.id;
      let clientData = existingClient;

      // Gerenciar cliente no banco de dados
      if (!existingClient) {
        // Primeiro, tentar buscar o cliente no banco de dados pelo telefone
        const { data: existingDbClient, error: fetchError } = await supabase
          .from('clients')
          .select('*')
          .eq('phone', formData.clientPhone)
          .maybeSingle();

        if (fetchError) {
          console.error('Erro ao buscar cliente:', fetchError);
          alert('Erro ao buscar cliente. Tente novamente.');
          return;
        }

        if (existingDbClient) {
          // Cliente já existe no banco, atualizar o contador
          clientId = existingDbClient.id;

          const { error: updateError } = await supabase
            .from('clients')
            .update({ total_appointments: existingDbClient.total_appointments + 1 })
            .eq('id', existingDbClient.id);

          if (updateError) {
            console.error('Erro ao atualizar cliente:', updateError);
          }

          // Atualizar estado local
          const updatedClient: Client = {
            id: existingDbClient.id,
            name: existingDbClient.name,
            phone: existingDbClient.phone,
            email: existingDbClient.email,
            createdAt: existingDbClient.created_at,
            totalAppointments: existingDbClient.total_appointments + 1,
            isBlocked: existingDbClient.is_blocked
          };
          setClients([...clients, updatedClient]);
          clientData = updatedClient;
        } else {
          // Cliente não existe, criar novo
          const { data: newClient, error: clientError } = await supabase
            .from('clients')
            .insert([{
              name: formData.clientName,
              phone: formData.clientPhone,
              total_appointments: 1
            }])
            .select()
            .single();

          if (clientError) {
            console.error('Erro ao criar cliente:', clientError);
            alert('Erro ao criar cliente. Tente novamente.');
            return;
          }

          clientId = newClient.id;

          // Atualizar estado local
          const newClientLocal: Client = {
            id: newClient.id,
            name: newClient.name,
            phone: newClient.phone,
            email: newClient.email,
            createdAt: newClient.created_at,
            totalAppointments: newClient.total_appointments,
            isBlocked: newClient.is_blocked
          };
          setClients([...clients, newClientLocal]);
          clientData = newClientLocal;
        }
      } else {
        // Atualizar contador de agendamentos do cliente existente
        const { error: updateError } = await supabase
          .from('clients')
          .update({ total_appointments: existingClient.totalAppointments + 1 })
          .eq('id', existingClient.id);

        if (updateError) {
          console.error('Erro ao atualizar cliente:', updateError);
        }

        // Atualizar estado local
        setClients(clients.map(client =>
          client.phone === formData.clientPhone
            ? { ...client, totalAppointments: client.totalAppointments + 1 }
            : client
        ));
      }

      // Verificar se o cliente está bloqueado após obter os dados atualizados
      if (clientData && clientData.isBlocked) {
        const whatsappNumber = '5517988264100';
        const message = encodeURIComponent('Olá! Gostaria de fazer um agendamento, mas parece que minha conta está bloqueada. Poderia me ajudar?');
        const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;

        if (confirm('Sua conta está temporariamente bloqueada para agendamentos online.\n\nDeseja entrar em contato via WhatsApp para resolver esta situação?')) {
          window.open(whatsappUrl, '_blank');
        }
        return;
      }

      // Calcular totais
      const totalPrice = selectedServices.reduce((sum, service) => sum + service.price, 0);
      const totalDuration = selectedServices.reduce((sum, service) => sum + service.duration, 0);

      // Buscar nome do funcionário selecionado
      const selectedEmployee = formData.employeeId
        ? employees.find(e => e.id === formData.employeeId)
        : null;

      // Criar agendamento no banco
      const { data: newAppointment, error: appointmentError } = await supabase
        .from('appointments')
        .insert([{
          client_id: clientId,
          client_name: formData.clientName,
          client_phone: formData.clientPhone,
          employee_id: formData.employeeId || null,
          employee_name: selectedEmployee?.name || null,
          appointment_date: formData.date,
          appointment_time: formData.time,
          status: 'scheduled',
          total_price: totalPrice,
          total_duration: totalDuration,
          notes: ''
        }])
        .select()
        .single();

      if (appointmentError) {
        console.error('Erro ao criar agendamento:', appointmentError);
        alert('Erro ao criar agendamento. Tente novamente.');
        return;
      }

      // Criar registros dos serviços do agendamento
      const appointmentServices = selectedServices.map(service => ({
        appointment_id: newAppointment.id,
        service_id: service.id,
        service_name: service.name,
        service_price: service.price,
        service_duration: service.duration
      }));

      const { error: servicesError } = await supabase
        .from('appointment_services')
        .insert(appointmentServices);

      if (servicesError) {
        console.error('Erro ao criar serviços do agendamento:', servicesError);
        // Não bloqueia o fluxo, mas loga o erro
      }

      // Atualizar estado local
      const newAppointmentLocal: Appointment = {
        id: newAppointment.id,
        clientName: formData.clientName,
        clientPhone: formData.clientPhone,
        services: selectedServices,
        date: formData.date,
        time: formData.time,
        status: 'scheduled'
      };

      setAppointments([...appointments, newAppointmentLocal]);
      
      alert('Agendamento realizado com sucesso!');
      setCurrentView('home');
    } catch (error) {
      console.error('Erro geral:', error);
      alert('Erro ao processar agendamento. Tente novamente.');
    }
  };

  const handleServiceToggle = (serviceId: string) => {
    const isSelected = formData.selectedServices.includes(serviceId);
    if (isSelected) {
      setFormData(prev => ({
        ...prev,
        selectedServices: prev.selectedServices.filter(id => id !== serviceId)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        selectedServices: [...prev.selectedServices, serviceId]
      }));
    }
  };

  const removeService = (serviceId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedServices: prev.selectedServices.filter(id => id !== serviceId)
    }));
  };

  const getSelectedServicesText = () => {
    if (formData.selectedServices.length === 0) {
      return 'Selecione os serviços desejados';
    }
    if (formData.selectedServices.length === 1) {
      const service = services.find(s => s.id === formData.selectedServices[0]);
      return service ? service.name : 'Serviço selecionado';
    }
    return `${formData.selectedServices.length} serviços selecionados`;
  };

  const getTotalPrice = () => {
    return services
      .filter(s => formData.selectedServices.includes(s.id))
      .reduce((total, service) => total + service.price, 0);
  };

  const getTotalDuration = () => {
    return services
      .filter(s => formData.selectedServices.includes(s.id))
      .reduce((total, service) => total + service.duration, 0);
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
          <h2 className="text-2xl font-bold text-gray-800">Agendar Horário</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome Completo
            </label>
            <input
              type="text"
              required
              value={formData.clientName}
              onChange={(e) => setFormData({...formData, clientName: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Telefone/WhatsApp
            </label>
            <input
              type="tel"
              required
              value={formData.clientPhone}
              onChange={(e) => setFormData({...formData, clientPhone: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <UserCheck className="inline w-4 h-4 mr-2" />
              Profissional (opcional)
            </label>
            <select
              value={formData.employeeId}
              onChange={(e) => setFormData({...formData, employeeId: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="">Sem preferência</option>
              {employees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.name}
                  {employee.specialties.length > 0 && ` - ${employee.specialties.slice(0, 2).join(', ')}`}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Serviços
            </label>
            
            {/* Dropdown personalizado */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsServiceDropdownOpen(!isServiceDropdownOpen)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white text-left flex items-center justify-between"
              >
                <span className={formData.selectedServices.length === 0 ? 'text-gray-500' : 'text-gray-800'}>
                  {getSelectedServicesText()}
                </span>
                <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${
                  isServiceDropdownOpen ? 'rotate-180' : ''
                }`} />
              </button>

              {/* Dropdown menu */}
              {isServiceDropdownOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {services.map((service) => (
                    <div
                      key={service.id}
                      onClick={() => handleServiceToggle(service.id)}
                      className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <div className={`w-5 h-5 border-2 rounded flex items-center justify-center ${
                              formData.selectedServices.includes(service.id)
                                ? 'bg-red-600 border-red-600'
                                : 'border-gray-300'
                            }`}>
                              {formData.selectedServices.includes(service.id) && (
                                <Check className="w-3 h-3 text-white" />
                              )}
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-800">{service.name}</h4>
                              <p className="text-sm text-gray-600">{service.description}</p>
                            </div>
                          </div>
                        </div>
                        <div className="text-right ml-4">
                          <div className="font-bold text-red-600">R$ {service.price.toFixed(2)}</div>
                          <div className="text-sm text-gray-500">{service.duration} min</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Serviços selecionados */}
            {formData.selectedServices.length > 0 && (
              <div className="mt-3">
                <div className="flex flex-wrap gap-2 mb-3">
                  {services
                    .filter(s => formData.selectedServices.includes(s.id))
                    .map(service => (
                      <div key={service.id} className="flex items-center bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm">
                        <span>{service.name}</span>
                        <button
                          type="button"
                          onClick={() => removeService(service.id)}
                          className="ml-2 hover:bg-red-200 rounded-full p-1"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))
                  }
                </div>
              </div>
            )}
            
            {formData.selectedServices.length > 0 && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-700">Total:</span>
                  <span className="font-bold text-red-600">R$ {getTotalPrice().toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-sm mt-1">
                  <span className="text-gray-700">Duração estimada:</span>
                  <span className="text-gray-600">{getTotalDuration()} minutos</span>
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="inline w-4 h-4 mr-2" />
              Data
            </label>
            <input
              type="date"
              required
              value={formData.date}
              onChange={(e) => setFormData({...formData, date: e.target.value})}
              min={new Date().toISOString().split('T')[0]}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Clock className="inline w-4 h-4 mr-2" />
              Horário
            </label>
            <select
              required
              value={formData.time}
              onChange={(e) => setFormData({...formData, time: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="">Selecione um horário</option>
              {availableTimes.map((time) => (
                <option key={time} value={time}>{time}</option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="w-full bg-red-600 hover:bg-red-700 text-white py-3 px-6 rounded-lg font-medium transition-colors"
          >
            Confirmar Agendamento
          </button>
        </form>
      </div>
      
      {/* Overlay para fechar dropdown */}
      {isServiceDropdownOpen && (
        <div 
          className="fixed inset-0 z-5"
          onClick={() => setIsServiceDropdownOpen(false)}
        />
      )}
    </div>
  );
}