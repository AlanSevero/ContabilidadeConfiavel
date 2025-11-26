import { Invoice, InvoiceStatus, Client, Partner, Accountant, AccountingDocument, ChatMessage, PlanTier, User, TaxRegime } from '../types';

const INVOICES_KEY = 'notas_fiscais_db_v1';
const CLIENTS_KEY = 'notas_clients_db_v1';
const PARTNERS_KEY = 'notas_partners_db_v1';
const PLAN_KEY = 'notas_user_plan_v1';
const DOCS_KEY = 'notas_docs_db_v1';

// --- Accountant Mock ---
export const getAssignedAccountant = (): Accountant => {
  return {
    id: 'acc_01',
    name: 'Joao Victor',
    role: 'Contador Responsável',
    email: 'joao.victor@confiavel.com',
    whatsapp: '5592993683814',
    status: 'online',
    photoUrl: 'https://img.freepik.com/free-photo/portrait-smiley-business-man_23-2148534354.jpg?w=100&t=st=1708460000'
  };
};

// --- Documents ---
// Now persisted in localStorage so generated taxes appear in DocumentsView
export const getRecentDocuments = (): AccountingDocument[] => {
  const stored = localStorage.getItem(DOCS_KEY);
  if (stored) {
      return JSON.parse(stored);
  }

  // Initial Seed
  const initialDocs: AccountingDocument[] = [
    { id: '1', title: 'DAS - Simples Nacional - Fev/2024', type: 'tax', date: '2024-02-20', status: 'pending', amount: 450.00 },
    { id: '2', title: 'Balancete 2023', type: 'report', date: '2024-01-15', status: 'received' },
    { id: '3', title: 'Extrato Bancário Jan/24', type: 'upload', date: '2024-02-05', status: 'processed' }
  ];
  localStorage.setItem(DOCS_KEY, JSON.stringify(initialDocs));
  return initialDocs;
};

export const saveDocument = (doc: AccountingDocument): void => {
    const docs = getRecentDocuments();
    docs.unshift(doc); // Add to top
    localStorage.setItem(DOCS_KEY, JSON.stringify(docs));
};

export const getSupportMessages = (): ChatMessage[] => {
  return [
    { id: '1', senderId: 'accountant', text: 'Olá! Vi que você emitiu uma nota fiscal com retenção. Precisa de ajuda para calcular a guia?', timestamp: new Date(Date.now() - 86400000).toISOString(), isRead: true },
    { id: '2', senderId: 'user', text: 'Oi Victor, sim. Pode gerar a guia para mim?', timestamp: new Date(Date.now() - 82400000).toISOString(), isRead: true },
    { id: '3', senderId: 'accountant', text: 'Claro! Já estou processando e coloco na aba de Impostos em breve.', timestamp: new Date(Date.now() - 3600000).toISOString(), isRead: false }
  ];
};

// --- Plan ---
export const saveUserPlan = (userId: string, plan: PlanTier) => {
    localStorage.setItem(`${PLAN_KEY}_${userId}`, plan);
}

export const getUserPlan = (userId: string): PlanTier => {
    return (localStorage.getItem(`${PLAN_KEY}_${userId}`) as PlanTier) || 'basico';
}

// --- Invoices ---

export const getInvoices = (userId: string): Invoice[] => {
  const data = localStorage.getItem(INVOICES_KEY);
  const allInvoices: Invoice[] = data ? JSON.parse(data) : [];
  return allInvoices.filter(inv => inv.userId === userId);
};

export const saveInvoice = (invoice: Invoice): void => {
  const data = localStorage.getItem(INVOICES_KEY);
  const allInvoices: Invoice[] = data ? JSON.parse(data) : [];
  
  const existingIndex = allInvoices.findIndex(i => i.id === invoice.id);
  
  if (existingIndex >= 0) {
    allInvoices[existingIndex] = invoice;
  } else {
    allInvoices.push(invoice);
  }
  
  localStorage.setItem(INVOICES_KEY, JSON.stringify(allInvoices));
};

export const deleteInvoice = (id: string): void => {
  const data = localStorage.getItem(INVOICES_KEY);
  let allInvoices: Invoice[] = data ? JSON.parse(data) : [];
  allInvoices = allInvoices.filter(i => i.id !== id);
  localStorage.setItem(INVOICES_KEY, JSON.stringify(allInvoices));
};

// --- Clients ---

export const getClients = (userId: string): Client[] => {
  const data = localStorage.getItem(CLIENTS_KEY);
  const allClients: Client[] = data ? JSON.parse(data) : [];
  return allClients.filter(c => c.userId === userId);
};

export const saveClient = (client: Client): void => {
  const data = localStorage.getItem(CLIENTS_KEY);
  const allClients: Client[] = data ? JSON.parse(data) : [];
  
  const existingIndex = allClients.findIndex(c => c.id === client.id);
  
  if (existingIndex >= 0) {
    allClients[existingIndex] = client;
  } else {
    allClients.push(client);
  }
  
  localStorage.setItem(CLIENTS_KEY, JSON.stringify(allClients));
};

export const deleteClient = (id: string): void => {
  const data = localStorage.getItem(CLIENTS_KEY);
  let allClients: Client[] = data ? JSON.parse(data) : [];
  allClients = allClients.filter(c => c.id !== id);
  localStorage.setItem(CLIENTS_KEY, JSON.stringify(allClients));
};

// --- Partners ---

export const getPartners = (userId: string): Partner[] => {
  const data = localStorage.getItem(PARTNERS_KEY);
  const allPartners: Partner[] = data ? JSON.parse(data) : [];
  return allPartners.filter(p => p.userId === userId);
};

export const savePartner = (partner: Partner): void => {
  const data = localStorage.getItem(PARTNERS_KEY);
  const allPartners: Partner[] = data ? JSON.parse(data) : [];
  
  const existingIndex = allPartners.findIndex(p => p.id === partner.id);
  
  if (existingIndex >= 0) {
    allPartners[existingIndex] = partner;
  } else {
    allPartners.push(partner);
  }
  
  localStorage.setItem(PARTNERS_KEY, JSON.stringify(allPartners));
};

export const deletePartner = (id: string): void => {
  const data = localStorage.getItem(PARTNERS_KEY);
  let allPartners: Partner[] = data ? JSON.parse(data) : [];
  allPartners = allPartners.filter(p => p.id !== id);
  localStorage.setItem(PARTNERS_KEY, JSON.stringify(allPartners));
};


// Seed some data for the User if empty
export const seedData = (userId: string) => {
  // Only seed if this user has no invoices
  if (getInvoices(userId).length === 0) {
    const mockInvoice: Invoice = {
        id: crypto.randomUUID(),
        userId: userId,
        number: '001/2024',
        date: new Date().toISOString(),
        dueDate: new Date(Date.now() + 86400000 * 10).toISOString(),
        status: InvoiceStatus.PAID,
        taxRate: 15,
        issuer: {
          name: 'Minha Empresa Ltda',
          taxId: '12.345.678/0001-90',
          email: 'contato@minhaempresa.com.br',
          address: { street: 'Av. Paulista', number: '1000', city: 'São Paulo', state: 'SP', zip: '01310-100' }
        },
        client: {
          name: 'Cliente Exemplo S.A.',
          taxId: '98.765.432/0001-01',
          email: 'financeiro@exemplo.com.br',
          address: { street: 'Rua Funchal', number: '200', city: 'São Paulo', state: 'SP', zip: '04551-060' }
        },
        items: [
          { id: '101', description: 'Consultoria Especializada em TI', quantity: 1, unitPrice: 5000 }
        ]
    };
    saveInvoice(mockInvoice);
  }

  // Seed a client if none exist
  if (getClients(userId).length === 0) {
      const mockClient: Client = {
          id: crypto.randomUUID(),
          userId: userId,
          name: 'Cliente Exemplo S.A.',
          taxId: '98.765.432/0001-01',
          email: 'financeiro@exemplo.com.br',
          address: { street: 'Rua Funchal', number: '200', city: 'São Paulo', state: 'SP', zip: '04551-060' },
          notes: 'Cliente VIP'
      };
      saveClient(mockClient);
  }
};