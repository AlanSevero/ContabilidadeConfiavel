import React, { useState, useEffect } from 'react';
import { Invoice, InvoiceStatus, TaxRegime, AccountingDocument } from '../types';
import { getInvoices, saveDocument } from '../services/storageService';
import { Button } from './Button';
import { Calculator, ArrowRight, TrendingUp, AlertCircle, CheckCircle2, FileText, Info, Settings, Percent, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';
import { getCurrentUser } from '../services/authService';

export const TaxesView: React.FC = () => {
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().slice(0, 7));
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState(0);
  const [simulatedRegime, setSimulatedRegime] = useState<TaxRegime>('simples');
  const [calculating, setCalculating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [showSettings, setShowSettings] = useState(true);

  // Presumido Rates State (Defaults based on Service industry standard)
  const [issRate, setIssRate] = useState(5.00);
  const [pisCofinsRate, setPisCofinsRate] = useState(3.65);
  const [irpjRate, setIrpjRate] = useState(4.80); // Presumed base 32% * 15%
  const [csllRate, setCsllRate] = useState(2.88); // Presumed base 32% * 9%

  const user = getCurrentUser();

  useEffect(() => {
    if (user) {
        // Load Invoices
        const allInvoices = getInvoices(user.id);
        const [year, month] = selectedMonth.split('-');
        
        // Filter invoices for selected month that are issued or paid
        const filtered = allInvoices.filter(inv => {
            const d = new Date(inv.date);
            return (
                d.getFullYear() === parseInt(year) && 
                d.getMonth() + 1 === parseInt(month) &&
                (inv.status === InvoiceStatus.ISSUED || inv.status === InvoiceStatus.PAID)
            );
        });

        setInvoices(filtered);
        const total = filtered.reduce((acc, inv) => {
            const invTotal = inv.items.reduce((s, item) => s + (item.quantity * item.unitPrice), 0);
            return acc + invTotal;
        }, 0);
        
        setMonthlyRevenue(total);
        setGenerated(false);
    }
  }, [selectedMonth, user]);

  // --- Logic for Simples Nacional (Simplified Anexo III - Services) ---
  const getSimplesDetails = (revenue: number) => {
      // Logic based on simplified monthly revenue tiers to simulate RBT12 (Revenue Bruta Total 12 meses)
      // Monthly 15k * 12 = 180k (Limit of 1st Tier)
      
      if (revenue === 0) return { rate: 0, tier: 'Sem Faturamento', deduction: 0 };
      
      if (revenue <= 15000) return { rate: 0.06, tier: 'Faixa 1: 6% (Até R$ 180k/ano)', deduction: 0 };
      
      if (revenue <= 30000) return { rate: 0.112, tier: 'Faixa 2: 11.2% (Até R$ 360k/ano)', deduction: 0 }; 
      
      if (revenue <= 60000) return { rate: 0.135, tier: 'Faixa 3: 13.5% (Até R$ 720k/ano)', deduction: 0 };
      
      if (revenue <= 150000) return { rate: 0.16, tier: 'Faixa 4: 16% (Até R$ 1.8M/ano)', deduction: 0 };
      
      return { rate: 0.21, tier: 'Faixa 5: 21% (Acima de R$ 1.8M/ano)', deduction: 0 };
  };

  const calculateTax = (regime: TaxRegime, revenue: number) => {
      if (regime === 'simples') {
          const { rate } = getSimplesDetails(revenue);
          return revenue * rate;
      }
      if (regime === 'presumido') {
          // Calculation includes the manually entered ISS rate
          const totalRate = (issRate + pisCofinsRate + irpjRate + csllRate) / 100;
          return revenue * totalRate;
      }
      return revenue * 0.20; 
  };

  const currentTax = calculateTax(simulatedRegime, monthlyRevenue);
  const simplesDetails = getSimplesDetails(monthlyRevenue);
  
  // Comparison Logic
  const simplesTaxValue = calculateTax('simples', monthlyRevenue);
  const presumidoTaxValue = calculateTax('presumido', monthlyRevenue);
  const isPresumidoMoreExpensive = presumidoTaxValue > simplesTaxValue;
  const savingsAmount = Math.abs(presumidoTaxValue - simplesTaxValue);

  const handleGenerateGuide = () => {
      setCalculating(true);
      
      // Simulate API processing time
      setTimeout(() => {
          const dueDate = new Date();
          const [year, month] = selectedMonth.split('-');
          // Due date is usually the 20th of the following month
          dueDate.setFullYear(parseInt(year));
          dueDate.setMonth(parseInt(month)); 
          dueDate.setDate(20);

          const docTitle = simulatedRegime === 'simples' 
             ? `DAS - Simples Nacional - ${month}/${year}` 
             : `DARF - Impostos Federais (Presumido) - ${month}/${year}`;

          const newDoc: AccountingDocument = {
              id: crypto.randomUUID(),
              title: docTitle,
              type: 'tax',
              date: dueDate.toISOString(),
              status: 'pending',
              amount: currentTax,
              competence: selectedMonth
          };
          
          saveDocument(newDoc);
          setCalculating(false);
          setGenerated(true);
      }, 2000);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Cálculo de Impostos</h2>
          <p className="text-gray-500">Apuração automática e geração de guia (DAS/DARF).</p>
        </div>
        
        <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-gray-200 shadow-sm">
            <span className="text-sm font-medium text-gray-600 pl-2">Competência:</span>
            <input 
                type="month" 
                value={selectedMonth} 
                onChange={e => setSelectedMonth(e.target.value)}
                className="border-none bg-transparent focus:ring-0 text-gray-900 font-bold cursor-pointer outline-none"
            />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Revenue Card */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-green-50 rounded-lg text-green-600">
                      <TrendingUp className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Base de Cálculo</h3>
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-1">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(monthlyRevenue)}
              </p>
              <div className="mt-2 text-xs text-gray-500 flex justify-between">
                  <span>Notas processadas:</span>
                  <span className="font-medium text-gray-900">{invoices.length}</span>
              </div>
          </div>

          {/* Regime Selector */}
          <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
             <div className="flex items-center justify-between mb-4">
                 <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                        <Calculator className="w-5 h-5" />
                    </div>
                    <h3 className="font-semibold text-gray-900">Simulação de Cenários</h3>
                 </div>
                 {monthlyRevenue > 0 && simplesTaxValue < presumidoTaxValue && (
                    <div className="hidden sm:flex text-xs font-medium bg-green-100 text-green-700 px-3 py-1 rounded-full items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Simples Nacional é mais econômico
                    </div>
                 )}
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {/* Simples Nacional Option */}
                 <button 
                    onClick={() => setSimulatedRegime('simples')}
                    className={`p-4 rounded-xl border-2 text-left transition-all relative overflow-hidden flex flex-col justify-between h-full ${simulatedRegime === 'simples' ? 'border-primary-500 bg-primary-50 shadow-md ring-1 ring-primary-500' : 'border-gray-100 hover:border-gray-200'}`}
                 >
                    <div>
                        <div className="flex justify-between items-start mb-2">
                            <span className="font-bold text-gray-900">Simples Nacional</span>
                            {simulatedRegime === 'simples' && <div className="w-5 h-5 rounded-full bg-primary-500 text-white flex items-center justify-center"><CheckCircle2 className="w-3 h-3" /></div>}
                        </div>
                        <div className="text-2xl font-bold text-gray-900 mb-1">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(simplesTaxValue)}
                        </div>
                        <div className="text-xs text-gray-600 space-y-1 mt-2 mb-3">
                            <div className="flex justify-between">
                                <span>Alíquota Nominal:</span>
                                <span className="font-bold text-primary-700">{(simplesDetails.rate * 100).toFixed(2)}%</span>
                            </div>
                            <div className="flex flex-col gap-1 mt-1">
                                <span className="text-gray-500">Enquadramento:</span>
                                <span className="font-medium text-gray-900 bg-gray-100 px-2 py-1 rounded w-fit">{simplesDetails.tier}</span>
                            </div>
                        </div>
                    </div>
                    <div className={`mt-auto pt-3 border-t text-xs leading-relaxed ${simulatedRegime === 'simples' ? 'border-primary-200 text-primary-800' : 'border-gray-100 text-gray-500'}`}>
                        <strong>Por que escolher?</strong> Ideal para faturamentos iniciais. Unifica 8 tributos em uma única guia (DAS), simplificando a gestão.
                    </div>
                 </button>

                 {/* Lucro Presumido Option */}
                 <button 
                    onClick={() => setSimulatedRegime('presumido')}
                    className={`p-4 rounded-xl border-2 text-left transition-all relative flex flex-col justify-between h-full ${simulatedRegime === 'presumido' ? 'border-primary-500 bg-primary-50 shadow-md ring-1 ring-primary-500' : 'border-gray-100 hover:border-gray-200'}`}
                 >
                    <div>
                        <div className="flex justify-between items-start mb-2">
                            <span className="font-bold text-gray-900">Lucro Presumido</span>
                            {simulatedRegime === 'presumido' && <div className="w-5 h-5 rounded-full bg-primary-500 text-white flex items-center justify-center"><CheckCircle2 className="w-3 h-3" /></div>}
                        </div>
                        <div className="text-2xl font-bold text-gray-900 mb-1">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(presumidoTaxValue)}
                        </div>
                        <div className="text-xs text-gray-600 space-y-1 mt-2 mb-3">
                            <div className="flex justify-between">
                                <span>Alíquota Total Estimada:</span>
                                <span className="font-bold text-gray-700">{((issRate + pisCofinsRate + irpjRate + csllRate)).toFixed(2)}%</span>
                            </div>
                            <div className="flex justify-between text-gray-400">
                                <span>Impostos Federais + ISS</span>
                            </div>
                        </div>
                    </div>
                    <div className={`mt-auto pt-3 border-t text-xs leading-relaxed ${simulatedRegime === 'presumido' ? 'border-primary-200 text-primary-800' : 'border-gray-100 text-gray-500'}`}>
                        <strong>Por que escolher?</strong> Vantajoso para atividades com margem de lucro alta ou poucas despesas dedutíveis.
                    </div>
                 </button>
             </div>

             {/* Lucro Presumido Configuration Panel */}
             {simulatedRegime === 'presumido' && (
                 <div className="mt-4 border border-gray-200 rounded-lg bg-gray-50 overflow-hidden transition-all duration-300">
                     <button 
                        onClick={() => setShowSettings(!showSettings)}
                        className="w-full flex items-center justify-between p-3 text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
                     >
                        <div className="flex items-center gap-2">
                            <Settings className="w-4 h-4 text-primary-500" />
                            Configurar Alíquotas (Serviços)
                        </div>
                        {showSettings ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                     </button>
                     
                     {showSettings && (
                         <div className="p-4 bg-white border-t border-gray-100 grid grid-cols-2 md:grid-cols-4 gap-3 animate-fade-in-down">
                            {/* IRPJ */}
                            <div className="bg-gray-50 p-2.5 rounded-md border border-gray-200 flex flex-col justify-between hover:border-primary-300 transition-colors">
                                <label className="text-[10px] uppercase font-bold text-gray-500 mb-1">IRPJ</label>
                                <div className="flex items-center">
                                    <input 
                                        type="number" 
                                        step="0.01" 
                                        value={irpjRate} 
                                        onChange={e => setIrpjRate(parseFloat(e.target.value) || 0)}
                                        className="w-full bg-transparent text-sm font-bold text-gray-900 outline-none"
                                    />
                                    <Percent className="w-3 h-3 text-gray-400" />
                                </div>
                            </div>

                            {/* CSLL */}
                            <div className="bg-gray-50 p-2.5 rounded-md border border-gray-200 flex flex-col justify-between hover:border-primary-300 transition-colors">
                                <label className="text-[10px] uppercase font-bold text-gray-500 mb-1">CSLL</label>
                                <div className="flex items-center">
                                    <input 
                                        type="number" 
                                        step="0.01" 
                                        value={csllRate} 
                                        onChange={e => setCsllRate(parseFloat(e.target.value) || 0)}
                                        className="w-full bg-transparent text-sm font-bold text-gray-900 outline-none"
                                    />
                                    <Percent className="w-3 h-3 text-gray-400" />
                                </div>
                            </div>

                            {/* PIS/COFINS */}
                            <div className="bg-gray-50 p-2.5 rounded-md border border-gray-200 flex flex-col justify-between hover:border-primary-300 transition-colors">
                                <div className="flex justify-between items-start">
                                    <label className="text-[10px] uppercase font-bold text-gray-500 mb-1">PIS/COFINS</label>
                                    <div title="Geralmente 3,65% (0,65% PIS + 3,00% COFINS) no regime cumulativo">
                                        <Info className="w-3 h-3 text-gray-400" />
                                    </div>
                                </div>
                                <div className="flex items-center">
                                    <input 
                                        type="number" 
                                        step="0.01" 
                                        value={pisCofinsRate} 
                                        onChange={e => setPisCofinsRate(parseFloat(e.target.value) || 0)}
                                        className="w-full bg-transparent text-sm font-bold text-gray-900 outline-none"
                                    />
                                    <Percent className="w-3 h-3 text-gray-400" />
                                </div>
                                {pisCofinsRate !== 3.65 && (
                                     <button 
                                        onClick={() => setPisCofinsRate(3.65)}
                                        className="text-[10px] text-blue-500 hover:underline mt-1 text-left w-full font-medium"
                                     >
                                        Retornar ao padrão (3,65%)
                                     </button>
                                )}
                            </div>

                            {/* ISS */}
                            <div className="bg-primary-50 p-2.5 rounded-md border border-primary-200 flex flex-col justify-between">
                                <div className="flex justify-between items-start">
                                    <label className="text-[10px] uppercase font-bold text-primary-700 mb-1">ISS (Mun)</label>
                                    <div title="Alíquota varia por município (2% a 5%)">
                                        <Info className="w-3 h-3 text-primary-400" />
                                    </div>
                                </div>
                                <div className="flex items-center">
                                    <input 
                                        type="number" 
                                        step="0.01" 
                                        value={issRate} 
                                        onChange={e => setIssRate(parseFloat(e.target.value) || 0)}
                                        className="w-full bg-transparent text-sm font-bold text-primary-800 outline-none"
                                    />
                                    <Percent className="w-3 h-3 text-primary-600" />
                                </div>
                                {issRate > 5 && (
                                    <p className="text-[10px] text-orange-600 mt-1 leading-tight font-medium">
                                        Atenção: O teto usual do ISS é 5%. Verifique se está correto.
                                    </p>
                                )}
                            </div>
                         </div>
                     )}
                 </div>
             )}
          </div>
      </div>

      {/* Action Section */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-8 text-white flex flex-col md:flex-row items-center justify-between shadow-xl relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 p-8 opacity-5">
              <FileText className="w-48 h-48 transform rotate-12" />
          </div>

          <div className="relative z-10 max-w-lg w-full md:w-auto mb-6 md:mb-0">
              <div className="flex items-center gap-2 mb-2">
                  <div className="bg-white/10 p-1.5 rounded text-xs font-bold uppercase tracking-wider">
                      {simulatedRegime === 'simples' ? 'DAS' : 'DARF'}
                  </div>
                  <h3 className="text-xl font-bold">Resumo da Apuração</h3>
              </div>
              
              <div className="space-y-1 text-sm text-gray-300">
                 <div className="flex justify-between md:justify-start md:gap-8 border-b border-gray-700 pb-2 mb-2">
                     <span>Competência</span>
                     <span className="text-white font-medium">{selectedMonth}</span>
                 </div>
                 <div className="flex justify-between md:justify-start md:gap-8 border-b border-gray-700 pb-2 mb-2">
                     <span>Vencimento Estimado</span>
                     <span className="text-white font-medium">20/{parseInt(selectedMonth.split('-')[1]) + 1}/{selectedMonth.split('-')[0]}</span>
                 </div>
                 
                 {/* Alert if User selected the more expensive option */}
                 {simulatedRegime === 'presumido' && isPresumidoMoreExpensive && monthlyRevenue > 0 && (
                     <div className="bg-orange-500/20 border border-orange-500/50 rounded-lg p-3 my-3 flex items-start gap-3">
                         <AlertTriangle className="w-5 h-5 text-orange-400 shrink-0" />
                         <div>
                             <p className="text-sm font-bold text-orange-200">Atenção: Opção mais cara</p>
                             <p className="text-xs text-orange-100 mt-1 leading-tight">
                                 O Simples Nacional resultaria em uma economia de 
                                 <strong className="text-white"> {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(savingsAmount)}</strong> nesta competência.
                             </p>
                         </div>
                     </div>
                 )}

                 {/* Breakdown */}
                 <div className="pt-2 text-xs space-y-1 opacity-80">
                    {simulatedRegime === 'presumido' && (
                        <>
                           <div className="flex justify-between md:justify-start md:gap-4">
                               <span className="w-20">IRPJ ({irpjRate}%):</span>
                               <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(monthlyRevenue * (irpjRate/100))}</span>
                           </div>
                           <div className="flex justify-between md:justify-start md:gap-4">
                               <span className="w-20">CSLL ({csllRate}%):</span>
                               <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(monthlyRevenue * (csllRate/100))}</span>
                           </div>
                           <div className="flex justify-between md:justify-start md:gap-4">
                               <span className="w-20">PIS/COF ({pisCofinsRate}%):</span>
                               <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(monthlyRevenue * (pisCofinsRate/100))}</span>
                           </div>
                           <div className="flex justify-between md:justify-start md:gap-4">
                               <span className="w-20">ISS ({issRate}%):</span>
                               <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(monthlyRevenue * (issRate/100))}</span>
                           </div>
                        </>
                    )}
                 </div>
              </div>

              <div className="mt-4">
                  <span className="text-xs uppercase tracking-wide text-gray-400">Total a Recolher</span>
                  <div className="text-4xl font-bold text-green-400 mt-1">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(currentTax)}
                  </div>
              </div>
          </div>

          <div className="relative z-10 w-full md:w-auto flex flex-col items-center">
              {generated ? (
                  <div className="bg-green-500 text-white px-8 py-4 rounded-xl flex items-center gap-4 shadow-lg animate-bounce-short">
                      <div className="bg-white/20 p-2 rounded-full">
                          <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <div>
                          <p className="font-bold text-lg">Guia Gerada com Sucesso!</p>
                          <p className="text-sm opacity-90">Acesse o menu "Documentos" para baixar.</p>
                      </div>
                  </div>
              ) : (
                <div className="w-full">
                    <Button 
                        size="lg" 
                        onClick={handleGenerateGuide}
                        disabled={calculating || monthlyRevenue === 0}
                        className="w-full md:w-auto bg-primary-500 hover:bg-primary-400 text-white border-none py-4 px-8 text-lg shadow-lg hover:shadow-primary-500/30 transition-all"
                    >
                        {calculating ? (
                            <span className="flex items-center">
                                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3"></span>
                                Processando...
                            </span>
                        ) : (
                            <span className="flex items-center">
                                Gerar Guia de Pagamento
                                <ArrowRight className="w-5 h-5 ml-2" />
                            </span>
                        )}
                    </Button>
                    {monthlyRevenue === 0 && (
                        <p className="text-xs text-center text-gray-500 mt-3 flex items-center justify-center gap-1">
                            <Info className="w-3 h-3" />
                            Emita notas fiscais para calcular o imposto.
                        </p>
                    )}
                </div>
              )}
          </div>
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
              <h4 className="font-bold text-blue-800 text-sm">Como funciona o cálculo automático?</h4>
              <p className="text-sm text-blue-700 mt-1">
                  O sistema soma todas as notas fiscais emitidas (status Emitida ou Paga) dentro do mês selecionado. 
                  Baseado no seu regime tributário (Simples Nacional ou Lucro Presumido), aplicamos a alíquota correspondente. 
                  Ao clicar em "Gerar Guia", criamos um documento pendente de pagamento na sua central de documentos.
              </p>
          </div>
      </div>
    </div>
  );
};