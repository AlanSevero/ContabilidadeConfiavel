
import React, { useState, useEffect } from 'react';
import { Product, ProductSale } from '../types';
import { getProducts, saveProduct, deleteProduct, getProductSales, saveProductSale } from '../services/storageService';
import { Button } from './Button';
import { Input } from './Input';
import { 
  Package, 
  ShoppingCart, 
  LayoutDashboard, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  TrendingUp, 
  AlertTriangle, 
  DollarSign, 
  Save, 
  X
} from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { generateId } from '../services/utils';

export const FinancialView: React.FC<{ userId: string }> = ({ userId }) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'inventory' | 'sales'>('dashboard');
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<ProductSale[]>([]);

  // Inventory Editing State
  const [isEditing, setIsEditing] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Sales State
  const [selectedProductForSale, setSelectedProductForSale] = useState<string>('');
  const [saleQuantity, setSaleQuantity] = useState(1);

  useEffect(() => {
    refreshData();
  }, [userId]);

  const refreshData = () => {
    setProducts(getProducts(userId));
    setSales(getProductSales(userId));
  };

  // --- CRUD Operations ---
  const handleEditProduct = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
    } else {
      setEditingProduct({
        id: generateId(),
        userId,
        name: '',
        sku: '',
        costPrice: 0,
        salePrice: 0,
        currentStock: 0,
        minStock: 5,
        category: ''
      });
    }
    setIsEditing(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct) {
      saveProduct(editingProduct);
      setIsEditing(false);
      setEditingProduct(null);
      refreshData();
    }
  };

  const handleDeleteProduct = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este produto?')) {
      deleteProduct(id);
      refreshData();
    }
  };

  const handleRegisterSale = (e: React.FormEvent) => {
    e.preventDefault();
    const product = products.find(p => p.id === selectedProductForSale);
    
    if (product && saleQuantity > 0) {
      if (product.currentStock < saleQuantity) {
        alert('Estoque insuficiente!');
        return;
      }

      // Create Sale Record
      const newSale: ProductSale = {
        id: generateId(),
        userId,
        productId: product.id,
        productName: product.name,
        quantity: saleQuantity,
        totalPrice: product.salePrice * saleQuantity,
        date: new Date().toISOString()
      };

      // Update Stock
      const updatedProduct = { ...product, currentStock: product.currentStock - saleQuantity };
      
      saveProductSale(newSale);
      saveProduct(updatedProduct);
      
      refreshData();
      setSaleQuantity(1);
      alert('Venda registrada com sucesso!');
    }
  };

  // --- Dashboard Logic ---
  const totalStockValue = products.reduce((acc, p) => acc + (p.costPrice * p.currentStock), 0);
  const totalSalesValue = sales.reduce((acc, s) => acc + s.totalPrice, 0);
  const lowStockItems = products.filter(p => p.currentStock <= p.minStock);
  const potentialProfit = products.reduce((acc, p) => acc + ((p.salePrice - p.costPrice) * p.currentStock), 0);

  const stockByCategory = products.reduce((acc: any[], product) => {
     const existing = acc.find(item => item.name === product.category);
     if (existing) {
        existing.value += product.currentStock;
     } else if (product.category) {
        acc.push({ name: product.category, value: product.currentStock });
     }
     return acc;
  }, []);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  // --- Render Edit Form ---
  if (isEditing && editingProduct) {
    return (
      <div className="max-w-3xl mx-auto animate-fade-in">
         <div className="flex items-center gap-3 mb-6">
            <Button variant="ghost" onClick={() => setIsEditing(false)} icon={<X className="w-4 h-4"/>}>Cancelar</Button>
            <h2 className="text-xl font-bold text-gray-900">{products.find(p => p.id === editingProduct.id) ? 'Editar Produto' : 'Novo Produto'}</h2>
         </div>
         <form onSubmit={handleSaveProduct} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
             <div className="grid grid-cols-2 gap-4">
                 <div className="col-span-2 md:col-span-1">
                     <Input label="Nome do Produto" value={editingProduct.name} onChange={e => setEditingProduct({...editingProduct, name: e.target.value})} required />
                 </div>
                 <Input label="Código (SKU)" value={editingProduct.sku} onChange={e => setEditingProduct({...editingProduct, sku: e.target.value})} />
             </div>
             <div className="grid grid-cols-3 gap-4">
                 <Input label="Categoria" value={editingProduct.category} onChange={e => setEditingProduct({...editingProduct, category: e.target.value})} placeholder="Ex: Eletrônicos" />
                 <Input label="Estoque Atual" type="number" value={editingProduct.currentStock} onChange={e => setEditingProduct({...editingProduct, currentStock: Number(e.target.value)})} required />
                 <Input label="Estoque Mínimo" type="number" value={editingProduct.minStock} onChange={e => setEditingProduct({...editingProduct, minStock: Number(e.target.value)})} />
             </div>
             <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                 <Input label="Preço de Custo (R$)" type="number" step="0.01" value={editingProduct.costPrice} onChange={e => setEditingProduct({...editingProduct, costPrice: Number(e.target.value)})} required />
                 <Input label="Preço de Venda (R$)" type="number" step="0.01" value={editingProduct.salePrice} onChange={e => setEditingProduct({...editingProduct, salePrice: Number(e.target.value)})} required />
                 <div className="col-span-2 text-right text-sm text-gray-500">
                     Margem Estimada: {editingProduct.costPrice > 0 ? (((editingProduct.salePrice - editingProduct.costPrice)/editingProduct.costPrice)*100).toFixed(1) : 0}%
                 </div>
             </div>
             <div className="flex justify-end pt-4">
                 <Button type="submit" icon={<Save className="w-4 h-4"/>}>Salvar Produto</Button>
             </div>
         </form>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestão Financeira</h2>
          <p className="text-gray-500">Controle de caixa, estoque e vendas.</p>
        </div>
        <div className="flex bg-white p-1 rounded-lg border border-gray-200 shadow-sm">
            <button 
                onClick={() => setActiveTab('dashboard')}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'dashboard' ? 'bg-primary-100 text-primary-700' : 'text-gray-600 hover:text-gray-900'}`}
            >
                <LayoutDashboard className="w-4 h-4" /> Dashboard
            </button>
            <button 
                onClick={() => setActiveTab('inventory')}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'inventory' ? 'bg-primary-100 text-primary-700' : 'text-gray-600 hover:text-gray-900'}`}
            >
                <Package className="w-4 h-4" /> Estoque
            </button>
            <button 
                onClick={() => setActiveTab('sales')}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'sales' ? 'bg-primary-100 text-primary-700' : 'text-gray-600 hover:text-gray-900'}`}
            >
                <ShoppingCart className="w-4 h-4" /> Caixa / Vendas
            </button>
        </div>
      </div>

      {/* DASHBOARD TAB */}
      {activeTab === 'dashboard' && (
          <div className="space-y-6">
              {/* KPIs */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                      <p className="text-sm text-gray-500 mb-1">Valor em Estoque</p>
                      <h3 className="text-2xl font-bold text-gray-900">{new Intl.NumberFormat('pt-BR', {style: 'currency', currency: 'BRL'}).format(totalStockValue)}</h3>
                  </div>
                  <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                      <p className="text-sm text-gray-500 mb-1">Lucro Projetado</p>
                      <h3 className="text-2xl font-bold text-green-600">{new Intl.NumberFormat('pt-BR', {style: 'currency', currency: 'BRL'}).format(potentialProfit)}</h3>
                  </div>
                  <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                      <p className="text-sm text-gray-500 mb-1">Vendas Totais</p>
                      <h3 className="text-2xl font-bold text-blue-600">{new Intl.NumberFormat('pt-BR', {style: 'currency', currency: 'BRL'}).format(totalSalesValue)}</h3>
                  </div>
                  <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                      <p className="text-sm text-gray-500 mb-1">Alertas de Estoque</p>
                      <h3 className={`text-2xl font-bold ${lowStockItems.length > 0 ? 'text-red-500' : 'text-gray-900'}`}>{lowStockItems.length}</h3>
                  </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Stock Chart */}
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                      <h3 className="font-bold text-gray-900 mb-6">Distribuição por Categoria</h3>
                      <div className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                  <Pie
                                      data={stockByCategory}
                                      cx="50%"
                                      cy="50%"
                                      innerRadius={60}
                                      outerRadius={80}
                                      fill="#8884d8"
                                      paddingAngle={5}
                                      dataKey="value"
                                  >
                                      {stockByCategory.map((entry, index) => (
                                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                      ))}
                                  </Pie>
                                  <Tooltip />
                                  <Legend />
                              </PieChart>
                          </ResponsiveContainer>
                      </div>
                  </div>

                  {/* Low Stock List */}
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                      <div className="flex items-center gap-2 mb-4">
                          <AlertTriangle className="w-5 h-5 text-red-500" />
                          <h3 className="font-bold text-gray-900">Produtos com Estoque Baixo</h3>
                      </div>
                      <div className="overflow-y-auto max-h-64 space-y-3">
                          {lowStockItems.length === 0 ? (
                              <p className="text-sm text-gray-500">Tudo certo! Nenhum produto abaixo do mínimo.</p>
                          ) : (
                              lowStockItems.map(p => (
                                  <div key={p.id} className="flex justify-between items-center p-3 bg-red-50 rounded-lg border border-red-100">
                                      <div>
                                          <p className="font-medium text-red-900">{p.name}</p>
                                          <p className="text-xs text-red-700">SKU: {p.sku}</p>
                                      </div>
                                      <div className="text-right">
                                          <p className="font-bold text-red-700">{p.currentStock} un</p>
                                          <p className="text-xs text-red-600">Mín: {p.minStock}</p>
                                      </div>
                                  </div>
                              ))
                          )}
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* INVENTORY TAB */}
      {activeTab === 'inventory' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                  <div className="relative">
                      <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                      <input type="text" placeholder="Buscar produtos..." className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                  </div>
                  <Button size="sm" onClick={() => handleEditProduct()} icon={<Plus className="w-4 h-4"/>}>Novo Produto</Button>
              </div>
              <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-gray-500">
                      <tr>
                          <th className="px-6 py-3 text-left font-medium">Produto</th>
                          <th className="px-6 py-3 text-left font-medium">Categoria</th>
                          <th className="px-6 py-3 text-right font-medium">Preço Venda</th>
                          <th className="px-6 py-3 text-center font-medium">Estoque</th>
                          <th className="px-6 py-3 text-right font-medium">Ações</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                      {products.map(p => (
                          <tr key={p.id} className="hover:bg-gray-50">
                              <td className="px-6 py-3">
                                  <p className="font-medium text-gray-900">{p.name}</p>
                                  <p className="text-xs text-gray-500">SKU: {p.sku}</p>
                              </td>
                              <td className="px-6 py-3 text-gray-600">{p.category || '-'}</td>
                              <td className="px-6 py-3 text-right font-medium text-gray-900">
                                  {new Intl.NumberFormat('pt-BR', {style: 'currency', currency: 'BRL'}).format(p.salePrice)}
                              </td>
                              <td className="px-6 py-3 text-center">
                                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${p.currentStock <= p.minStock ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                      {p.currentStock}
                                  </span>
                              </td>
                              <td className="px-6 py-3 text-right">
                                  <div className="flex items-center justify-end gap-2">
                                      <button onClick={() => handleEditProduct(p)} className="p-1 text-gray-500 hover:text-primary-600"><Edit className="w-4 h-4"/></button>
                                      <button onClick={() => handleDeleteProduct(p.id)} className="p-1 text-gray-500 hover:text-red-600"><Trash2 className="w-4 h-4"/></button>
                                  </div>
                              </td>
                          </tr>
                      ))}
                      {products.length === 0 && (
                          <tr>
                              <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                  Nenhum produto cadastrado no estoque.
                              </td>
                          </tr>
                      )}
                  </tbody>
              </table>
          </div>
      )}

      {/* SALES TAB */}
      {activeTab === 'sales' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Sales Form */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-fit">
                  <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-green-600" /> Registrar Venda
                  </h3>
                  <form onSubmit={handleRegisterSale} className="space-y-4">
                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Selecione o Produto</label>
                          <select 
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 p-2 border bg-white"
                            value={selectedProductForSale}
                            onChange={e => setSelectedProductForSale(e.target.value)}
                            required
                          >
                              <option value="">Selecione...</option>
                              {products.map(p => (
                                  <option key={p.id} value={p.id} disabled={p.currentStock <= 0}>
                                      {p.name} (Disp: {p.currentStock}) - R$ {p.salePrice.toFixed(2)}
                                  </option>
                              ))}
                          </select>
                      </div>
                      
                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Quantidade</label>
                          <div className="flex items-center gap-2">
                              <button 
                                type="button" 
                                className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center font-bold hover:bg-gray-200"
                                onClick={() => setSaleQuantity(Math.max(1, saleQuantity - 1))}
                              >
                                  -
                              </button>
                              <input 
                                type="number" 
                                className="w-full text-center rounded-md border-gray-300 shadow-sm p-2 border"
                                value={saleQuantity}
                                onChange={e => setSaleQuantity(Math.max(1, Number(e.target.value)))}
                                min="1"
                              />
                               <button 
                                type="button" 
                                className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center font-bold hover:bg-gray-200"
                                onClick={() => setSaleQuantity(saleQuantity + 1)}
                              >
                                  +
                              </button>
                          </div>
                      </div>

                      {selectedProductForSale && (
                          <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                              <div className="flex justify-between text-sm mb-1">
                                  <span>Valor Unitário</span>
                                  <span>{new Intl.NumberFormat('pt-BR', {style: 'currency', currency: 'BRL'}).format(products.find(p => p.id === selectedProductForSale)?.salePrice || 0)}</span>
                              </div>
                              <div className="flex justify-between font-bold text-lg text-green-800">
                                  <span>Total</span>
                                  <span>{new Intl.NumberFormat('pt-BR', {style: 'currency', currency: 'BRL'}).format((products.find(p => p.id === selectedProductForSale)?.salePrice || 0) * saleQuantity)}</span>
                              </div>
                          </div>
                      )}

                      <Button type="submit" className="w-full" disabled={!selectedProductForSale}>
                          Finalizar Venda
                      </Button>
                  </form>
              </div>

              {/* Recent Sales List */}
              <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="p-4 border-b border-gray-100 bg-gray-50">
                      <h3 className="font-bold text-gray-900">Histórico de Vendas</h3>
                  </div>
                  <div className="overflow-y-auto max-h-[500px]">
                      {sales.length === 0 ? (
                          <div className="p-8 text-center text-gray-500">Nenhuma venda registrada hoje.</div>
                      ) : (
                          <table className="w-full text-sm">
                              <thead className="bg-gray-50 text-gray-500">
                                  <tr>
                                      <th className="px-4 py-2 text-left">Data</th>
                                      <th className="px-4 py-2 text-left">Produto</th>
                                      <th className="px-4 py-2 text-center">Qtd</th>
                                      <th className="px-4 py-2 text-right">Total</th>
                                  </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-100">
                                  {[...sales].reverse().map(sale => (
                                      <tr key={sale.id} className="hover:bg-gray-50">
                                          <td className="px-4 py-2 text-gray-600">
                                              {new Date(sale.date).toLocaleDateString()} <span className="text-xs">{new Date(sale.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                          </td>
                                          <td className="px-4 py-2 font-medium text-gray-900">{sale.productName}</td>
                                          <td className="px-4 py-2 text-center">{sale.quantity}</td>
                                          <td className="px-4 py-2 text-right font-bold text-green-600">
                                              {new Intl.NumberFormat('pt-BR', {style: 'currency', currency: 'BRL'}).format(sale.totalPrice)}
                                          </td>
                                      </tr>
                                  ))}
                              </tbody>
                          </table>
                      )}
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};
