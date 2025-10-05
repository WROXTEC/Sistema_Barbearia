import React, { useState, useEffect } from 'react';
import { Save, MapPin, Phone, Instagram, Clock } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useApp } from '../../contexts/AppContext';

interface BarberInfoData {
  id?: string;
  name: string;
  address: string;
  phone: string;
  whatsapp: string;
  instagram: string;
  business_hours: {
    monday: string;
    tuesday: string;
    wednesday: string;
    thursday: string;
    friday: string;
    saturday: string;
    sunday: string;
  };
}

export function BarberInfoManager() {
  const { barberInfo, setBarberInfo } = useApp();
  const [formData, setFormData] = useState<BarberInfoData>({
    name: barberInfo.name,
    address: barberInfo.address,
    phone: barberInfo.phone,
    whatsapp: barberInfo.whatsapp,
    instagram: barberInfo.instagram,
    business_hours: barberInfo.hours
  });
  const [loading, setLoading] = useState(false);
  const [barberInfoId, setBarberInfoId] = useState<string | null>(null);

  useEffect(() => {
    loadBarberInfo();
  }, []);

  const loadBarberInfo = async () => {
    try {
      const { data, error } = await supabase
        .from('barber_info')
        .select('*')
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setBarberInfoId(data.id);
        setFormData({
          name: data.name,
          address: data.address,
          phone: data.phone,
          whatsapp: data.whatsapp,
          instagram: data.instagram,
          business_hours: data.business_hours
        });
      }
    } catch (error) {
      console.error('Erro ao carregar informações:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (barberInfoId) {
        const { error } = await supabase
          .from('barber_info')
          .update({
            name: formData.name,
            address: formData.address,
            phone: formData.phone,
            whatsapp: formData.whatsapp,
            instagram: formData.instagram,
            business_hours: formData.business_hours
          })
          .eq('id', barberInfoId);

        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('barber_info')
          .insert([{
            name: formData.name,
            address: formData.address,
            phone: formData.phone,
            whatsapp: formData.whatsapp,
            instagram: formData.instagram,
            business_hours: formData.business_hours
          }])
          .select()
          .single();

        if (error) throw error;
        if (data) setBarberInfoId(data.id);
      }

      setBarberInfo({
        name: formData.name,
        address: formData.address,
        phone: formData.phone,
        whatsapp: formData.whatsapp,
        instagram: formData.instagram,
        hours: formData.business_hours
      });

      alert('Informações atualizadas com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar informações:', error);
      alert('Erro ao salvar informações');
    } finally {
      setLoading(false);
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

  return (
    <div>
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800">Informações da Barbearia</h3>
        <p className="text-gray-600 text-sm">Gerencie as informações exibidas no site</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome da Barbearia
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Phone className="inline w-4 h-4 mr-1" />
              Telefone
            </label>
            <input
              type="text"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="(17) 98826-4100"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              WhatsApp (número)
            </label>
            <input
              type="text"
              required
              value={formData.whatsapp}
              onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
              placeholder="5517988264100"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Instagram className="inline w-4 h-4 mr-1" />
              Instagram
            </label>
            <input
              type="text"
              required
              value={formData.instagram}
              onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
              placeholder="@wendelroliveira"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <MapPin className="inline w-4 h-4 mr-1" />
            Endereço Completo
          </label>
          <input
            type="text"
            required
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            placeholder="Rua das Tesouras, 123 - Centro"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            <Clock className="inline w-4 h-4 mr-1" />
            Horário de Funcionamento
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {daysOfWeek.map((day) => (
              <div key={day.key}>
                <label className="block text-sm text-gray-600 mb-1">{day.label}</label>
                <input
                  type="text"
                  required
                  value={formData.business_hours[day.key as keyof typeof formData.business_hours]}
                  onChange={(e) => setFormData({
                    ...formData,
                    business_hours: {
                      ...formData.business_hours,
                      [day.key]: e.target.value
                    }
                  })}
                  placeholder="9:00 - 18:00 ou Fechado"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            <span>{loading ? 'Salvando...' : 'Salvar Alterações'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
