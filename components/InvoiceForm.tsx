
import React, { useState, useEffect } from 'react';
import { Invoice, InvoiceItem, InvoiceStatus, Client } from '../types';
import { Button } from './Button';
import { Input } from './Input';
import { Plus, Trash2, Save, ArrowLeft, Eye, Users, Search, X } from 'lucide-react';
import { AIHelper } from './AIHelper';
import { getClients } from '../services/storageService';
import { generateId } from '../services/utils';

interface Props {
  userId: string;
  initialData?: Partial<Invoice>;
  onSave: (invoice: Invoice) => void;
  onCancel: () => void;
  onPreview: (invoice: Invoice) => void;
}

export const InvoiceForm: React.FC<Props> = ({ userId, initialData, onSave, onCancel, onPreview }) => {
  const [savedClients, setSavedClients] = useState<Client[]>([]);
  const [showClientSelector, setShowClientSelector] = useState(false);
  const [clientSearch, setClientSearch] = useState('');

  // Default State
  const [formData, setFormData] = useState<Invoice>({
    id: generateId(),
    userId: userId,
    number: '',
    date: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 86400000 * 15).toISOString().split('T')[0],
    status: InvoiceStatus.DRAFT,
    taxRate: 0,
    issuer: {
      name: '',
      taxId: '',
      email: '',
      address: { street: '', number: '', city: '', state: '', zip: '' }
    },
    client: {
      name: '',
      taxId: '',
      email: '',
      address: { street: '', number: '', city: '', state: '', zip: '' }
    },
    items: [],
    notes: ''
  });

  // Load initial data and clients
  useEffect(() => {
    setSavedClients(getClients(userId));

    if (initialData) {
      setFormData(prev => ({ ...prev, ...initialData }));
    } else {
        // Try to load issuer data from localStorage if available (persistent profile)
        const lastIssuer = localStorage.getItem(`lastIssuer_${userId}`);
        if(lastIssuer) {
             setFormData(prev => ({...prev, issuer: JSON.parse(lastIssuer)}));
        }
    }
  }, [initialData, userId]);

  const selectClient = (client: Client) => {
    setFormData(prev => ({
        ...prev,
        client: {
            name: client.name,
            taxId: client.taxId,
            email: client.email,
            address: client.address
        }
    }));
    setShowClientSelector(false);
  };

  const updateField = (section: 'issuer' | 'client', field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [section]: { ...prev[section], [field]: value }
    }));
  };

  const updateAddress = (section: 'issuer' | 'client', field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        address: { ...prev[section].address, [field]: value }
      }
    }));
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { id: generateId(), description: '', quantity: 1, unitPrice: 0 }]
    }));
  };

  const updateItem = (id: string, field: keyof InvoiceItem, value: any) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map(item => item.id === id ? { ...item, [field]: value } : item)
    }));
  };

  const removeItem = (id: string) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== id)
    }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    // Save issuer for next time
    localStorage.setItem(`lastIssuer_${userId}`, JSON.stringify(formData.issuer));
    onSave(formData);
  };

  const filteredClients = savedClients.filter(c => 
    c.name.toLowerCase().includes(clientSearch.toLowerCase()) || 
    c.taxId.includes(clientSearch)
  );

  return (
    <form onSubmit={handleSave} className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Header Actions */}
      <div className="flex justify-between items-center sticky top-0 bg-gray-50 py-4 z-10 border-b border-gray-200">
        <div className="flex items-center gap-2">
            <Button type="button" variant="ghost" onClick={onCancel}>
                <ArrowLeft className="w-4 h-4" />
            </Button>
            <h2 className="text-xl font-bold text-gray-900">
                {initialData ? 'Editar Nota' : 'Nova Nota Fiscal'}
            </h2>
        </div>
        <div className="flex gap-3">
          <Button type="button" variant="secondary" onClick={() => onPreview(formData)} icon={<Eye className="w-4 h-4"/>}>
            Visualizar
          </Button>
          <Button type="submit" icon={<Save className="w-4 h-4"/>}>
            Emitir Nota
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: General Info & Issuer */}
        <div className="lg:col-span-1 space-y-6">
           <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
             <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Dados da Nota</h3>
             <div className="space-y-4">
               <Input 
                 label="Número" 
                 value={formData.number} 
                 onChange={e => setFormData({...formData, number: e.target.value})} 
                 placeholder="Ex: 001/2024"
                 required
               />
               <Input 
                 label="Data Emissão" 
                 type="date" 
                 value={formData.date} 
                 onChange={e => setFormData({...formData, date: e.target.value})}
                 required
               />
               <Input 
                 label="Vencimento" 
                 type="date" 
                 value={formData.dueDate} 
                 onChange={e => setFormData({...formData, dueDate: e.target.value})}
                 required
               />
               <Input 
                 label="Alíquota Imposto (%)" 
                 type="number"
                 min="0"
                 step="0.1" 
                 value={formData.taxRate} 
                 onChange={e => setFormData({...formData, taxRate: parseFloat(e.target.value) || 0})}
               />
             </div>
           </div>

           <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
             <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Prestador (Você)</h3>
             <div className="space-y-4">
                <Input label="Razão Social" value={formData.issuer.name} onChange={e => updateField('issuer', 'name', e.target.value)} required />
                <Input label="CNPJ/CPF" value={formData.issuer.taxId} onChange={e => updateField('issuer', 'taxId', e.target.value)} required />
                <Input label="Email" type="email" value={formData.issuer.email} onChange={e => updateField('issuer', 'email', e.target.value)} />
                <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-2"><Input label="Rua" value={formData.issuer.address.street} onChange={e => updateAddress('issuer', 'street', e.target.value)} /></div>
                    <Input label="Nº" value={formData.issuer.address.number} onChange={e => updateAddress('issuer', 'number', e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                    <Input label="Cidade" value={formData.issuer.address.city} onChange={e => updateAddress('issuer', 'city', e.target.value)} />
                    <Input label="Estado" value={formData.issuer.address.state} onChange={e => updateAddress('issuer', 'state', e.target.value)} />
                </div>
             </div>
           </div>
        </div>

        {/* Right Column: Client & Items */}
        <div className="lg:col-span-2 space-y-6">
           
           {/* Client Selection */}
           <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 relative">
               <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-100">
                   <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Tomador (Cliente)</h3>
                   <Button 
                    type="button" 
                    size="sm" 
                    variant={showClientSelector ? 'danger' : 'secondary'} 
                    onClick={() => setShowClientSelector(!showClientSelector)} 
                    icon={showClientSelector ? <X className="w-3 h-3"/> : <Users className="w-3 h-3"/>}
                   >
                       {showClientSelector ? 'Fechar' : 'Selecionar Cliente'}
                   </Button>
               </div>
               
               {showClientSelector && (
                   <div className="absolute top-16 left-0 right-0 bg-white shadow-xl border border-gray-200 z-20 rounded-lg max-h-80 overflow-hidden flex flex-col mx-6 animate-fade-in">
                       <div className="p-3 border-b border-gray-100 bg-gray-50">
                           <div className="relative">
                               <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                               <input 
                                   type="text"
                                   placeholder="Buscar cliente por nome ou CNPJ..."
                                   className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                                   value={clientSearch}
                                   onChange={e => setClientSearch(e.target.value)}
                                   autoFocus
                               />
                           </div>
                       </div>
                       <div className="overflow-y-auto flex-1">
                           {filteredClients.length === 0 ? (
                               <p className="p-4 text-sm text-gray-500 text-center">Nenhum cliente encontrado.</p>
                           ) : (
                               filteredClients.map(c => (
                                   <div 
                                      key={c.id} 
                                      onClick={() => selectClient(c)} 
                                      className="p-3 hover:bg-primary-50 cursor-pointer border-b border-gray-50 last:border-0 transition-colors flex justify-between items-center"
                                   >
                                       <div>
                                           <p className="font-medium text-sm text-gray-900">{c.name}</p>
                                           <p className="text-xs text-gray-500">{c.taxId}</p>
                                       </div>
                                       <div className="text-xs text-primary-600 font-medium px-2 py-1 bg-primary-100 rounded">
                                           Selecionar
                                       </div>
                                   </div>
                               ))
                           )}
                       </div>
                   </div>
               )}

               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div className="md:col-span-2">
                        <Input label="Razão Social" value={formData.client.name} onChange={e => updateField('client', 'name', e.target.value)} required />
                   </div>
                   <Input label="CNPJ/CPF" value={formData.client.taxId} onChange={e => updateField('client', 'taxId', e.target.value)} required />
                   <Input label="Email" type="email" value={formData.client.email} onChange={e => updateField('client', 'email', e.target.value)} />
                   <div className="md:col-span-2 grid grid-cols-3 gap-4">
                       <div className="col-span-2"><Input label="Rua" value={formData.client.address.street} onChange={e => updateAddress('client', 'street', e.target.value)} /></div>
                       <Input label="Nº" value={formData.client.address.number} onChange={e => updateAddress('client', 'number', e.target.value)} />
                   </div>
                   <Input label="Cidade" value={formData.client.address.city} onChange={e => updateAddress('client', 'city', e.target.value)} />
                   <Input label="Estado" value={formData.client.address.state} onChange={e => updateAddress('client', 'state', e.target.value)} />
               </div>
           </div>

           {/* Items */}
           <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
               <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-100">
                   <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Itens do Serviço</h3>
                   <Button type="button" size="sm" onClick={addItem} icon={<Plus className="w-4 h-4"/>}>Adicionar Item</Button>
               </div>
               
               {formData.items.length === 0 && (
                   <div className="text-center py-12 text-gray-400 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                       <p>Nenhum item adicionado à nota.</p>
                       <Button type="button" variant="ghost" size="sm" onClick={addItem} className="mt-2 text-primary-600 hover:text-primary-700">Adicionar agora</Button>
                   </div>
               )}

               <div className="space-y-4">
                   {formData.items.map((item, index) => (
                       <div key={item.id} className="p-4 bg-gray-50 rounded-lg relative border border-gray-200 hover:border-primary-200 transition-colors">
                           <div className="absolute top-3 right-3">
                               <button type="button" onClick={() => removeItem(item.id)} className="text-gray-400 hover:text-red-500 p-1 transition-colors">
                                   <Trash2 className="w-4 h-4" />
                               </button>
                           </div>
                           <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                               <div className="md:col-span-8">
                                   <label className="block text-xs font-medium text-gray-700 mb-1">Descrição</label>
                                   <textarea
                                       className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm border p-2"
                                       rows={2}
                                       value={item.description}
                                       onChange={e => updateItem(item.id, 'description', e.target.value)}
                                       placeholder="Descrição do serviço..."
                                   />
                                   <AIHelper 
                                     currentText={item.description}
                                     onApply={(newText) => updateItem(item.id, 'description', newText)}
                                   />
                               </div>
                               <div className="md:col-span-2">
                                   <Input 
                                       label="Qtd" 
                                       type="number" 
                                       min="1" 
                                       value={item.quantity} 
                                       onChange={e => updateItem(item.id, 'quantity', parseFloat(e.target.value))} 
                                   />
                               </div>
                               <div className="md:col-span-2">
                                   <Input 
                                       label="Valor (R$)" 
                                       type="number" 
                                       min="0" 
                                       step="0.01" 
                                       value={item.unitPrice} 
                                       onChange={e => {
                                            const val = parseFloat(e.target.value);
                                            updateItem(item.id, 'unitPrice', isNaN(val) ? 0 : val);
                                       }}
                                   />
                               </div>
                           </div>
                           <div className="mt-3 pt-3 border-t border-gray-200 flex justify-end">
                               <div className="text-sm font-medium text-gray-900">
                                   Subtotal: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.quantity * item.unitPrice)}
                               </div>
                           </div>
                       </div>
                   ))}
               </div>
           </div>

           {/* Notes */}
           <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
             <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Observações</h3>
             <textarea
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm border p-3"
                rows={3}
                value={formData.notes}
                onChange={e => setFormData({...formData, notes: e.target.value})}
                placeholder="Dados bancários para depósito, condições de pagamento, etc..."
             />
           </div>
        </div>
      </div>
    </form>
  );
};
