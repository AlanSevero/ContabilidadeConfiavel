
import React, { useState } from 'react';
import { Button } from './Button';
import { 
  ArrowUpCircle, 
  ArrowDownCircle, 
  Wallet, 
  Search, 
  Filter, 
  Download, 
  Calendar,
  Building2,
  MoreHorizontal
} from 'lucide-react';

interface Transaction {
  id: string;
  date: string;
  description: string;
  category: string;
  type: 'credit' | 'debit';
  amount: number;
  status: 'completed' | 'pending';
}

export const TransactionsView: React.FC = () => {
  const [filterType, setFilterType] = useState<'all' | 'credit' | 'debit'>('all');

  // Mock Data mimicking a real Bank Statement
  const transactions: Transaction[] = [
    { id: '1', date: '2024-02-21', description: 'PIX Recebido - Cliente Exemplo S.A.', category: 'Vendas', type: 'credit', amount: 4500.00, status: 'completed' },
    { id: '2', date: '2024-02-20', description: 'Pgto Boleto - Aluguel Sala Comercial', category: 'Despesas Fixas', type: 'debit', amount: 2200.00, status: 'completed' },
    { id: '3', date: '2024-02-19', description: 'Compra Cartão - Kalunga Informática', category: 'Escritório', type: 'debit', amount: 450.90, status: 'completed' },
    { id: '4', date: '2024-02-18', description: 'PIX Recebido - Tech Consultoria Ltda', category: 'Serviços', type: 'credit', amount: 1200.00, status: 'completed' },
    { id: '5', date: '2024-02-15', description: 'Pgto DAS Simples Nacional', category: 'Impostos', type: 'debit', amount: 680.00, status: 'completed' },
    { id: '6', date: '2024-02-15', description: 'Tarifa Manutenção Conta', category: 'Tarifas', type: 'debit', amount: 29.90, status: 'completed' },
    { id: '7', date: '2024-02-10', description: 'PIX Recebido - Venda Balcão', category: 'Vendas', type: 'credit', amount: 350.00, status: 'completed' },
    { id: '8', date: '2024-02-05', description: 'Pgto Fornecedor - Dell Computadores', category: 'Equipamentos', type: 'debit', amount: 3500.00, status: 'completed' },
  ];

  const filteredTransactions = filterType === 'all' 
    ? transactions 
    : transactions.filter(t => t.type === filterType);

  // Calculations
  const totalBalance = 12450.20; // Mock current balance
  const totalIncome = transactions.filter(t => t.type === 'credit').reduce((acc, t) => acc + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'debit').reduce((acc, t) => acc + t.amount, 0);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Extrato Bancário</h2>
          <p className="text-gray-500">Conciliação bancária e histórico de movimentações.</p>
        </div>
        <div className="flex gap-2">
            <Button variant="secondary" icon={<Download className="w-4 h-4" />}>Exportar OFX</Button>
            <Button variant="secondary" icon={<Calendar className="w-4 h-4" />}>Fev/2024</Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Balance Card */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 text-white shadow-lg relative overflow-hidden">
           <div className="absolute right-0 top-0 p-4 opacity-10">
              <Wallet className="w-24 h-24" />
           </div>
           <p className="text-gray-400 text-sm font-medium mb-1">Saldo em Conta</p>
           <h3 className="text-3xl font-bold mb-4">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalBalance)}
           </h3>
           <div className="flex items-center gap-2 text-xs text-green-400 bg-white/10 w-fit px-2 py-1 rounded">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
              Conta Conectada (Open Finance)
           </div>
        </div>

        {/* Income Card */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
            <div>
               <p className="text-gray-500 text-sm font-medium mb-1">Entradas (Mês)</p>
               <h3 className="text-2xl font-bold text-green-600">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalIncome)}
               </h3>
            </div>
            <div className="bg-green-50 p-3 rounded-full text-green-600">
               <ArrowUpCircle className="w-8 h-8" />
            </div>
        </div>

        {/* Expense Card */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
            <div>
               <p className="text-gray-500 text-sm font-medium mb-1">Saídas (Mês)</p>
               <h3 className="text-2xl font-bold text-red-600">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalExpense)}
               </h3>
            </div>
            <div className="bg-red-50 p-3 rounded-full text-red-600">
               <ArrowDownCircle className="w-8 h-8" />
            </div>
        </div>
      </div>

      {/* Statement Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row gap-4 justify-between bg-gray-50">
           <div className="relative max-w-md w-full">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              <input 
                 type="text" 
                 placeholder="Buscar lançamentos..." 
                 className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
           </div>
           
           <div className="flex bg-white rounded-lg border border-gray-200 p-1">
              <button 
                 onClick={() => setFilterType('all')}
                 className={`px-4 py-1.5 text-xs font-medium rounded-md transition-colors ${filterType === 'all' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
              >
                 Todos
              </button>
              <button 
                 onClick={() => setFilterType('credit')}
                 className={`px-4 py-1.5 text-xs font-medium rounded-md transition-colors ${filterType === 'credit' ? 'bg-green-50 text-green-700' : 'text-gray-500 hover:text-gray-900'}`}
              >
                 Entradas
              </button>
              <button 
                 onClick={() => setFilterType('debit')}
                 className={`px-4 py-1.5 text-xs font-medium rounded-md transition-colors ${filterType === 'debit' ? 'bg-red-50 text-red-700' : 'text-gray-500 hover:text-gray-900'}`}
              >
                 Saídas
              </button>
           </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
           <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
                 <tr>
                    <th className="px-6 py-3 w-32">Data</th>
                    <th className="px-6 py-3">Descrição</th>
                    <th className="px-6 py-3">Categoria</th>
                    <th className="px-6 py-3 text-right">Valor</th>
                    <th className="px-6 py-3 w-10"></th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                 {filteredTransactions.map((t) => (
                    <tr key={t.id} className="hover:bg-gray-50 transition-colors group">
                       <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                          <div className="flex flex-col">
                             <span className="font-bold text-gray-900">{new Date(t.date).getDate()}</span>
                             <span className="text-xs uppercase">{new Date(t.date).toLocaleString('default', { month: 'short' })}</span>
                          </div>
                       </td>
                       <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                             <div className={`p-2 rounded-full ${t.type === 'credit' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                <Building2 className="w-4 h-4" />
                             </div>
                             <div>
                                <p className="font-medium text-gray-900">{t.description}</p>
                                <p className="text-xs text-gray-500 block md:hidden">{t.category}</p>
                             </div>
                          </div>
                       </td>
                       <td className="px-6 py-4 text-gray-600">
                          <span className="bg-gray-100 px-2 py-1 rounded text-xs">{t.category}</span>
                       </td>
                       <td className={`px-6 py-4 text-right font-bold ${t.type === 'credit' ? 'text-green-600' : 'text-gray-900'}`}>
                          {t.type === 'debit' ? '- ' : '+ '}
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(t.amount)}
                       </td>
                       <td className="px-6 py-4 text-center">
                          <button className="text-gray-300 hover:text-gray-600">
                             <MoreHorizontal className="w-4 h-4" />
                          </button>
                       </td>
                    </tr>
                 ))}
              </tbody>
           </table>
        </div>
        
        {/* Footer */}
        <div className="bg-gray-50 border-t border-gray-200 p-4 text-center text-xs text-gray-500">
           Exibindo {filteredTransactions.length} lançamentos. Última atualização via Open Finance: Hoje às 10:45.
        </div>
      </div>
    </div>
  );
};
