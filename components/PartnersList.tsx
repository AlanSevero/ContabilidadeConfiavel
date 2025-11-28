
import React, { useState } from 'react';
import { Partner } from '../types';
import { Button } from './Button';
import { Input } from './Input';
import { Plus, Trash2, Edit, Save, X, UserCheck, Briefcase } from 'lucide-react';
import { generateId } from '../services/utils';

interface PartnersListProps {
  partners: Partner[];
  userId: string;
  onSave: (partner: Partner) => void;
  onDelete: (id: string) => void;
}

export const PartnersList: React.FC<PartnersListProps> = ({ partners, userId, onSave, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);

  const handleEdit = (partner?: Partner) => {
    if (partner) {
      setEditingPartner(partner);
    } else {
      setEditingPartner({
        id: generateId(),
        userId,
        name: '',
        taxId: '',
        email: '',
        address: { street: '', number: '', city: '', state: '', zip: '' },
        role: 'Sócio',
        sharePercentage: 50
      });
    }
    setIsEditing(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPartner) {
      onSave(editingPartner);
      setIsEditing(false);
      setEditingPartner(null);
    }
  };

  if (isEditing && editingPartner) {
    return (
      <div className="max-w-2xl mx-auto animate-fade-in">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">{partners.find(p => p.id === editingPartner.id) ? 'Editar Sócio' : 'Novo Sócio'}</h2>
          <Button variant="ghost" onClick={() => setIsEditing(false)} icon={<X className="w-4 h-4"/>}>Cancelar</Button>
        </div>
        
        <form onSubmit={handleSave} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
          <Input label="Nome Completo" value={editingPartner.name} onChange={e => setEditingPartner({...editingPartner, name: e.target.value})} required />
          <div className="grid grid-cols-2 gap-4">
            <Input label="CPF" value={editingPartner.taxId} onChange={e => setEditingPartner({...editingPartner, taxId: e.target.value})} required />
            <Input label="Email" value={editingPartner.email} onChange={e => setEditingPartner({...editingPartner, email: e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Cargo/Função" value={editingPartner.role} onChange={e => setEditingPartner({...editingPartner, role: e.target.value})} />
            <Input label="% Participação" type="number" value={editingPartner.sharePercentage} onChange={e => setEditingPartner({...editingPartner, sharePercentage: Number(e.target.value)})} />
          </div>
           <div className="pt-4 border-t border-gray-100">
             <p className="text-sm font-medium text-gray-700 mb-2">Endereço</p>
             <div className="grid grid-cols-3 gap-3">
                 <div className="col-span-2"><Input label="Rua" value={editingPartner.address.street} onChange={e => setEditingPartner({...editingPartner, address: {...editingPartner.address, street: e.target.value}})} /></div>
                 <Input label="Nº" value={editingPartner.address.number} onChange={e => setEditingPartner({...editingPartner, address: {...editingPartner.address, number: e.target.value}})} />
             </div>
           </div>
          <div className="flex justify-end pt-4">
            <Button type="submit" icon={<Save className="w-4 h-4"/>}>Salvar Sócio</Button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Sócios</h2>
          <p className="text-gray-500">Gerencie o quadro societário da empresa.</p>
        </div>
        <Button onClick={() => handleEdit()} icon={<Plus className="w-4 h-4" />}>Adicionar Sócio</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {partners.map(partner => (
          <div key={partner.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
            <div className="flex items-center gap-4 mb-4">
               <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                  <UserCheck className="w-6 h-6" />
               </div>
               <div>
                 <h3 className="font-bold text-gray-900">{partner.name}</h3>
                 <p className="text-xs text-gray-500">{partner.role}</p>
               </div>
            </div>
            
            <div className="space-y-2 text-sm text-gray-600 mb-6">
              <div className="flex justify-between">
                <span>CPF:</span>
                <span className="font-mono">{partner.taxId}</span>
              </div>
              <div className="flex justify-between">
                <span>Participação:</span>
                <span className="font-medium">{partner.sharePercentage}%</span>
              </div>
            </div>

            <div className="flex gap-2 border-t pt-4">
              <button onClick={() => handleEdit(partner)} className="flex-1 text-sm text-gray-600 hover:text-primary-600 font-medium flex items-center justify-center gap-2">
                <Edit className="w-3 h-3" /> Editar
              </button>
              <div className="w-px bg-gray-200"></div>
              <button onClick={() => onDelete(partner.id)} className="flex-1 text-sm text-gray-600 hover:text-red-600 font-medium flex items-center justify-center gap-2">
                <Trash2 className="w-3 h-3" /> Excluir
              </button>
            </div>
          </div>
        ))}
        
        {partners.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-400 bg-white rounded-xl border border-dashed border-gray-300">
             <Briefcase className="w-8 h-8 mx-auto mb-2 text-gray-300" />
             <p>Nenhum sócio cadastrado.</p>
          </div>
        )}
      </div>
    </div>
  );
};
