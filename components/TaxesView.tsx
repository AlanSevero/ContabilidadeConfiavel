
import React, { useState, useEffect } from 'react';
import { Invoice, InvoiceStatus, TaxRegime, AccountingDocument } from '../types';
import { getInvoices, saveDocument } from '../services/storageService';
import { Button } from './Button';
import { Calculator, ArrowRight, TrendingUp, AlertCircle, CheckCircle2, FileText, Info, Settings, Percent, ChevronDown, ChevronUp, AlertTriangle, MapPin, Table as TableIcon, HelpCircle } from 'lucide-react';
import { getCurrentUser } from '../services/authService';
import { generateId } from '../services/utils';

export const TaxesView: React.FC = () => {
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().slice(0, 7));
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState(0);
  const [simulatedRegime, setSimulatedRegime] = useState<TaxRegime>('simples');
  const [calculating, setCalculating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [showSettings, setShowSettings] = useState(true);
  const [showSimplesDetails, setShowSimplesDetails] = useState(false);

  // Presumido Rates State (Defaults based on Service industry standard)
  const [issRate, setIssRate] = useState(5.00);
  const [pisCofinsRate, setPisCofinsRate] = useState(3.65);
  const [irpjRate, setIrpjRate] = useState(4.80); // Presumed base 32% * 15%
  const [csllRate, setCsllRate] = useState(2.88); // Presumed base 32% * 9%
  
  const [selectedCity, setSelectedCity] = useState('custom');

  const user = getCurrentUser();

  // Mock City Data for ISS
  const cities = [
      { id: 'sp', name: 'São Paulo - SP', rate: 2.9 },
      { id: 'rj', name: 'Rio de Janeiro - RJ', rate: 5.0 },
      { id: 'bh', name: 'Belo Horizonte - MG', rate: 3.0 },
      { id: 'df', name: 'Brasília - DF', rate: 5.0 },
      { id: 'cur', name: 'Curitiba - PR', rate: 5.0 },
      { id: 'sal', name: 'Salvador - BA', rate: 3.0 },
      { id: 'poa', name: 'Porto Alegre - RS', rate: 5.0 },
      { id: 'man', name: 'Manaus - AM', rate: 5.0 },
      { id: 'rec', name: 'Recife - PE', rate: 5.0 },
      { id: 'for', name: 'Fortaleza - CE', rate: 5.0 },
      { id: 'goi', name: 'Goiânia - GO', rate: 5.0 },
      { id: 'custom', name: 'Outra Cidade / Personalizado', rate: 5.0 }
  ];

  // Simples Nacional Tiers (Anexo III - Services - Real 2024 Data)
  const SIMPLES_TIERS = [
      { id: 1, limit: 180000, nominalRate: 0.06, deduction: 0, label: '1ª Faixa', range: 'Até R$ 180.000,00' },
      { id: 2, limit: 360000, nominalRate: 0.112, deduction: 9360, label: '2ª Faixa', range: 'De R$ 180.000,01 a R$ 360.000,00' },
      { id: 3, limit: 720000, nominalRate: 0.135, deduction: 17640, label: '3ª Faixa', range: 'De R$ 360.000,01 a R$ 720.000,00' },
      { id: 4, limit: 1800000, nominalRate: 0.16, deduction: 35640, label: '4ª Faixa', range: 'De R$ 720.000,01 a R$ 1.800.000,00' },
      { id: 5, limit: 3600000, nominalRate: 0.21, deduction: 125640, label: '5ª Faixa', range: 'De R$ 1.800.000,01 a R$ 3.600.000,00' },
      { id: 6, limit: 4800000, nominalRate: 0.33, deduction: 648000, label: '6ª Faixa', range: 'De R$ 3.600.000,01 a R$ 4.800.000,00' }
  ];

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

  const handleCityChange = (cityId: string) => {
      setSelectedCity(cityId);
      const city = cities.find(c => c.id === cityId);
      if (city && cityId !== 'custom') {
          setIssRate(city.rate);
      }
  };

  // --- Logic for Simples Nacional (Simplified Anexo III - Services) ---
  const getSimplesDetails = (revenue: number) => {
      // Annualized revenue projection for demo purposes (Current Month * 12)
      // In a real app, this would fetch RBT12 (Revenue of last 12 months)
      const annualized = revenue * 12;
      
      if (revenue === 0) return { effectiveRate: 0, nominalRate: 0, deduction: 0, tier: 'Sem Faturamento', range: '-', tierId: 0, annualized };
      
      const activeTier = SIMPLES_TIERS.find(t => annualized <= t.limit) || SIMPLES_TIERS[SIMPLES_TIERS.length - 1];

      // Formula: ((RBT12 * NominalRate) - Deduction) / RBT12
      let effectiveRate = ((annualized * activeTier.nominalRate) - activeTier.deduction) / annualized;
      
      // Effective rate cannot be negative (in rare edge cases of low RBT12 projection)
      if (effectiveRate < 0) effectiveRate = 0;

      return { 
          effectiveRate,
          nominalRate: activeTier.nominalRate,
          deduction: activeTier.deduction,
          tier: `${activeTier.label} (Anexo III)`, 
          range: activeTier.range,
          tierId: activeTier.id,
          annualized
      };
  };

  const calculateTax = (regime: TaxRegime, revenue: number) => {
      if (regime === 'simples') {
          const { effectiveRate } = getSimplesDetails(revenue);
          return revenue * effectiveRate;
      }
      if (regime === 'presumido') {
          // Calculation includes the manually entered ISS rate and PIS/COFINS
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
              id: generateId(),
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
                 <div className={`rounded-xl border-2 transition-all relative overflow-hidden flex flex-col justify-between h-full ${simulatedRegime === 'simples' ? 'border-primary-500 bg-primary-50 shadow-md ring-1 ring-primary-500' : 'border-gray-100 hover:border-gray-200'}`}>
                    <button 
                        onClick={() => setSimulatedRegime('simples')}
                        className="p-4 text-left w-full h-full"
                    >
                        <div className="flex justify-between items-start mb-2">
                            <span className="font-bold text-gray-900">Simples Nacional</span>
                            {simulatedRegime === 'simples' && <div className="w-5 h-5 rounded-full bg-primary-500 text-white flex items-center justify-center"><CheckCircle2 className="w-3 h-3" /></div>}
                        </div>
                        <div className="text-2xl font-bold text-gray-900 mb-1">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(simplesTaxValue)}
                        </div>
                        <div className="text-xs text-gray-600 space-y-1 mt-2 mb-3">
                            <div className="flex justify-between">
                                <span>Alíquota Efetiva:</span>
                                <span className="font-bold text-primary-700">{(simplesDetails.effectiveRate * 100).toFixed(2)}%</span>
                            </div>
                            <div className="flex flex-col gap-1 mt-1">
                                <span className="text-gray-500">Enquadramento (Anexo III):</span>
                                <div className="flex flex-col">
                                    <span className="font-medium text-gray-900 bg-gray-100 px-2 py-1 rounded w-fit">{simplesDetails.tier}</span>
                                    <span className="text-[10px] text-gray-400 mt-0.5">{simplesDetails.range}</span>
                                </div>
                            </div>
                        </div>
                    </button>
                    
                    {/* Expandable Breakdown Button */}
                    <div className="border-t border-primary-100/50 bg-white/40">
                        <button 
                           onClick={(e) => { e.stopPropagation(); setShowSimplesDetails(!showSimplesDetails); setSimulatedRegime('simples'); }}
                           className="w-full py-2 flex items-center justify-center gap-1 text-xs font-bold text-primary-600 hover:bg-primary-50 transition-colors"
                        >
                            {showSimplesDetails ? <ChevronUp className="w-3 h-3" /> : <TableIcon className="w-3 h-3" />}
                            {showSimplesDetails ? 'Ocultar Tabela' : 'Entenda o Cálculo'}
                        </button>
                    </div>

                    {/* Breakdown Content */}
                    {showSimplesDetails && (
                        <div className="p-4 border-t border-primary-200 bg-white animate-fade-in-down">
                            <div className="mb-4 p-3 bg-blue-50 rounded-lg text-xs text-blue-900 border border-blue-100">
                                <div className="flex items-center gap-1 font-bold mb-2 text-blue-700">
                                    <HelpCircle className="w-3 h-3" />
                                    Fórmula da Alíquota Efetiva:
                                </div>
                                <div className="font-mono bg-white p-2 rounded border border-blue-100 text-center mb-2 text-[10px] sm:text-xs">
                                    (RBT12 × Alíquota Nominal) - Dedução<br/>
                                    ────────────────────────────────────<br/>
                                    RBT12
                                </div>
                                <p className="mb-2 leading-relaxed">
                                    <strong>RBT12 (Receita Bruta 12 meses):</strong> {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(simplesDetails.annualized)}<br/>
                                    <strong>Alíquota Nominal da Faixa:</strong> {(simplesDetails.nominalRate * 100).toFixed(2)}%<br/>
                                    <strong>Parcela a Deduzir:</strong> {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(simplesDetails.deduction)}
                                </p>
                                <p className="text-right font-bold text-blue-700 border-t border-blue-200 pt-1">
                                    = {(simplesDetails.effectiveRate * 100).toFixed(4)}%
                                </p>
                            </div>

                            <div className="overflow-hidden rounded-lg border border-gray-200">
                                <table className="w-full text-[10px] md:text-xs">
                                    <thead className="bg-gray-100 text-gray-500">
                                        <tr>
                                            <th className="px-2 py-1 text-left">Faixa</th>
                                            <th className="px-2 py-1 text-left">Limite 12 Meses</th>
                                            <th className="px-2 py-1 text-center">Aliq. Nominal</th>
                                            <th className="px-2 py-1 text-right">Dedução</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {SIMPLES_TIERS.map((tier) => (
                                            <tr key={tier.id} className={`${simplesDetails.tierId === tier.id ? 'bg-primary-50 text-primary-900 font-bold border-l-4 border-l-primary-500' : 'text-gray-600'}`}>
                                                <td className="px-2 py-1.5">{tier.id}ª</td>
                                                <td className="px-2 py-1.5">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(tier.limit)}</td>
                                                <td className="px-2 py-1.5 text-center">{(tier.nominalRate * 100).toFixed(2)}%</td>
                                                <td className="px-2 py-1.5 text-right">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(tier.deduction)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                 </div>

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
                         <div className="p-4 bg-white border-t border-gray-100 animate-fade-in-down">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
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

                                {/* PIS/COFINS Input Field */}
                                <div className="bg-gray-50 p-2.5 rounded-md border border-gray-200 flex flex-col justify-between hover:border-primary-300 transition-colors">
                                    <div className="flex justify-between items-start">
                                        <label className="text-[10px] uppercase font-bold text-gray-500 mb-1">PIS/COFINS</label>
                                        <div title="PIS + COFINS. Cumulativo: 3.65%. Não Cumulativo: 9.25%">
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
                                    <div className="flex gap-2 mt-1">
                                        <button 
                                            onClick={() => setPisCofinsRate(3.65)}
                                            className={`text-[9px] font-medium ${pisCofinsRate === 3.65 ? 'text-blue-600 font-bold' : 'text-gray-400 hover:text-blue-500'}`}
                                        >
                                            Cumul. (3,65%)
                                        </button>
                                        <button 
                                            onClick={() => setPisCofinsRate(9.25)}
                                            className={`text-[9px] font-medium ${pisCofinsRate === 9.25 ? 'text-blue-600 font-bold' : 'text-gray-400 hover:text-blue-500'}`}
                                        >
                                            Não Cum. (9,25%)
                                        </button>
                                    </div>
                                </div>

                                {/* ISS - Municipal Config */}
                                <div className="bg-primary-50 p-2.5 rounded-md border border-primary-200 flex flex-col justify-between">
                                    <div className="flex justify-between items-start">
                                        <label className="text-[10px] uppercase font-bold text-primary-700 mb-1">ISS (Mun)</label>
                                        <div title="Alíquota varia por município">
                                            <MapPin className="w-3 h-3 text-primary-400" />
                                        </div>
                                    </div>
                                    <div className="flex items-center">
                                        <input 
                                            type="number" 
                                            step="0.01" 
                                            value={issRate} 
                                            onChange={e => {
                                                setIssRate(parseFloat(e.target.value) || 0);
                                                setSelectedCity('custom'); // Switch to custom if edited manually
                                            }}
                                            className="w-full bg-transparent text-sm font-bold text-primary-800 outline-none"
                                        />
                                        <Percent className="w-3 h-3 text-primary-600" />
                                    </div>
                                    <div className="flex gap-2 mt-1">
                                        <button 
                                            onClick={() => { setIssRate(2); setSelectedCity('custom'); }}
                                            className={`text-[9px] font-medium ${issRate === 2 ? 'text-primary-800 font-bold' : 'text-primary-400 hover:text-primary-600'}`}
                                        >
                                            Min (2%)
                                        </button>
                                        <button 
                                            onClick={() => { setIssRate(5); setSelectedCity('custom'); }}
                                            className={`text-[9px] font-medium ${issRate === 5 ? 'text-primary-800 font-bold' : 'text-primary-400 hover:text-primary-600'}`}
                                        >
                                            Max (5%)
                                        </button>
                                    </div>
                                    {issRate > 5 && (
                                        <p className="text-[10px] text-orange-600 mt-1 leading-tight font-medium">
                                            Atenção: Teto ISS 5%.
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* City Selector */}
                            <div className="pt-3 border-t border-gray-100">
                                <label className="text-xs font-semibold text-gray-700 mb-2 block flex items-center gap-1">
                                    <MapPin className="w-3 h-3 text-gray-400" />
                                    Configuração Municipal (ISS)
                                </label>
                                <select 
                                    value={selectedCity}
                                    onChange={(e) => handleCityChange(e.target.value)}
                                    className="w-full p-2 text-sm border border-gray-200 rounded-md focus:ring-1 focus:ring-primary-500 outline-none bg-white"
                                >
                                    {cities.map(city => (
                                        <option key={city.id} value={city.id}>
                                            {city.name} {city.id !== 'custom' ? `(${city.rate}%)` : ''}
                                        </option>
                                    ))}
                                </select>
                                <p className="text-[10px] text-gray-400 mt-1">
                                    Selecione seu município para preencher a alíquota automaticamente ou edite o valor acima.
                                </p>
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
