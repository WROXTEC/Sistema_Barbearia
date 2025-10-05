import React, { useState } from 'react';
import { Plus, CreditCard as Edit, Trash2, Users, Phone, Calendar, User, Ban, CheckCircle } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { Client } from '../../types';

export function ClientManager() {
  const { clients, setClients, appointments } = useApp();
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isEditing) {
      setClients(clients.map(client =>
        client.id === isEditing
          ? { ...client, ...formData }
          : client
      ));
      setIsEditing(null);
    } else {
      const newClient: Client = {
        id: Date.now().toString(),
        ...formData,
        createdAt: new Date().toISOString(),
        totalAppointments: 0
      };
      setClients([...clients, newClient]);
    }

    setFormData({ name: '', phone: '', email: '' });
  };

  const handleEdit = (client: Client) => {
    setFormData({
      name: client.name,
      phone: client.phone,
      email: client.email || ''
    });
    setIsEditing(client.id);
  };

  const handleDelete = (clientId: string) => {
    if (confirm('Tem certeza que deseja excluir este cliente?')) {
      setClients(clients.filter(client => client.id !== clientId));
    }
  };

  const cancelEdit = () => {
    setIsEditing(null);
    setFormData({ name: '', phone: '', email: '', isBlocked: false });
  };

  const toggleBlockClient = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    if (!client) return;

    const action = client.isBlocked ? 'desbloquear' : 'bloquear';
    if (confirm(`Tem certeza que deseja ${action} este cliente?`)) {
      setClients(clients.map(c =>
        c.id === clientId
          ? { ...c, isBlocked: !c.isBlocked }
          : c
      ));
    }
  };

  const getClientAppointments = (clientPhone: string) => {
    return appointments.filter(appointment => appointment.clientPhone === clientPhone);
  };

  const getLastAppointment = (clientPhone: string) => {
    const clientAppointments = getClientAppointments(clientPhone);
    if (clientAppointments.length === 0) return null;
    
    const sortedAppointments = clientAppointments.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    return sortedAppointments[0];
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">Gerenciar Clientes</h2>
        <div className="text-sm text-gray-600">
          Total de clientes: {clients.length}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-medium text-gray-800 mb-4">
            {isEditing ? 'Editar Cliente' : 'Novo Cliente'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome Completo
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Telefone/WhatsApp
              </label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email (opcional)
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>{isEditing ? 'Atualizar' : 'Adicionar'}</span>
              </button>
              
              {isEditing && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Clients List */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-800">Clientes Cadastrados</h3>
          
          {clients.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Nenhum cliente cadastrado.</p>
            </div>
          ) : (
            <div className="max-h-96 overflow-y-auto space-y-3">
              {clients.map((client) => {
                const clientAppointments = getClientAppointments(client.phone);
                const lastAppointment = getLastAppointment(client.phone);
                
                return (
                  <div key={client.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <User className="w-4 h-4 text-gray-500" />
                          <h4 className="text-lg font-medium text-gray-800">{client.name}</h4>
                        </div>
                        
                        <div className="space-y-1 text-sm text-gray-600">
                          <div className="flex items-center space-x-2">
                            <Phone className="w-3 h-3" />
                            <span>{client.phone}</span>
                          </div>
                          
                          {client.email && (
                            <div className="flex items-center space-x-2">
                              <span className="w-3 h-3 text-center">@</span>
                              <span>{client.email}</span>
                            </div>
                          )}
                          
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-3 h-3" />
                            <span>
                              {clientAppointments.length} agendamento{clientAppointments.length !== 1 ? 's' : ''}
                            </span>
                          </div>
                          
                          {lastAppointment && (
                            <div className="text-xs text-gray-500">
                              Último agendamento: {new Date(lastAppointment.date).toLocaleDateString('pt-BR')}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex space-x-2 ml-4">
                        <button
                          onClick={() => toggleBlockClient(client.id)}
                          className={`p-2 rounded-lg transition-colors ${
                            client.isBlocked
                              ? 'text-green-600 hover:bg-green-50'
                              : 'text-red-600 hover:bg-red-50'
                          }`}
                          title={client.isBlocked ? 'Desbloquear cliente' : 'Bloquear cliente'}
                        >
                          {client.isBlocked ? <CheckCircle className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => handleEdit(client)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(client.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}