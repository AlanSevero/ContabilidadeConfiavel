import React, { useState } from 'react';
import { Partner } from '../types';
import { Button } from './Button';
import { FileCheck, Download, DollarSign } from 'lucide-react';

interface ProLaboreViewProps {
  partners: Partner[];
}

export const ProLaboreView: React.FC<ProLaboreViewProps> = ({ partners }) => {
  const [selectedPartner, setSelectedPartner] = useState<string>('');
  const [amount, setAmount] = useState<number>(1412.00); // Default salary value
  const [referenceMonth, setReferenceMonth] = useState<string>(new Date().toISOString().slice(0, 7));
  const [showReceipt, setShowReceipt] = useState(false);

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedPartner) {
        setShowReceipt(true);
    }
  };

  const currentPartner = partners.find(p => p.id === selectedPartner);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Pró-Labore</h2>
          <p className="text-gray-500">Emissão de recibos e controle de pagamentos aos sócios.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Form */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-fit">
          <h3 className="font-semibold text-gray-900 mb-6 flex items-center gap-2">
             <DollarSign className="w-5 h-5 text-primary-500" />
             Novo Pagamento
          </h3>
          
          {partners.length === 0 ? (
             <div className="text-center p-6 bg-yellow-50 text-yellow-800 rounded-lg text-sm">
                Você precisa cadastrar sócios antes de emitir pró-labore.
             </div>
          ) : (
            <form onSubmit={handleGenerate} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sócio / Beneficiário</label>
                    <select 
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 p-2 border"
                        value={selectedPartner}
                        onChange={e => setSelectedPartner(e.target.value)}
                        required
                    >
                        <option value="">Selecione um sócio...</option>
                        {partners.map(p => (
                            <option key={p.id} value={p.id}>{p.name} - {p.taxId}</option>
                        ))}
                    </select>
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mês de Referência</label>
                    <input 
                        type="month" 
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 p-2 border"
                        value={referenceMonth}
                        onChange={e => setReferenceMonth(e.target.value)}
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Valor Bruto (R$)</label>
                    <input 
                        type="number" 
                        step="0.01"
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 p-2 border"
                        value={amount}
                        onChange={e => setAmount(Number(e.target.value))}
                        required
                    />
                    <p className="text-xs text-gray-500 mt-1">INSS (11%) será descontado automaticamente no recibo.</p>
                </div>

                <Button type="submit" className="w-full" disabled={!selectedPartner}>
                    Gerar Recibo
                </Button>
            </form>
          )}
        </div>

        {/* Preview */}
        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 flex flex-col items-center justify-center min-h-[400px]">
           {showReceipt && currentPartner ? (
               <div className="bg-white p-8 shadow-lg w-full max-w-md text-sm animate-slide-up">
                  <div className="text-center border-b pb-4 mb-4">
                      <h4 className="font-bold text-lg uppercase">Recibo de Pró-Labore</h4>
                      <p className="text-gray-500">{referenceMonth}</p>
                  </div>
                  
                  <div className="space-y-4 mb-6">
                      <div className="flex justify-between">
                          <span className="text-gray-500">Beneficiário:</span>
                          <span className="font-medium text-right">{currentPartner.name}</span>
                      </div>
                      <div className="flex justify-between">
                          <span className="text-gray-500">CPF:</span>
                          <span className="font-medium">{currentPartner.taxId}</span>
                      </div>
                      <div className="border-t border-dashed my-2"></div>
                      <div className="flex justify-between">
                          <span>Pro-Labore Bruto</span>
                          <span>R$ {amount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-red-600">
                          <span>(-) INSS (11%)</span>
                          <span>R$ {(amount * 0.11).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-red-600">
                          <span>(-) IRRF (Estimado)</span>
                          <span>R$ 0,00</span>
                      </div>
                      <div className="border-t border-gray-800 pt-2 flex justify-between font-bold text-lg">
                          <span>Líquido a Receber</span>
                          <span>R$ {(amount * 0.89).toFixed(2)}</span>
                      </div>
                  </div>

                  <div className="mt-8 pt-4 border-t border-gray-300 text-center">
                      <p className="mb-8">__________________________________________<br/>Assinatura do Beneficiário</p>
                      <Button size="sm" variant="secondary" icon={<Download className="w-3 h-3"/>} onClick={() => window.print()}>Imprimir</Button>
                  </div>
               </div>
           ) : (
               <div className="text-center text-gray-400">
                   <FileCheck className="w-16 h-16 mx-auto mb-3 opacity-50" />
                   <p>Preencha os dados e clique em "Gerar Recibo"<br/>para visualizar o documento.</p>
               </div>
           )}
        </div>
      </div>
    </div>
  );
};