import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Invoice, InvoiceStatus } from '../types';
import { Plus, FileText, DollarSign, TrendingUp, AlertCircle } from 'lucide-react';
import { Button } from './Button';

interface Props {
  invoices: Invoice[];
  onCreateNew: () => void;
  onViewInvoice: (id: string) => void;
}

export const Dashboard: React.FC<Props> = ({ invoices, onCreateNew, onViewInvoice }) => {
  const totalRevenue = invoices
    .filter(i => i.status !== InvoiceStatus.CANCELLED)
    .reduce((sum, i) => sum + i.items.reduce((s, item) => s + (item.quantity * item.unitPrice), 0), 0);

  const pendingRevenue = invoices
    .filter(i => i.status === InvoiceStatus.ISSUED)
    .reduce((sum, i) => sum + i.items.reduce((s, item) => s + (item.quantity * item.unitPrice), 0), 0);

  const issuedCount = invoices.length;

  // Chart Data Preparation
  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    return d;
  });

  const chartData = last6Months.map(date => {
    const monthKey = date.toLocaleString('default', { month: 'short' });
    const amount = invoices
      .filter(inv => {
        const invDate = new Date(inv.date);
        return invDate.getMonth() === date.getMonth() && invDate.getFullYear() === date.getFullYear() && inv.status !== InvoiceStatus.CANCELLED;
      })
      .reduce((sum, inv) => sum + inv.items.reduce((s, item) => s + (item.quantity * item.unitPrice), 0), 0);
    
    return { name: monthKey, amount };
  });

  const getStatusColor = (status: InvoiceStatus) => {
    switch(status) {
      case InvoiceStatus.PAID: return 'bg-green-100 text-green-800';
      case InvoiceStatus.ISSUED: return 'bg-yellow-100 text-yellow-800';
      case InvoiceStatus.CANCELLED: return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Visão Geral</h2>
          <p className="text-gray-500">Acompanhe seu faturamento e notas recentes.</p>
        </div>
        <Button onClick={onCreateNew} icon={<Plus className="w-4 h-4" />}>
          Nova Nota Fiscal
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-50 rounded-lg text-green-600">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Faturamento Total</p>
              <h3 className="text-2xl font-bold text-gray-900">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalRevenue)}
              </h3>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Notas Emitidas</p>
              <h3 className="text-2xl font-bold text-gray-900">{issuedCount}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-yellow-50 rounded-lg text-yellow-600">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">A Receber</p>
              <h3 className="text-2xl font-bold text-gray-900">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(pendingRevenue)}
              </h3>
            </div>
          </div>
        </div>
      </div>

      {/* Chart & Recent List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Faturamento Mensal</h3>
            <TrendingUp className="w-5 h-5 text-gray-400" />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} tickFormatter={(val) => `R$${val/1000}k`} />
                <Tooltip 
                  cursor={{ fill: '#f9fafb' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)}
                />
                <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill="#0ea5e9" />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Invoices */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recentes</h3>
          <div className="space-y-4">
            {invoices.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-4">Nenhuma nota emitida ainda.</p>
            ) : (
              invoices.slice(0, 5).map((invoice) => (
                <div 
                  key={invoice.id} 
                  onClick={() => onViewInvoice(invoice.id)}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors border border-transparent hover:border-gray-100"
                >
                  <div className="min-w-0 flex-1 mr-2">
                    <p className="text-sm font-medium text-gray-900 truncate">{invoice.client.name}</p>
                    <p className="text-xs text-gray-500">#{invoice.number}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                        invoice.items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0)
                      )}
                    </p>
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                      {invoice.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};