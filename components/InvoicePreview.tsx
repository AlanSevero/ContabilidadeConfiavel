
import React from 'react';
import { Invoice } from '../types';
import { Button } from './Button';
import { Barcode } from 'lucide-react';

interface Props {
  invoice: Invoice;
}

export const InvoicePreview: React.FC<Props> = ({ invoice }) => {
  const subtotal = invoice.items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
  const taxAmount = subtotal * (invoice.taxRate / 100);
  const total = subtotal + taxAmount;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  return (
    <div className="bg-white p-8 max-w-[21cm] mx-auto shadow-lg print:shadow-none print:w-full print:max-w-none text-sm text-gray-800" id="printable-invoice">
      {/* Header */}
      <div className="flex justify-between items-start border-b pb-6 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">NOTA FISCAL DE SERVIÇO</h1>
          <p className="text-gray-500">Nº {invoice.number}</p>
        </div>
        <div className="text-right">
          <div className="font-semibold text-lg text-primary-600">NotaSmart</div>
          <p className="text-gray-500">Emissão: {formatDate(invoice.date)}</p>
        </div>
      </div>

      {/* Entities */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        <div>
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Prestador de Serviços</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="font-bold text-gray-900">{invoice.issuer.name}</p>
            <p>{invoice.issuer.taxId}</p>
            <p>{invoice.issuer.address.street}, {invoice.issuer.address.number}</p>
            <p>{invoice.issuer.address.city} - {invoice.issuer.address.state}</p>
            <p>{invoice.issuer.email}</p>
          </div>
        </div>
        <div>
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Tomador de Serviços</h3>
          <div className="border border-gray-200 p-4 rounded-lg">
            <p className="font-bold text-gray-900">{invoice.client.name}</p>
            <p>{invoice.client.taxId}</p>
            <p>{invoice.client.address.street}, {invoice.client.address.number}</p>
            <p>{invoice.client.address.city} - {invoice.client.address.state}</p>
            <p>{invoice.client.email}</p>
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="mb-8">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Discriminação dos Serviços</h3>
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descrição</th>
              <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Qtd</th>
              <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Valor Unit.</th>
              <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {invoice.items.map((item) => (
              <tr key={item.id}>
                <td className="px-3 py-3 whitespace-pre-line">{item.description}</td>
                <td className="px-3 py-3 text-right">{item.quantity}</td>
                <td className="px-3 py-3 text-right">{formatCurrency(item.unitPrice)}</td>
                <td className="px-3 py-3 text-right font-medium">{formatCurrency(item.quantity * item.unitPrice)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="flex justify-end mb-8">
        <div className="w-64">
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-500">Subtotal</span>
            <span className="font-medium">{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-500">Impostos ({invoice.taxRate}%)</span>
            <span className="font-medium">{formatCurrency(taxAmount)}</span>
          </div>
          <div className="flex justify-between py-3 text-lg font-bold text-gray-900">
            <span>Total</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </div>
      </div>

      {/* Footer Notes */}
      {invoice.notes && (
        <div className="border-t pt-4 text-gray-500 text-xs">
          <p className="font-bold mb-1">Observações:</p>
          <p>{invoice.notes}</p>
        </div>
      )}
      
      {/* Boleto Simulator Button */}
      <div className="mt-8 pt-6 border-t border-dashed border-gray-300 print:hidden">
          <div className="bg-gray-50 p-4 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-3">
                  <Barcode className="w-8 h-8 text-gray-600" />
                  <div>
                      <h4 className="font-bold text-gray-800">Boleto Bancário</h4>
                      <p className="text-xs text-gray-500">Gere um boleto registrado para esta nota.</p>
                  </div>
              </div>
              <Button size="sm" variant="secondary" onClick={() => alert('Boleto gerado e enviado para o cliente por email!')}>
                  Gerar Boleto
              </Button>
          </div>
      </div>

      <div className="mt-12 text-center text-xs text-gray-400">
        <p>Documento emitido para fins de demonstração pelo NotaSmart AI.</p>
      </div>
    </div>
  );
};
