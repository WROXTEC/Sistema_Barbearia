import React from 'react';
import { TrendingUp, TrendingDown, Users, Calendar, DollarSign, AlertTriangle, Crown, XCircle } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

export function Dashboard() {
  const { clients, appointments, services } = useApp();

  // Calcular estatísticas gerais
  const totalClients = clients.length;
  const totalAppointments = appointments.length;
  const completedAppointments = appointments.filter(a => a.status === 'completed').length;
  const cancelledAppointments = appointments.filter(a => a.status === 'cancelled').length;
  const scheduledAppointments = appointments.filter(a => a.status === 'scheduled').length;
  
  const totalRevenue = appointments
    .filter(a => a.status === 'completed')
    .reduce((sum, a) => sum + a.services.reduce((total, service) => total + service.price, 0), 0);

  // Calcular dados dos clientes
  const clientStats = clients.map(client => {
    const clientAppointments = appointments.filter(a => a.clientPhone === client.phone);
    const completedCount = clientAppointments.filter(a => a.status === 'completed').length;
    const cancelledCount = clientAppointments.filter(a => a.status === 'cancelled').length;
    const totalSpent = clientAppointments
      .filter(a => a.status === 'completed')
      .reduce((sum, a) => sum + a.services.reduce((total, service) => total + service.price, 0), 0);
    
    const cancellationRate = clientAppointments.length > 0 
      ? (cancelledCount / clientAppointments.length) * 100 
      : 0;

    return {
      ...client,
      totalAppointments: clientAppointments.length,
      completedAppointments: completedCount,
      cancelledAppointments: cancelledCount,
      totalSpent,
      cancellationRate
    };
  });

  // Rankings
  const bestClients = clientStats
    .filter(c => c.completedAppointments > 0)
    .sort((a, b) => b.totalSpent - a.totalSpent)
    .slice(0, 5);

  const mostFrequentClients = clientStats
    .filter(c => c.completedAppointments > 0)
    .sort((a, b) => b.completedAppointments - a.completedAppointments)
    .slice(0, 5);

  const mostCancellations = clientStats
    .filter(c => c.cancelledAppointments > 0)
    .sort((a, b) => b.cancelledAppointments - a.cancelledAppointments)
    .slice(0, 5);

  const highestCancellationRate = clientStats
    .filter(c => c.totalAppointments >= 3 && c.cancellationRate > 0)
    .sort((a, b) => b.cancellationRate - a.cancellationRate)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>

      {/* Estatísticas Gerais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-medium">Total de Clientes</p>
              <p className="text-2xl font-bold text-blue-800">{totalClients}</p>
            </div>
            <Users className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-green-50 p-6 rounded-lg border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm font-medium">Agendamentos Concluídos</p>
              <p className="text-2xl font-bold text-green-800">{completedAppointments}</p>
            </div>
            <Calendar className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-600 text-sm font-medium">Agendamentos Pendentes</p>
              <p className="text-2xl font-bold text-yellow-800">{scheduledAppointments}</p>
            </div>
            <Calendar className="w-8 h-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-600 text-sm font-medium">Receita Total</p>
              <p className="text-2xl font-bold text-purple-800">R$ {totalRevenue.toFixed(2)}</p>
            </div>
            <DollarSign className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Rankings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Melhores Clientes por Valor */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center space-x-2 mb-4">
            <Crown className="w-5 h-5 text-yellow-600" />
            <h3 className="text-lg font-semibold text-gray-800">Top 5 - Melhores Clientes (Valor)</h3>
          </div>
          <div className="space-y-3">
            {bestClients.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Nenhum cliente com agendamentos concluídos</p>
            ) : (
              bestClients.map((client, index) => (
                <div key={client.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                      index === 0 ? 'bg-yellow-500' : 
                      index === 1 ? 'bg-gray-400' : 
                      index === 2 ? 'bg-orange-600' : 'bg-gray-300'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{client.name}</p>
                      <p className="text-sm text-gray-600">{client.completedAppointments} agendamentos</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">R$ {client.totalSpent.toFixed(2)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Clientes Mais Frequentes */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center space-x-2 mb-4">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-800">Top 5 - Clientes Mais Frequentes</h3>
          </div>
          <div className="space-y-3">
            {mostFrequentClients.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Nenhum cliente com agendamentos concluídos</p>
            ) : (
              mostFrequentClients.map((client, index) => (
                <div key={client.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                      index === 0 ? 'bg-green-500' : 
                      index === 1 ? 'bg-green-400' : 
                      index === 2 ? 'bg-green-300' : 'bg-gray-300'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{client.name}</p>
                      <p className="text-sm text-gray-600">R$ {client.totalSpent.toFixed(2)} gasto</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-blue-600">{client.completedAppointments} visitas</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Clientes que Mais Cancelam */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center space-x-2 mb-4">
            <XCircle className="w-5 h-5 text-red-600" />
            <h3 className="text-lg font-semibold text-gray-800">Top 5 - Mais Cancelamentos</h3>
          </div>
          <div className="space-y-3">
            {mostCancellations.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Nenhum cancelamento registrado</p>
            ) : (
              mostCancellations.map((client, index) => (
                <div key={client.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-white font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{client.name}</p>
                      <p className="text-sm text-gray-600">{client.totalAppointments} agendamentos totais</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-red-600">{client.cancelledAppointments} cancelamentos</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Maior Taxa de Cancelamento */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center space-x-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            <h3 className="text-lg font-semibold text-gray-800">Top 5 - Maior Taxa de Cancelamento</h3>
          </div>
          <div className="space-y-3">
            {highestCancellationRate.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Nenhum cliente com taxa significativa de cancelamento</p>
            ) : (
              highestCancellationRate.map((client, index) => (
                <div key={client.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{client.name}</p>
                      <p className="text-sm text-gray-600">
                        {client.cancelledAppointments}/{client.totalAppointments} cancelamentos
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-orange-600">{client.cancellationRate.toFixed(1)}%</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Estatísticas Adicionais */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Estatísticas Gerais</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-gray-800">{totalAppointments}</p>
            <p className="text-sm text-gray-600">Total de Agendamentos</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-red-600">{cancelledAppointments}</p>
            <p className="text-sm text-gray-600">Cancelamentos</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-orange-600">
              {totalAppointments > 0 ? ((cancelledAppointments / totalAppointments) * 100).toFixed(1) : 0}%
            </p>
            <p className="text-sm text-gray-600">Taxa de Cancelamento</p>
          </div>
        </div>
      </div>
    </div>
  );
}