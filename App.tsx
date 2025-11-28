
import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  Menu, 
  X, 
  Printer, 
  ArrowLeft, 
  Download, 
  LogOut, 
  Users, 
  BadgeDollarSign, 
  Scale, 
  ArrowRightLeft, 
  Handshake, 
  UsersRound, 
  CalendarDays,
  ChevronDown,
  ChevronRight,
  MessageCircle,
  FolderOpen,
  Rocket,
  PieChart,
  Package
} from 'lucide-react';

import { Dashboard } from './components/Dashboard';
import { InvoiceForm } from './components/InvoiceForm';
import { InvoicePreview } from './components/InvoicePreview';
import { ClientList } from './components/ClientList';
import { ClientForm } from './components/ClientForm';
import { PlaceholderView } from './components/PlaceholderView';
import { PartnersList } from './components/PartnersList';
import { ProLaboreView } from './components/ProLaboreView';
import { SupportView } from './components/SupportView';
import { DocumentsView } from './components/DocumentsView';
import { PlansScreen } from './components/PlansScreen';
import { TaxesView } from './components/TaxesView';
import { CompanyOpeningView } from './components/CompanyOpeningView';
import { PayrollView } from './components/PayrollView';
import { ReportsView } from './components/ReportsView';
import { ObligationsView } from './components/ObligationsView';
import { FinancialView } from './components/FinancialView';
import { TransactionsView } from './components/TransactionsView';
import { AuthScreen } from './components/AuthScreen';

import { Invoice, ViewState, User, Client, Partner, Accountant } from './types';
import { getInvoices, saveInvoice, seedData, getClients, saveClient, deleteClient, getPartners, savePartner, deletePartner, getAssignedAccountant } from './services/storageService';
import { getCurrentUser, logout } from './services/authService';
import { Button } from './components/Button';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [accountant, setAccountant] = useState<Accountant | null>(null);
  const [view, setView] = useState<ViewState>('dashboard');
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [selectedClient, setSelectedClient] = useState<Client | undefined>(undefined);
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [previewMode, setPreviewMode] = useState<'create' | 'view'>('view');

  // Sidebar Submenu State
  const [isPartnersMenuOpen, setIsPartnersMenuOpen] = useState(false);
  const [isTaxesMenuOpen, setIsTaxesMenuOpen] = useState(false);

  // Setup data on load
  useEffect(() => {
    const sessionUser = getCurrentUser();
    if (sessionUser) {
      handleLoginSuccess(sessionUser);
    }
  }, []);

  // Reload data when view changes
  useEffect(() => {
    if (user) {
      refreshData(user.id);
    }
  }, [view, user]);

  const handleLoginSuccess = (loggedInUser: User) => {
    setUser(loggedInUser);
    seedData(loggedInUser.id);
    setAccountant(getAssignedAccountant());
    refreshData(loggedInUser.id);
    setView('dashboard');
  };

  const refreshData = (userId: string) => {
    setInvoices(getInvoices(userId));
    setClients(getClients(userId));
    setPartners(getPartners(userId));
  };

  const handleLogout = () => {
    logout();
    setUser(null);
    window.location.reload();
  };

  // --- Invoice Handlers ---
  const handleSaveInvoice = (invoice: Invoice) => {
    saveInvoice(invoice);
    if(user) refreshData(user.id);
    setView('dashboard');
  };

  const handleViewInvoice = (id: string) => {
    const inv = invoices.find(i => i.id === id);
    if (inv) {
      setSelectedInvoice(inv);
      setPreviewMode('view');
      setView('invoice_details');
    }
  };

  const handleCreateInvoice = () => {
    setSelectedInvoice(null);
    setView('create_invoice');
  };

  const handlePreviewFromForm = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setPreviewMode('create');
    setView('invoice_details');
  };

  // --- Client Handlers ---
  const handleSaveClient = (client: Client) => {
    saveClient(client);
    if(user) refreshData(user.id);
    setView('clients');
  };

  const handleDeleteClient = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este cliente?')) {
        deleteClient(id);
        if(user) refreshData(user.id);
    }
  };

  const handleEditClient = (client: Client) => {
    setSelectedClient(client);
    setView('edit_client');
  };

  const handleCreateClient = () => {
    setSelectedClient(undefined);
    setView('create_client');
  };

  // --- Partner Handlers ---
  const handleSavePartner = (partner: Partner) => {
    savePartner(partner);
    if(user) refreshData(user.id);
    setView('partners');
  };

  const handleDeletePartner = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este sócio?')) {
        deletePartner(id);
        if(user) refreshData(user.id);
    }
  };


  // --- Sidebar Component ---
  const SidebarItem = ({ icon, label, active, onClick, hasSubmenu = false, isOpen = false, onToggle }: any) => (
    <div className="w-full">
      <button
        onClick={hasSubmenu ? onToggle : onClick}
        className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
          active 
            ? 'bg-primary-50 text-primary-600 font-medium' 
            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
        }`}
      >
        <div className="flex items-center space-x-3">
          {icon}
          <span>{label}</span>
        </div>
        {hasSubmenu && (
          isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />
        )}
      </button>
    </div>
  );

  const SubmenuItem = ({ label, active, onClick }: any) => (
    <button
      onClick={onClick}
      className={`w-full flex items-center space-x-3 px-12 py-2 text-sm transition-colors ${
        active 
          ? 'text-primary-600 font-medium' 
          : 'text-gray-500 hover:text-gray-900'
      }`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-50"></span>
      <span>{label}</span>
    </button>
  );

  // --- Render Auth Screen if not logged in ---
  if (!user) {
    return <AuthScreen onLogin={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row font-sans">
      {/* Mobile Header */}
      <div className="md:hidden bg-white border-b p-4 flex justify-between items-center print:hidden">
        <div className="flex items-center gap-2">
           <span className="text-xl font-bold text-sky-500">∞</span>
           <span className="font-bold text-gray-800">Contabilidade</span>
        </div>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
          {isSidebarOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Sidebar */}
      <aside 
        className={`fixed md:sticky top-0 left-0 z-40 h-screen w-72 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out md:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } print:hidden overflow-y-auto flex flex-col`}
      >
        <div className="p-6">
          {/* Logo Section */}
          <div className="flex items-center gap-3 mb-8 px-2">
             <div className="relative w-10 h-10 flex-shrink-0">
                <svg viewBox="0 0 100 50" className="w-full h-full drop-shadow-sm" style={{ overflow: 'visible' }}>
                   <path 
                     d="M20,25 C20,10 5,10 5,25 C5,40 20,40 25,25 C30,10 45,10 45,25 C45,40 30,40 30,25" 
                     fill="none" 
                     stroke="#0ea5e9" 
                     strokeWidth="8" 
                     strokeLinecap="round"
                   />
                   <circle cx="37" cy="25" r="4" fill="#0ea5e9" />
                </svg>
             </div>
             <div className="flex flex-col justify-center">
                <span className="text-sm font-bold text-[#0ea5e9] leading-tight tracking-wide">Contabilidade</span>
                <span className="text-sm font-bold text-[#0369a1] leading-tight tracking-wide">Confiável</span>
             </div>
          </div>

          {/* Accountant Card */}
          {accountant && (
             <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-4 mb-8 text-white shadow-lg relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-2 opacity-10">
                    <Handshake className="w-16 h-16" />
                </div>
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-3">Seu Contador</p>
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-full border-2 border-primary-500 overflow-hidden bg-gray-700">
                      {accountant.photoUrl && <img src={accountant.photoUrl} className="w-full h-full object-cover" alt="Contador" />}
                   </div>
                   <div>
                       <p className="font-bold text-sm">{accountant.name}</p>
                       <p className="text-xs text-green-400 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
                          Online
                       </p>
                   </div>
                </div>
                <button 
                  onClick={() => { setView('support'); setIsSidebarOpen(false); }}
                  className="mt-4 w-full bg-white/10 hover:bg-white/20 transition-colors text-xs font-medium py-2 rounded-lg flex items-center justify-center gap-2"
                >
                    <MessageCircle className="w-3 h-3" /> Fale com {accountant.name.split(' ').slice(-1)[0]}
                </button>
             </div>
          )}

          <nav className="space-y-1">
            <SidebarItem 
              icon={<Rocket className="w-5 h-5" />} 
              label="Abrir Empresa" 
              active={view === 'company_opening'} 
              onClick={() => { setView('company_opening'); setIsSidebarOpen(false); }}
            />

            <SidebarItem 
              icon={<LayoutDashboard className="w-5 h-5" />} 
              label="Visão Geral" 
              active={view === 'dashboard'} 
              onClick={() => { setView('dashboard'); setIsSidebarOpen(false); }}
            />
            
            <SidebarItem 
              icon={<Package className="w-5 h-5" />} 
              label="Gestão Financeira" 
              active={view === 'financial'} 
              onClick={() => { setView('financial'); setIsSidebarOpen(false); }}
            />

            <SidebarItem 
              icon={<FolderOpen className="w-5 h-5" />} 
              label="Documentos" 
              active={view === 'documents'} 
              onClick={() => { setView('documents'); setIsSidebarOpen(false); }}
            />

            {/* Taxes Accordion */}
            <div className="space-y-1">
              <SidebarItem 
                icon={<Scale className="w-5 h-5" />} 
                label="Gestão Fiscal" 
                active={view === 'taxes' || view === 'obligations'} 
                hasSubmenu={true}
                isOpen={isTaxesMenuOpen}
                onToggle={() => setIsTaxesMenuOpen(!isTaxesMenuOpen)}
              />
              {isTaxesMenuOpen && (
                <div className="animate-fade-in-down">
                  <SubmenuItem 
                    label="Impostos a Pagar" 
                    active={view === 'taxes'} 
                    onClick={() => { setView('taxes'); setIsSidebarOpen(false); }}
                  />
                  <SubmenuItem 
                    label="Obrigações (DCTF/SPED)" 
                    active={view === 'obligations'} 
                    onClick={() => { setView('obligations'); setIsSidebarOpen(false); }}
                  />
                </div>
              )}
            </div>

            <SidebarItem 
              icon={<FileText className="w-5 h-5" />} 
              label="Emitir Notas" 
              active={view === 'create_invoice' || view === 'invoice_details'} 
              onClick={() => { handleCreateInvoice(); setIsSidebarOpen(false); }}
            />

            <SidebarItem 
              icon={<PieChart className="w-5 h-5" />} 
              label="Relatórios (DRE)" 
              active={view === 'reports'} 
              onClick={() => { setView('reports'); setIsSidebarOpen(false); }}
            />

            <SidebarItem 
              icon={<ArrowRightLeft className="w-5 h-5" />} 
              label="Movimentação" 
              active={view === 'transactions'} 
              onClick={() => { setView('transactions'); setIsSidebarOpen(false); }}
            />

            {/* Partners & Payroll Accordion */}
            <div className="space-y-1">
              <SidebarItem 
                icon={<UsersRound className="w-5 h-5" />} 
                label="RH e Sócios" 
                active={view === 'partners' || view === 'pro_labore' || view === 'payroll'} 
                hasSubmenu={true}
                isOpen={isPartnersMenuOpen}
                onToggle={() => setIsPartnersMenuOpen(!isPartnersMenuOpen)}
              />
              {isPartnersMenuOpen && (
                <div className="animate-fade-in-down">
                   <SubmenuItem 
                    label="Folha de Pagamento" 
                    active={view === 'payroll'} 
                    onClick={() => { setView('payroll'); setIsSidebarOpen(false); }}
                  />
                  <SubmenuItem 
                    label="Sócios" 
                    active={view === 'partners'} 
                    onClick={() => { setView('partners'); setIsSidebarOpen(false); }}
                  />
                  <SubmenuItem 
                    label="Pró-Labore" 
                    active={view === 'pro_labore'} 
                    onClick={() => { setView('pro_labore'); setIsSidebarOpen(false); }}
                  />
                </div>
              )}
            </div>

            <SidebarItem 
              icon={<CalendarDays className="w-5 h-5" />} 
              label="Minha Assinatura" 
              active={view === 'subscription'} 
              onClick={() => { setView('subscription'); setIsSidebarOpen(false); }}
            />

             <SidebarItem 
              icon={<Users className="w-5 h-5" />} 
              label="Meus Clientes" 
              active={view === 'clients' || view === 'create_client' || view === 'edit_client'} 
              onClick={() => { setView('clients'); setIsSidebarOpen(false); }}
            />
          </nav>
        </div>

        <div className="p-6 border-t border-gray-100 mt-auto">
             <div className="flex items-center gap-3 mb-4 px-2">
               <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md">
                 {user.name.charAt(0).toUpperCase()}
               </div>
               <div className="overflow-hidden">
                 <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
                 <p className="text-xs text-gray-500 truncate">Cliente VIP</p>
               </div>
             </div>
             <button 
                onClick={handleLogout}
                className="w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors text-sm font-medium"
             >
                <LogOut className="w-4 h-4" />
                <span>Sair</span>
             </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto h-screen p-4 md:p-8 print:p-0 print:h-auto print:overflow-visible bg-gray-50">
        
        {/* Existing Routes */}
        {view === 'dashboard' && (
          <Dashboard 
            invoices={invoices} 
            onCreateNew={handleCreateInvoice} 
            onViewInvoice={handleViewInvoice} 
          />
        )}

        {view === 'clients' && (
          <ClientList 
            clients={clients} 
            onAddClient={handleCreateClient}
            onEditClient={handleEditClient}
            onDeleteClient={handleDeleteClient}
          />
        )}

        {(view === 'create_client' || view === 'edit_client') && (
           <ClientForm 
              userId={user.id}
              initialData={selectedClient}
              onSave={handleSaveClient}
              onCancel={() => setView('clients')}
           />
        )}

        {view === 'create_invoice' && (
           <InvoiceForm 
              userId={user.id}
              onSave={handleSaveInvoice} 
              onCancel={() => setView('dashboard')} 
              onPreview={handlePreviewFromForm}
           />
        )}

        {view === 'invoice_details' && selectedInvoice && (
           <div className="animate-fade-in max-w-[21cm] mx-auto">
             <div className="mb-6 flex items-center justify-between print:hidden">
               <Button 
                 variant="ghost" 
                 onClick={() => previewMode === 'create' ? setView('create_invoice') : setView('dashboard')}
                 icon={<ArrowLeft className="w-4 h-4" />}
               >
                 Voltar
               </Button>
               <div className="flex gap-3">
                 <Button onClick={() => window.print()} variant="secondary" icon={<Printer className="w-4 h-4" />}>
                   Imprimir
                 </Button>
                 {previewMode === 'create' && (
                    <Button onClick={() => handleSaveInvoice(selectedInvoice)} icon={<Download className="w-4 h-4" />}>
                      Salvar & Emitir
                    </Button>
                 )}
               </div>
             </div>
             <InvoicePreview invoice={selectedInvoice} />
           </div>
        )}

        {/* New Routes */}
        
        {view === 'company_opening' && <CompanyOpeningView />}
        {view === 'reports' && <ReportsView />}
        {view === 'obligations' && <ObligationsView />}
        {view === 'payroll' && <PayrollView userId={user.id} />}
        {view === 'financial' && <FinancialView userId={user.id} />}

        {view === 'partners' && (
           <PartnersList 
              partners={partners}
              userId={user.id}
              onSave={handleSavePartner}
              onDelete={handleDeletePartner}
           />
        )}

        {view === 'pro_labore' && (
           <ProLaboreView partners={partners} />
        )}

        {view === 'support' && (
           <SupportView />
        )}

        {view === 'documents' && (
           <DocumentsView />
        )}

        {view === 'billing' && (
          <PlaceholderView 
            title="Cobranças Automáticas" 
            description="Automatize o envio de boletos e lembretes para seus clientes."
            icon={BadgeDollarSign}
            actionLabel="Solicitar Ativação ao Contador"
          />
        )}

        {view === 'taxes' && (
           <TaxesView />
        )}

        {view === 'transactions' && (
           <TransactionsView />
        )}

        {view === 'subscription' && (
          <PlansScreen />
        )}

      </main>
    </div>
  );
};

export default App;
