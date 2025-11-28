
import React from 'react';
import { Button } from './Button';
import { FileCheck, AlertTriangle, Calendar, CheckCircle } from 'lucide-react';

export const ObligationsView: React.FC = () => {
  const obligations = [
      { id: 1, name: 'PGDAS-D (Simples Nacional)', status: 'delivered', deadline: '20/02/2024', deliveredAt: '15/02/2024' },
      { id: 2, name: 'DCTFWeb', status: 'pending', deadline: '15/03/2024', deliveredAt: null },
      { id: 3, name: 'DEFIS (Anual)', status: 'delivered', deadline: '31/03/2024', deliveredAt: '10/02/2024' },
      { id: 4, name: 'SPED Fiscal', status: 'pending', deadline: '25/03/2024', deliveredAt: null },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
       <div>
          <h2 className="text-2xl font-bold text-gray-900">Obrigações Acessórias</h2>
          <p className="text-gray-500">Monitoramento de declarações fiscais enviadas à Receita Federal.</p>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
              <div className="bg-green-100 p-3 rounded-full text-green-600">
                  <FileCheck className="w-6 h-6" />
              </div>
              <div>
                  <p className="text-sm text-gray-500">Entregues</p>
                  <p className="text-2xl font-bold text-gray-900">2</p>
              </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
              <div className="bg-yellow-100 p-3 rounded-full text-yellow-600">
                  <Calendar className="w-6 h-6" />
              </div>
              <div>
                  <p className="text-sm text-gray-500">Pendentes</p>
                  <p className="text-2xl font-bold text-gray-900">2</p>
              </div>
          </div>
       </div>

       <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
           <table className="w-full text-sm">
               <thead className="bg-gray-50 border-b border-gray-200">
                   <tr>
                       <th className="px-6 py-4 text-left font-semibold text-gray-700">Declaração</th>
                       <th className="px-6 py-4 text-left font-semibold text-gray-700">Prazo Legal</th>
                       <th className="px-6 py-4 text-center font-semibold text-gray-700">Status</th>
                       <th className="px-6 py-4 text-right font-semibold text-gray-700">Recibo</th>
                   </tr>
               </thead>
               <tbody className="divide-y divide-gray-100">
                   {obligations.map(ob => (
                       <tr key={ob.id} className="hover:bg-gray-50 transition-colors">
                           <td className="px-6 py-4 font-medium text-gray-900">{ob.name}</td>
                           <td className="px-6 py-4 text-gray-600">{ob.deadline}</td>
                           <td className="px-6 py-4 text-center">
                               {ob.status === 'delivered' ? (
                                   <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                       <CheckCircle className="w-3 h-3" /> Entregue
                                   </span>
                               ) : (
                                   <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                       <AlertTriangle className="w-3 h-3" /> Pendente
                                   </span>
                               )}
                           </td>
                           <td className="px-6 py-4 text-right">
                               <Button size="sm" variant="ghost" disabled={ob.status !== 'delivered'}>
                                   Baixar Recibo
                               </Button>
                           </td>
                       </tr>
                   ))}
               </tbody>
           </table>
       </div>
    </div>
  );
};
