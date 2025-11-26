import React, { useState, useEffect } from 'react';
import { Client } from '../types';
import { Button } from './Button';
import { Input } from './Input';
import { Save, ArrowLeft, Building2 } from 'lucide-react';

interface ClientFormProps {
  userId: string;
  initialData?: Client;
  onSave: (client: Client) => void;
  onCancel: () => void;
}

export const ClientForm: React.FC<ClientFormProps> = ({ userId, initialData, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Client>({
    id: '',
    userId: userId,
    name: '',
    taxId: '',
    email: '',
    address: { street: '', number: '', city: '', state: '', zip: '' },
    notes: ''
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData(prev => ({ ...prev, id: crypto.randomUUID() }));
    }
  }, [initialData]);

  const updateAddress = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      address: { ...prev.address, [field]: value }
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto pb-12">
      <div className="flex items-center gap-3 mb-6">
        <Button type="button" variant="ghost" onClick={onCancel} className="bg-white border border-gray-200">
            <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
           <h2 className="text-xl font-bold text-gray-900">
              {initialData ? 'Editar Cliente' : 'Novo Cliente'}
           </h2>
           <p className="text-sm text-gray-500">Preencha os dados cadastrais do tomador de serviço.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex items-center gap-3">
            <div className="bg-primary-100 p-2 rounded-lg text-primary-600">
                <Building2 className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-gray-900">Dados Principais</h3>
        </div>
        
        <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                    <Input label="Razão Social / Nome Completo" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required placeholder="Ex: Empresa de Tecnologia Ltda" />
                </div>
                <Input label="CNPJ / CPF" value={formData.taxId} onChange={e => setFormData({...formData, taxId: e.target.value})} required placeholder="00.000.000/0000-00" />
                <Input label="Email para Contato" type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="financeiro@empresa.com" />
            </div>

            <div className="border-t border-gray-100 pt-5">
                <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                    Endereço
                </h3>
                <div className="grid grid-cols-12 gap-4">
                    {/* First Line: CEP, Street, Number */}
                    <div className="col-span-12 sm:col-span-3 lg:col-span-2">
                         <Input label="CEP" value={formData.address.zip} onChange={e => updateAddress('zip', e.target.value)} placeholder="00000-000" />
                    </div>
                    <div className="col-span-12 sm:col-span-6 lg:col-span-8">
                        <Input label="Logradouro" value={formData.address.street} onChange={e => updateAddress('street', e.target.value)} placeholder="Rua, Avenida..." />
                    </div>
                    <div className="col-span-12 sm:col-span-3 lg:col-span-2">
                        <Input label="Número" value={formData.address.number} onChange={e => updateAddress('number', e.target.value)} />
                    </div>
                    
                    {/* Second Line: City, State */}
                    <div className="col-span-12 sm:col-span-8 lg:col-span-9">
                        <Input label="Cidade" value={formData.address.city} onChange={e => updateAddress('city', e.target.value)} />
                    </div>
                    <div className="col-span-12 sm:col-span-4 lg:col-span-3">
                        <Input label="Estado (UF)" value={formData.address.state} onChange={e => updateAddress('state', e.target.value)} placeholder="SP" />
                    </div>
                </div>
            </div>

            <div className="border-t border-gray-100 pt-5">
                <label className="block text-sm font-medium text-gray-700 mb-2">Observações Internas</label>
                <textarea
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-3 min-h-[80px]"
                    value={formData.notes || ''}
                    onChange={e => setFormData({...formData, notes: e.target.value})}
                    placeholder="Anote detalhes importantes sobre este cliente (não sai na nota)..."
                />
            </div>
        </div>

        <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-100">
            <Button type="button" variant="secondary" onClick={onCancel}>Cancelar</Button>
            <Button type="submit" icon={<Save className="w-4 h-4"/>}>Salvar Cliente</Button>
        </div>
      </div>
    </form>
  );
};