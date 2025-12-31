

export enum UserRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER', // Gestor de Tráfego
  CS = 'CS', // Customer Success
  FINANCIAL = 'FINANCIAL', // Financeiro
  SDR = 'SDR' // Sales Development Representative
}

export enum PaymentMethod {
  BOLETO = 'Boleto',
  CREDIT_CARD = 'Cartão de Crédito',
  PIX = 'PIX',
  OTHER = 'Outros'
}

export enum CampaignType {
  WHATSAPP = 'Conversão WhatsApp',
  FORM = 'Conversão Formulário',
  SITE = 'Conversão Site',
  BRANDING = 'Branding'
}

export enum Platform {
  GOOGLE = 'Google Ads',
  META = 'Meta Ads (Facebook/Instagram)',
  TIKTOK = 'TikTok Ads',
  LINKEDIN = 'LinkedIn Ads',
  OTHER = 'Outros'
}

export interface Client {
  id: string;
  name: string;
  niche: string;
  
  // Contact Info
  email?: string;
  phone?: string;
  
  // Strategic Info (New)
  businessSummary?: string; // O que a empresa faz/vende
  targetAudience?: string; // Publico Alvo
  marketingStrategy?: string; // Estratégia atual
  
  // Contract Info (Legacy - kept for compatibility, but prefer Contracts array now)
  paymentMethod: PaymentMethod;
  fee: number; // Valor pago pelo serviço (Agência)
  adBudget: number; // Valor investido em mídia (Google/Meta)
  platforms: Platform[];
  
  // Dates
  startDate: string;
  endDate?: string; // Data de saída (se houver)
  
  isActive: boolean;
  
  // Team Assignment
  managerId: string; // ID of the Traffic Manager responsible
  csId: string;      // ID of the Customer Success responsible
}

// Helper interface for Client form
export type ClientForm = Partial<Client> & {
  platforms: Platform[]; // Ensure platforms is always an array for the form
  paymentMethod: PaymentMethod; // Ensure paymentMethod is always set
  fee: number;
  adBudget: number;
  startDate: string;
  managerId: string;
  csId: string;
  isActive: boolean;
};

// --- FINANCE MODULE ENTITIES ---

export interface ServiceProduct {
    id: string;
    name: string; // Ex: "Gestão de Tráfego", "Web Design"
    description: string;
    defaultPrice: number;
}

export interface Contract {
    id: string;
    clientId: string;
    serviceProductId: string; // Link to ServiceProduct
    serviceName: string; // Cached name for display
    startDate: string;
    endDate?: string; // If null, it's ongoing
    value: number;
    paymentDay: number; // Day of month for invoice
    status: 'ACTIVE' | 'CANCELLED' | 'COMPLETED';
}

export interface Invoice {
    id: string;
    contractId: string;
    clientId: string;
    clientName: string;
    serviceName: string;
    amount: number; // Valor Original
    dueDate: string; // YYYY-MM-DD
    paidDate?: string; // YYYY-MM-DD
    paidAmount?: number; // Valor Pago (com juros/multa)
    status: 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED';
    notes?: string;
}

// -------------------------------

export interface ChannelResult {
    platform: Platform;
    spend: number;
    reach: number;
    clicks: number;
    leads: number;
}

export interface WeeklyReport {
  id: string;
  clientId: string;
  
  // Date Range
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  
  type: CampaignType;
  
  // Manager Inputs (Breakdown by Platform)
  channels: ChannelResult[];

  // Aggregated Totals (Calculated automatically)
  spend: number;
  reach: number;
  clicks: number;
  leads: number;
  
  topCreativeLink: string;
  managerNotes: string;
  
  // CS Inputs
  sales: number; // Quantity
  revenue: number; // Total Value (Faturamento)
  productsSold: string; // Description of what was sold
  csNotes: string; // Relationship feedback
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  updatedBy?: string; // User ID who last updated
}

// Helper interface for Report form
export type ReportForm = Partial<WeeklyReport> & {
  startDate: string;
  endDate: string;
  type: CampaignType;
  channels: ChannelResult[];
  topCreativeLink: string;
  managerNotes: string;
  sales: number;
  revenue: number;
  productsSold: string;
  csNotes: string;
};


export interface User {
  id: string;
  name: string;
  email: string; // Used for login
  password?: string; // In a real app, this would be hashed
  role: UserRole;
  avatar: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string; // "LOGIN", "CREATE_CLIENT", "UPDATE_REPORT"
  details: string;
  timestamp: string;
}

// --- NEW ENTITIES FOR WORKFLOW ---

export enum TaskStatus {
  BACKLOG = 'Backlog',
  TODO = 'A Fazer',
  IN_PROGRESS = 'Em Andamento',
  DONE = 'Concluído'
}

export enum TaskPriority {
  LOW = 'Baixa',
  MEDIUM = 'Média',
  HIGH = 'Alta'
}

export interface Task {
  id: string;
  title: string;
  description: string;
  clientId?: string; // Optional, task might not be linked to a client
  assigneeId: string; // Who needs to do it
  creatorId: string; // Who asked for it
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  createdAt: string;
}

export interface MeetingAttendee {
    userId: string;
    status: 'pending' | 'confirmed' | 'declined';
}

export interface Meeting {
  id: string;
  clientId: string;
  title: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  type: 'Semanal' | 'Mensal' | 'Onboarding' | 'Emergência';
  notes: string; // Ata da reunião
  actionItems: string[]; // Simple list of todos generated
  organizerId: string;
  attendees: MeetingAttendee[]; // List of invited users
}

export interface ChatMessage {
  id: string;
  userId: string;
  message: string;
  timestamp: string;
  recipientId?: string; // 'ALL' or specific userId for Private Messages
}

export interface Notification {
    id: string;
    userId: string; // Who receives it
    type: 'INVITE' | 'TASK' | 'SYSTEM' | 'CHAT' | 'FINANCE';
    title: string;
    message: string;
    relatedId?: string; // ID of meeting or task
    read: boolean;
    createdAt: string;
}

// Computed stats for UI
export interface ReportStats {
  cpl: number; // Cost per lead
  ctr: number; // Click through rate (clicks / reach / 100)
  roas: number; // Revenue / Spend
}