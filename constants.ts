
import { Client, PaymentMethod, User, UserRole, WeeklyReport, CampaignType, Platform, Task, TaskStatus, TaskPriority, Meeting, ChatMessage, Notification, ServiceProduct, Contract, Invoice } from "./types";

export const USERS: User[] = [
  { id: 'u1', name: 'Admin User', email: 'admin@agency.com', password: '123', role: UserRole.ADMIN, avatar: 'https://i.pravatar.cc/150?img=11' },
  { id: 'u2', name: 'Carlos Gestor', email: 'carlos@agency.com', password: '123', role: UserRole.MANAGER, avatar: 'https://i.pravatar.cc/150?img=3' },
  { id: 'u3', name: 'Mariana CS', email: 'mariana@agency.com', password: '123', role: UserRole.CS, avatar: 'https://i.pravatar.cc/150?img=5' },
  { id: 'u4', name: 'Ana Financeiro', email: 'ana@agency.com', password: '123', role: UserRole.FINANCIAL, avatar: 'https://i.pravatar.cc/150?img=9' },
];

export const INITIAL_PRODUCTS: ServiceProduct[] = [
    { id: 'prod1', name: 'Gestão de Tráfego (Padrão)', description: 'Gestão mensal de Google e Meta Ads', defaultPrice: 1500.00 },
    { id: 'prod2', name: 'Gestão de Tráfego (Avançado)', description: 'Gestão omni-channel + Dashboards BI', defaultPrice: 3000.00 },
    { id: 'prod3', name: 'Consultoria de CRM', description: 'Implementação de CRM e Processos de Vendas', defaultPrice: 2000.00 },
    { id: 'prod4', name: 'Criação de Landing Page', description: 'Página de alta conversão (Pagamento Único)', defaultPrice: 1200.00 },
];

export const INITIAL_CLIENTS: Client[] = [
  {
    id: 'c1',
    name: 'Pizzaria Bella Napoli',
    niche: 'Gastronomia',
    email: 'contato@bellanapoli.com',
    phone: '(11) 99999-9999',
    
    businessSummary: 'Pizzaria tradicional italiana com foco em delivery e salão. Carro-chefe: Pizza Marguerita e Portuguesa.',
    targetAudience: 'Famílias da Zona Sul, classe B/C, idade 30-50 anos.',
    marketingStrategy: 'Focar em promoções de terça a quinta para aumentar movimento no salão. Delivery forte no fim de semana.',

    paymentMethod: PaymentMethod.CREDIT_CARD,
    fee: 1500.00,
    adBudget: 2000.00,
    platforms: [Platform.META, Platform.GOOGLE],
    startDate: '2023-06-15',
    isActive: true,
    managerId: 'u2',
    csId: 'u3'
  },
  {
    id: 'c2',
    name: 'Dr. Ricardo Dermato',
    niche: 'Saúde/Estética',
    email: 'ricardo@dermato.com',
    phone: '(11) 98888-8888',

    businessSummary: 'Clínica dermatológica focada em procedimentos estéticos não invasivos (Botox, Preenchimento).',
    targetAudience: 'Mulheres, 35-55 anos, classe A/B, interessadas em rejuvenescimento.',
    marketingStrategy: 'Campanhas de conscientização sobre cuidados com a pele e ofertas de pacotes de Botox.',

    paymentMethod: PaymentMethod.BOLETO,
    fee: 2500.00,
    adBudget: 3000.00,
    platforms: [Platform.META],
    startDate: '2023-08-01',
    isActive: true,
    managerId: 'u2',
    csId: 'u3'
  },
  {
    id: 'c3',
    name: 'Imobiliária Futuro',
    niche: 'Imóveis',
    email: 'vendas@futuro.com',
    phone: '(11) 97777-7777',

    businessSummary: 'Venda e locação de imóveis de médio padrão.',
    targetAudience: 'Casais jovens comprando primeiro imóvel e investidores.',
    marketingStrategy: 'Captar leads qualificados para corretores via Google Ads (Fundo de funil).',

    paymentMethod: PaymentMethod.PIX,
    fee: 3000.00,
    adBudget: 5000.00,
    platforms: [Platform.GOOGLE, Platform.META, Platform.LINKEDIN],
    startDate: '2023-09-10',
    isActive: true,
    managerId: 'u2',
    csId: 'u3'
  }
];

export const INITIAL_CONTRACTS: Contract[] = [
    {
        id: 'cont1',
        clientId: 'c1',
        serviceProductId: 'prod1',
        serviceName: 'Gestão de Tráfego (Padrão)',
        startDate: '2023-06-15',
        value: 1500.00,
        paymentDay: 15,
        status: 'ACTIVE'
    },
    {
        id: 'cont2',
        clientId: 'c2',
        serviceProductId: 'prod2',
        serviceName: 'Gestão de Tráfego (Avançado)',
        startDate: '2023-08-01',
        value: 2500.00,
        paymentDay: 1,
        status: 'ACTIVE'
    }
];

export const INITIAL_INVOICES: Invoice[] = [
    {
        id: 'inv1',
        contractId: 'cont1',
        clientId: 'c1',
        clientName: 'Pizzaria Bella Napoli',
        serviceName: 'Gestão de Tráfego (Padrão)',
        amount: 1500.00,
        dueDate: new Date(new Date().setDate(new Date().getDate() - 5)).toISOString().split('T')[0], // 5 dias atrasado
        status: 'OVERDUE'
    },
    {
        id: 'inv2',
        contractId: 'cont1',
        clientId: 'c1',
        clientName: 'Pizzaria Bella Napoli',
        serviceName: 'Gestão de Tráfego (Padrão)',
        amount: 1500.00,
        dueDate: new Date(new Date().setDate(new Date().getDate() - 35)).toISOString().split('T')[0], // Mês passado
        paidDate: new Date(new Date().setDate(new Date().getDate() - 35)).toISOString().split('T')[0],
        paidAmount: 1500.00,
        status: 'PAID'
    },
    {
        id: 'inv3',
        contractId: 'cont2',
        clientId: 'c2',
        clientName: 'Dr. Ricardo Dermato',
        serviceName: 'Gestão de Tráfego (Avançado)',
        amount: 2500.00,
        dueDate: new Date(new Date().setDate(new Date().getDate() + 5)).toISOString().split('T')[0], // Daqui a 5 dias
        status: 'PENDING'
    }
];

export const INITIAL_REPORTS: WeeklyReport[] = [
  // Outubro
  {
    id: 'r1',
    clientId: 'c1',
    startDate: '2023-10-01',
    endDate: '2023-10-07',
    type: CampaignType.WHATSAPP,
    // Breakdown
    channels: [
        { platform: Platform.META, spend: 300, reach: 10000, clicks: 300, leads: 30 },
        { platform: Platform.GOOGLE, spend: 200, reach: 5000, clicks: 150, leads: 15 }
    ],
    // Aggregated
    spend: 500,
    reach: 15000,
    clicks: 450,
    leads: 45,
    topCreativeLink: 'http://ads.manager/creative/123',
    managerNotes: 'Início de mês forte.',
    sales: 12,
    revenue: 1200.00,
    productsSold: '10 Pizzas G, 2 Refrigerantes',
    csNotes: 'Cliente muito satisfeito com o volume.',
    createdAt: '2023-10-08T10:00:00Z',
    updatedAt: '2023-10-08T14:00:00Z'
  },
  {
    id: 'r2',
    clientId: 'c1',
    startDate: '2023-10-08',
    endDate: '2023-10-14',
    type: CampaignType.WHATSAPP,
    channels: [
        { platform: Platform.META, spend: 520, reach: 16000, clicks: 480, leads: 50 },
    ],
    spend: 520,
    reach: 16000,
    clicks: 480,
    leads: 50,
    topCreativeLink: 'http://ads.manager/creative/124',
    managerNotes: 'Mantivemos a escala.',
    sales: 15,
    revenue: 1550.00,
    productsSold: '15 Pizzas G',
    csNotes: '',
    createdAt: '2023-10-15T10:00:00Z',
    updatedAt: '2023-10-15T10:00:00Z'
  },
  // Novembro
  {
    id: 'r3',
    clientId: 'c1',
    startDate: '2023-11-01',
    endDate: '2023-11-07',
    type: CampaignType.WHATSAPP,
    channels: [
        { platform: Platform.META, spend: 400, reach: 10000, clicks: 300, leads: 40 },
        { platform: Platform.GOOGLE, spend: 200, reach: 8000, clicks: 200, leads: 20 }
    ],
    spend: 600,
    reach: 18000,
    clicks: 500,
    leads: 60,
    topCreativeLink: 'http://ads.manager/creative/125',
    managerNotes: 'Promoção de Black Friday antecipada.',
    sales: 20,
    revenue: 2000.00,
    productsSold: '20 Pizzas GG',
    csNotes: 'Aumento significativo na demanda.',
    createdAt: '2023-11-08T10:00:00Z',
    updatedAt: '2023-11-08T10:00:00Z'
  },
  {
    id: 'r4',
    clientId: 'c3', // Imobiliaria
    startDate: new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    type: CampaignType.SITE,
    channels: [
        { platform: Platform.GOOGLE, spend: 3000, reach: 2000, clicks: 50, leads: 5 },
        { platform: Platform.LINKEDIN, spend: 1200, reach: 3000, clicks: 50, leads: 5 }
    ],
    spend: 4200, 
    reach: 5000,
    clicks: 100,
    leads: 10,
    topCreativeLink: '',
    managerNotes: '',
    sales: 0,
    revenue: 0,
    productsSold: '',
    csNotes: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const INITIAL_TASKS: Task[] = [
  {
    id: 't1',
    title: 'Subir novos criativos de Natal',
    description: 'Cliente enviou as fotos no drive. Precisa editar e subir.',
    clientId: 'c1',
    assigneeId: 'u2', // Carlos Gestor
    creatorId: 'u3', // Mariana CS
    status: TaskStatus.TODO,
    priority: TaskPriority.HIGH,
    dueDate: '2023-12-10',
    createdAt: new Date().toISOString()
  },
  {
    id: 't2',
    title: 'Reunião de Alinhamento Mensal',
    description: 'Apresentar resultados e definir metas para janeiro.',
    clientId: 'c2',
    assigneeId: 'u3', // Mariana CS
    creatorId: 'u3',
    status: TaskStatus.IN_PROGRESS,
    priority: TaskPriority.MEDIUM,
    dueDate: '2023-12-15',
    createdAt: new Date().toISOString()
  }
];

export const INITIAL_MEETINGS: Meeting[] = [
  {
    id: 'm1',
    clientId: 'c1',
    title: 'Fechamento Novembro',
    date: new Date().toISOString().split('T')[0], // Hoje
    time: '14:00',
    type: 'Mensal',
    notes: 'Definimos que o foco será Black Friday. Meta de 50 leads.',
    actionItems: ['Criar campanha Black Friday', 'Ajustar orçamento'],
    organizerId: 'u3',
    attendees: [
        { userId: 'u2', status: 'pending' },
        { userId: 'u3', status: 'confirmed' }
    ]
  }
];

export const INITIAL_CHAT: ChatMessage[] = [
  {
    id: 'msg1',
    userId: 'u1',
    message: 'Bom dia equipe! Vamos focar nos clientes com saldo baixo hoje.',
    timestamp: new Date(new Date().setHours(9, 0)).toISOString(),
    recipientId: 'ALL'
  },
  {
    id: 'msg2',
    userId: 'u2',
    message: 'Certo! Já estou verificando a Imobiliária Futuro.',
    timestamp: new Date(new Date().setHours(9, 5)).toISOString(),
    recipientId: 'ALL'
  }
];

export const INITIAL_NOTIFICATIONS: Notification[] = [
    {
        id: 'n1',
        userId: 'u2',
        type: 'INVITE',
        title: 'Convite de Reunião',
        message: 'Mariana CS te convidou para: Fechamento Novembro',
        relatedId: 'm1',
        read: false,
        createdAt: new Date().toISOString()
    }
]

export const FORMATTER = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});