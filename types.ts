export enum InvoiceStatus {
  DRAFT = 'Rascunho',
  ISSUED = 'Emitida',
  PAID = 'Paga',
  CANCELLED = 'Cancelada'
}

export interface Address {
  street: string;
  number: string;
  city: string;
  state: string;
  zip: string;
}

export interface Entity {
  name: string;
  taxId: string; // CPF or CNPJ
  email: string;
  address: Address;
}

export type TaxRegime = 'simples' | 'presumido' | 'real';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string; // Stored simply for this demo
  plan?: PlanTier;
  taxRegime?: TaxRegime;
}

export type PlanTier = 'basico' | 'standard' | 'premium' | 'diamante';

export interface Accountant {
  id: string;
  name: string;
  role: string;
  photoUrl?: string;
  whatsapp: string;
  email: string;
  status: 'online' | 'offline' | 'busy';
}

export interface AccountingDocument {
  id: string;
  title: string;
  type: 'tax' | 'report' | 'contract' | 'upload'; // tax=imposto a pagar, upload=enviado pelo cliente
  date: string; // Due date for taxes
  status: 'pending' | 'paid' | 'received' | 'processed';
  amount?: number;
  downloadUrl?: string;
  competence?: string; // YYYY-MM
}

export interface ChatMessage {
  id: string;
  senderId: string; // 'user' or 'accountant'
  text: string;
  timestamp: string;
  isRead: boolean;
}

export interface Client extends Entity {
  id: string;
  userId: string;
  phone?: string;
  notes?: string;
}

export interface Partner extends Entity {
  id: string;
  userId: string;
  role: string; // e.g., 'Sócio Administrador'
  sharePercentage?: number;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface Invoice {
  id: string;
  userId: string; // Link to the user who created it
  number: string;
  date: string;
  dueDate: string;
  status: InvoiceStatus;
  issuer: Entity;
  client: Entity;
  items: InvoiceItem[];
  notes?: string;
  taxRate: number; // Percentage
}

export type ViewState = 
  | 'dashboard' 
  | 'create_invoice' 
  | 'invoice_details' 
  | 'clients' 
  | 'create_client' 
  | 'edit_client'
  | 'billing'        
  | 'taxes'          
  | 'transactions'   
  | 'partners'       
  | 'pro_labore'     
  | 'payroll'        
  | 'subscription'
  | 'documents'      // Novo: Central de Documentos
  | 'support';       // Novo: Fale com o Contador