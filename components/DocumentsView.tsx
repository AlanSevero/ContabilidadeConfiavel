import React, { useState, useEffect } from 'react';
import { AccountingDocument, Accountant } from '../types';
import { Button } from './Button';
import { FileText, Upload, Download, Clock, CheckCircle, AlertCircle, Calendar } from 'lucide-react';
import { getRecentDocuments, getAssignedAccountant } from '../services/storageService';

export const DocumentsView: React.FC = () => {
  const [documents, setDocuments] = useState<AccountingDocument[]>([]);
  const [accountant, setAccountant] = useState<Accountant | null>(null);
  const [activeTab, setActiveTab] = useState<'taxes' | 'general'>('taxes');

  useEffect(() => {
    setDocuments(getRecentDocuments());
    setAccountant(getAssignedAccountant());
  }, []);

  const taxes = documents.filter(d => d.type === 'tax');
  const generalDocs = documents.filter(d => d.type !== 'tax');

  const getStatusColor = (status: string) => {
      switch(status) {
          case 'pending': return 'bg-yellow-100 text-yellow-800';
          case 'paid': return 'bg-green-100 text-green-800';
          case 'received': return 'bg-blue-100 text-blue-800';
          default: return 'bg-gray-100 text-gray-800';
      }
  };

  const getStatusLabel = (status: string) => {
      switch(status) {
          case 'pending': return 'Pendente';
          case 'paid': return 'Pago';
          case 'received': return 'Recebido';
          case 'processed': return 'Processado';
          default: return status;
      }
  };

  return (
    <div className="space-y-6 animate-fade-in">
       {/* Header with Accountant Info context */}
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-primary-600 to-sky-500 p-6 rounded-2xl text-white shadow-lg">
          <div>
              <h2 className="text-2xl font-bold">Central de Documentos</h2>
              <p className="opacity-90 mt-1">
                  Documentos enviados por {accountant?.name.split(' ').slice(-1)[0]} e solicitações pendentes.
              </p>
          </div>
          <Button className="bg-white text-primary-700 hover:bg-gray-100 border-none shadow-md" icon={<Upload className="w-4 h-4"/>}>
              Enviar Documento
          </Button>
       </div>

       {/* Tabs */}
       <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
           <button 
             onClick={() => setActiveTab('taxes')}
             className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'taxes' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
           >
             Impostos a Pagar
           </button>
           <button 
             onClick={() => setActiveTab('general')}
             className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'general' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
           >
             Documentos Gerais
           </button>
       </div>

       {/* Content */}
       <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden min-h-[400px]">
           {activeTab === 'taxes' && (
               <div className="p-6">
                   {taxes.length > 0 ? (
                       <div className="space-y-4">
                           {taxes.map(doc => (
                               <div key={doc.id} className="flex flex-col md:flex-row items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-primary-200 transition-colors bg-gray-50">
                                   <div className="flex items-center gap-4 w-full md:w-auto mb-4 md:mb-0">
                                       <div className="bg-white p-3 rounded-lg border border-gray-100 text-red-500">
                                           <AlertCircle className="w-6 h-6" />
                                       </div>
                                       <div>
                                           <h3 className="font-bold text-gray-900">{doc.title}</h3>
                                           <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                                               <span className="flex items-center gap-1"><Calendar className="w-3 h-3"/> Venc: {new Date(doc.date).toLocaleDateString()}</span>
                                               <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(doc.status)}`}>{getStatusLabel(doc.status)}</span>
                                           </div>
                                       </div>
                                   </div>
                                   <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                                       <span className="text-lg font-bold text-gray-900">
                                           {doc.amount ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(doc.amount) : '-'}
                                       </span>
                                       <Button size="sm" icon={<Download className="w-4 h-4"/>}>Baixar Guia</Button>
                                   </div>
                               </div>
                           ))}
                       </div>
                   ) : (
                       <div className="text-center py-12 text-gray-500">
                           <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                           <p className="font-medium">Tudo em dia!</p>
                           <p className="text-sm">Nenhum imposto pendente de pagamento.</p>
                       </div>
                   )}
               </div>
           )}

           {activeTab === 'general' && (
               <div className="divide-y divide-gray-100">
                   {generalDocs.map(doc => (
                       <div key={doc.id} className="p-4 hover:bg-gray-50 flex items-center justify-between transition-colors">
                           <div className="flex items-center gap-4">
                               <div className={`p-3 rounded-lg ${doc.type === 'upload' ? 'bg-indigo-50 text-indigo-600' : 'bg-orange-50 text-orange-600'}`}>
                                   {doc.type === 'upload' ? <Upload className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                               </div>
                               <div>
                                   <h4 className="font-medium text-gray-900">{doc.title}</h4>
                                   <p className="text-xs text-gray-500">
                                       {doc.type === 'upload' ? 'Enviado por você' : 'Enviado pela contabilidade'} • {new Date(doc.date).toLocaleDateString()}
                                   </p>
                               </div>
                           </div>
                           <Button variant="ghost" size="sm" icon={<Download className="w-4 h-4"/>} className="text-gray-500">
                               Baixar
                           </Button>
                       </div>
                   ))}
               </div>
           )}
       </div>
    </div>
  );
};