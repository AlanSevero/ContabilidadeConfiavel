import React from 'react';
import { Client } from '../types';
import { Button } from './Button';
import { Plus, Edit, Trash2, MapPin, Mail, Phone } from 'lucide-react';

interface ClientListProps {
  clients: Client[];
  onAddClient: () => void;
  onEditClient: (client: Client) => void;
  onDeleteClient: (id: string) => void;
}

export const ClientList: React.FC<ClientListProps> = ({ clients, onAddClient, onEditClient, onDeleteClient }) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gerenciar Clientes</h2>
          <p className="text-gray-500">Cadastre e organize seus tomadores de serviço.</p>
        </div>
        <Button onClick={onAddClient} icon={<Plus className="w-4 h-4" />}>
          Novo Cliente
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clients.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
             <div className="bg-primary-50 p-4 rounded-full mb-4">
                <Plus className="w-8 h-8 text-primary-500" />
             </div>
             <p className="text-gray-900 font-medium text-lg mb-1">Nenhum cliente cadastrado</p>
             <p className="text-gray-500 mb-6 text-sm">Adicione seu primeiro cliente para agilizar a emissão de notas.</p>
             <Button onClick={onAddClient}>Adicionar Cliente</Button>
          </div>
        ) : (
          clients.map(client => (
            <div key={client.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col h-full hover:shadow-md transition-shadow">
               <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                     <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-lg flex-shrink-0">
                        {client.name.charAt(0).toUpperCase()}
                     </div>
                     <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full font-mono">
                        {client.taxId}
                     </span>
                  </div>
                  
                  <h3 className="font-bold text-gray-900 text-lg mb-4 line-clamp-2" title={client.name}>{client.name}</h3>
                  
                  <div className="space-y-3 text-sm text-gray-600 mb-6">
                    <div className="flex items-center gap-3">
                        <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <span className="truncate">{client.email || 'Sem email'}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <span className="truncate">
                           {client.address.city ? `${client.address.city} - ${client.address.state}` : 'Sem endereço'}
                        </span>
                    </div>
                  </div>
               </div>
               
               <div className="flex gap-3 pt-4 border-t border-gray-50 mt-auto">
                  <button 
                    onClick={() => onEditClient(client)}
                    className="flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 text-sm font-medium transition-colors"
                  >
                    <Edit className="w-3 h-3" /> Editar
                  </button>
                  <button 
                    onClick={() => onDeleteClient(client.id)}
                    className="flex items-center justify-center p-2 rounded-lg border border-red-100 text-red-600 hover:bg-red-50 transition-colors"
                    title="Excluir"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
               </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};