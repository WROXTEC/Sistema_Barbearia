import React, { useState, useEffect } from 'react';
import { Plus, CreditCard as Edit, Trash2, Users, Phone, Mail, UserCheck, UserX, Camera, X } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { supabase } from '../../lib/supabase';
import { Employee, EmployeeSpecialty } from '../../types';

const specialtyOptions: { value: EmployeeSpecialty; label: string }[] = [
  { value: 'cabeleireiro', label: 'Cabeleireiro' },
  { value: 'barbeiro', label: 'Barbeiro' },
  { value: 'manicure', label: 'Manicure' },
  { value: 'pedicure', label: 'Pedicure' },
  { value: 'esteticista', label: 'Esteticista' }
];

export function EmployeeManager() {
  const { employees, setEmployees } = useApp();
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    specialties: [] as string[],
    isActive: true,
    photoUrl: ''
  });
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .order('created_at', { ascending: false });

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isEditing) {
        const { error } = await supabase
          .from('employees')
          .update({
            name: formData.name,
            phone: formData.phone,
            email: formData.email || null,
            specialties: formData.specialties,
            is_active: formData.isActive,
            photo_url: formData.photoUrl || null
          })
          .eq('id', isEditing);

        if (error) throw error;

        setEmployees(employees.map(employee =>
          employee.id === isEditing
            ? { ...employee, ...formData }
            : employee
        ));
        setIsEditing(null);
      } else {
        const { data, error } = await supabase
          .from('employees')
          .insert([{
            name: formData.name,
            phone: formData.phone,
            email: formData.email || null,
            specialties: formData.specialties,
            is_active: formData.isActive,
            photo_url: formData.photoUrl || null
          }])
          .select()
          .single();

        if (error) throw error;

        const newEmployee: Employee = {
          id: data.id,
          name: data.name,
          phone: data.phone,
          email: data.email,
          specialties: data.specialties,
          isActive: data.is_active,
          createdAt: data.created_at,
          photoUrl: data.photo_url
        };
        setEmployees([newEmployee, ...employees]);
      }

      setFormData({ name: '', phone: '', email: '', specialties: [], isActive: true, photoUrl: '' });
      setPhotoPreview('');
      alert('Funcionário salvo com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar funcionário:', error);
      alert('Erro ao salvar funcionário');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (employee: Employee) => {
    setFormData({
      name: employee.name,
      phone: employee.phone,
      email: employee.email || '',
      specialties: employee.specialties,
      isActive: employee.isActive,
      photoUrl: employee.photoUrl || ''
    });
    setPhotoPreview(employee.photoUrl || '');
    setIsEditing(employee.id);
  };

  const handleDelete = async (employeeId: string) => {
    if (confirm('Tem certeza que deseja excluir este funcionário?')) {
      try {
        const { error } = await supabase
          .from('employees')
          .delete()
          .eq('id', employeeId);

        if (error) throw error;

        setEmployees(employees.filter(employee => employee.id !== employeeId));
        alert('Funcionário excluído com sucesso!');
      } catch (error) {
        console.error('Erro ao excluir funcionário:', error);
        alert('Erro ao excluir funcionário');
      }
    }
  };

  const cancelEdit = () => {
    setIsEditing(null);
    setFormData({ name: '', phone: '', email: '', specialties: [], isActive: true, photoUrl: '' });
    setPhotoPreview('');
  };

  const toggleEmployeeStatus = async (employeeId: string) => {
    const employee = employees.find(e => e.id === employeeId);
    if (!employee) return;

    const action = employee.isActive ? 'desativar' : 'ativar';
    if (confirm(`Tem certeza que deseja ${action} este funcionário?`)) {
      try {
        const { error } = await supabase
          .from('employees')
          .update({ is_active: !employee.isActive })
          .eq('id', employeeId);

        if (error) throw error;

        setEmployees(employees.map(e =>
          e.id === employeeId
            ? { ...e, isActive: !e.isActive }
            : e
        ));
      } catch (error) {
        console.error('Erro ao atualizar status:', error);
        alert('Erro ao atualizar status do funcionário');
      }
    }
  };

  const handleSpecialtyChange = (specialty: string, checked: boolean) => {
    if (checked) {
      setFormData({
        ...formData,
        specialties: [...formData.specialties, specialty]
      });
    } else {
      setFormData({
        ...formData,
        specialties: formData.specialties.filter(s => s !== specialty)
      });
    }
  };

  const getSpecialtyLabel = (specialty: string) => {
    const option = specialtyOptions.find(opt => opt.value === specialty);
    return option ? option.label : specialty;
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

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('A foto deve ter no máximo 2MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setFormData({ ...formData, photoUrl: base64String });
        setPhotoPreview(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setFormData({ ...formData, photoUrl: '' });
    setPhotoPreview('');
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">Gerenciar Funcionários</h2>
        <div className="text-sm text-gray-600">
          Total de funcionários: {employees.length} | Ativos: {employees.filter(e => e.isActive).length}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-medium text-gray-800 mb-4">
            {isEditing ? 'Editar Funcionário' : 'Novo Funcionário'}
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Camera className="inline w-4 h-4 mr-1" />
                Foto do Funcionário
              </label>

              {photoPreview ? (
                <div className="relative inline-block">
                  <img
                    src={photoPreview}
                    alt="Preview"
                    className="w-32 h-32 object-cover rounded-lg border-2 border-gray-300"
                  />
                  <button
                    type="button"
                    onClick={removePhoto}
                    className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Camera className="w-8 h-8 mb-2 text-gray-500" />
                      <p className="text-sm text-gray-500">
                        Clique para enviar foto
                      </p>
                      <p className="text-xs text-gray-400">PNG, JPG (máx. 2MB)</p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handlePhotoChange}
                    />
                  </label>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Especialidades
              </label>
              <div className="space-y-2">
                {specialtyOptions.map((option) => (
                  <label key={option.value} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.specialties.includes(option.value)}
                      onChange={(e) => handleSpecialtyChange(option.value, e.target.checked)}
                      className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                    />
                    <span className="text-sm text-gray-700">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                  className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                />
                <span className="text-sm text-gray-700">Funcionário ativo</span>
              </label>
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
                <span>{loading ? 'Salvando...' : (isEditing ? 'Atualizar' : 'Adicionar')}</span>
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

        {/* Employees List */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-800">Funcionários Cadastrados</h3>
          
          {employees.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Nenhum funcionário cadastrado.</p>
            </div>
          ) : (
            <div className="max-h-96 overflow-y-auto space-y-3">
              {employees.map((employee) => (
                <div key={employee.id} className={`border rounded-lg p-4 ${
                  employee.isActive ? 'border-gray-200 bg-white' : 'border-gray-300 bg-gray-50'
                }`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      {employee.photoUrl ? (
                        <img
                          src={employee.photoUrl}
                          alt={employee.name}
                          className="w-16 h-16 object-cover rounded-lg border-2 border-gray-300"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                          <Users className="w-8 h-8 text-gray-400" />
                        </div>
                      )}

                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className={`text-lg font-medium ${
                            employee.isActive ? 'text-gray-800' : 'text-gray-500'
                          }`}>
                            {employee.name}
                          </h4>
                          {!employee.isActive && (
                            <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full font-medium">
                              INATIVO
                            </span>
                          )}
                        </div>
                      
                      <div className="space-y-1 text-sm text-gray-600 mb-3">
                        <div className="flex items-center space-x-2">
                          <Phone className="w-3 h-3" />
                          <span>{employee.phone}</span>
                        </div>
                        
                        {employee.email && (
                          <div className="flex items-center space-x-2">
                            <Mail className="w-3 h-3" />
                            <span>{employee.email}</span>
                          </div>
                        )}
                      </div>

                        <div className="flex flex-wrap gap-1">
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
                    </div>
                    
                    <div className="flex space-x-2 ml-4">
                      <button
                        onClick={() => toggleEmployeeStatus(employee.id)}
                        className={`p-2 rounded-lg transition-colors ${
                          employee.isActive
                            ? 'text-red-600 hover:bg-red-50'
                            : 'text-green-600 hover:bg-green-50'
                        }`}
                        title={employee.isActive ? 'Desativar funcionário' : 'Ativar funcionário'}
                      >
                        {employee.isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => handleEdit(employee)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(employee.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}