
import React, { useState } from 'react';
import { Button } from './Button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line } from 'recharts';
import { FileBarChart, PieChart, ArrowUpRight, ArrowDownRight, Download } from 'lucide-react';

export const ReportsView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dre' | 'balance'>('dre');

  // Mock Data for DRE
  const dreData = [
    { month: 'Jan', revenue: 45000, cost: 15000, profit: 30000 },
    { month: 'Fev', revenue: 52000, cost: 18000, profit: 34000 },
    { month: 'Mar', revenue: 48000, cost: 16000, profit: 32000 },
    { month: 'Abr', revenue: 61000, cost: 21000, profit: 40000 },
  ];

  const dreTable = [
      { label: 'Receita Bruta', val: 206000, type: 'plus' },
      { label: '(-) Impostos', val: -16480, type: 'minus' },
      { label: 'Receita Líquida', val: 189520, type: 'total' },
      { label: '(-) Custos (CMV/CSP)', val: -70000, type: 'minus' },
      { label: 'Lucro Bruto', val: 119520, type: 'total' },
      { label: '(-) Despesas Operacionais', val: -35000, type: 'minus' },
      { label: 'Lucro Líquido do Exercício', val: 84520, type: 'final' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Relatórios Contábeis</h2>
          <p className="text-gray-500">Visualize a saúde financeira da sua empresa.</p>
        </div>
        <div className="flex bg-white p-1 rounded-lg border border-gray-200 shadow-sm">
            <button 
                onClick={() => setActiveTab('dre')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'dre' ? 'bg-primary-100 text-primary-700' : 'text-gray-600 hover:text-gray-900'}`}
            >
                DRE Gerencial
            </button>
            <button 
                onClick={() => setActiveTab('balance')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'balance' ? 'bg-primary-100 text-primary-700' : 'text-gray-600 hover:text-gray-900'}`}
            >
                Balanço Patrimonial
            </button>
        </div>
      </div>

      {activeTab === 'dre' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Chart */}
              <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-800 mb-6">Evolução de Resultado</h3>
                  <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={dreData}>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} />
                              <XAxis dataKey="month" />
                              <YAxis />
                              <Tooltip formatter={(val: number) => `R$ ${val}`} />
                              <Legend />
                              <Bar dataKey="revenue" name="Receita" fill="#3b82f6" radius={[4,4,0,0]} />
                              <Bar dataKey="profit" name="Lucro Líquido" fill="#10b981" radius={[4,4,0,0]} />
                          </BarChart>
                      </ResponsiveContainer>
                  </div>
              </div>

              {/* DRE Table */}
              <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm h-fit">
                  <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg font-bold text-gray-800">Demonstrativo (Acumulado)</h3>
                      <Button variant="ghost" size="sm" icon={<Download className="w-4 h-4"/>} />
                  </div>
                  <div className="space-y-3">
                      {dreTable.map((row, idx) => (
                          <div key={idx} className={`flex justify-between items-center p-2 rounded ${row.type === 'final' ? 'bg-green-50 border border-green-100 font-bold' : row.type === 'total' ? 'bg-gray-50 font-semibold' : ''}`}>
                              <span className={`${row.type === 'final' ? 'text-green-800' : 'text-gray-700'}`}>{row.label}</span>
                              <span className={`${row.type === 'minus' ? 'text-red-500' : row.type === 'final' ? 'text-green-700' : 'text-gray-900'}`}>
                                  {new Intl.NumberFormat('pt-BR', {style: 'currency', currency: 'BRL'}).format(row.val)}
                              </span>
                          </div>
                      ))}
                  </div>
              </div>
          </div>
      )}

      {activeTab === 'balance' && (
          <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm text-center">
              <FileBarChart className="w-16 h-16 mx-auto text-primary-200 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Balanço Patrimonial Interativo</h3>
              <p className="text-gray-500 max-w-lg mx-auto mb-8">
                  Este relatório detalha os Ativos (bens e direitos) e Passivos (obrigações) da sua empresa. Disponível após o fechamento contábil anual.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left max-w-4xl mx-auto">
                  <div className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-bold text-gray-800 border-b pb-2 mb-4 flex items-center gap-2">
                          <ArrowUpRight className="w-4 h-4 text-green-500" /> ATIVO
                      </h4>
                      <div className="space-y-2 text-sm">
                          <div className="flex justify-between"><span>Circulante (Caixa/Bancos)</span> <span>R$ 45.000</span></div>
                          <div className="flex justify-between"><span>Realizável (Clientes)</span> <span>R$ 12.000</span></div>
                          <div className="flex justify-between font-bold pt-2 border-t"><span>Total Ativo</span> <span>R$ 57.000</span></div>
                      </div>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-bold text-gray-800 border-b pb-2 mb-4 flex items-center gap-2">
                          <ArrowDownRight className="w-4 h-4 text-red-500" /> PASSIVO
                      </h4>
                      <div className="space-y-2 text-sm">
                          <div className="flex justify-between"><span>Fornecedores</span> <span>R$ 5.000</span></div>
                          <div className="flex justify-between"><span>Impostos a Pagar</span> <span>R$ 2.400</span></div>
                          <div className="flex justify-between"><span>Patrimônio Líquido</span> <span>R$ 49.600</span></div>
                          <div className="flex justify-between font-bold pt-2 border-t"><span>Total Passivo</span> <span>R$ 57.000</span></div>
                      </div>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};
