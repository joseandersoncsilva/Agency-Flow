
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  FileBarChart, 
  LogOut, 
  Plus, 
  Save, 
  Edit2, 
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Info,
  Calendar,
  DollarSign,
  ShoppingBag,
  ImageIcon,
  Filter,
  Trash2,
  Power,
  ShieldAlert,
  Phone,
  Mail,
  Globe,
  CreditCard,
  Lock,
  AlertTriangle,
  PieChart,
  Wallet,
  CheckSquare,
  MessageSquare,
  Clock,
  MoreHorizontal,
  Send,
  GripVertical,
  ExternalLink,
  Bell,
  Check,
  X,
  UserPlus,
  Layers,
  ArrowRight,
  AtSign,
  Package,
  TrendingUp,
  Landmark,
  Compass,
  History,
  Copy,
  ListTodo
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart as RePieChart, Pie, Cell } from 'recharts';

import { Client, WeeklyReport, UserRole, User, CampaignType, PaymentMethod, Platform, AuditLog, Task, Meeting, ChatMessage, TaskStatus, TaskPriority, Notification, ChannelResult, ServiceProduct, Contract, Invoice } from './types';
import { USERS, FORMATTER } from './constants';
import { db } from './services/mockDb';
import { WhatsAppCard } from './components/WhatsAppCard';

// --- Styles for Navigation ---
const navItemClass = (isActive: boolean) => 
  `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 cursor-pointer ${
    isActive 
      ? 'bg-emerald-600 text-white shadow-md' 
      : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
  }`;

// --- Sub-Components ---

interface TaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void;
    onDelete?: () => void;
    form: Partial<Task>;
    setForm: (f: Partial<Task>) => void;
    clients: Client[];
    users: User[];
}

const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, onSave, onDelete, form, setForm, clients, users }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h2 className="text-xl font-bold text-slate-800">{form.id ? 'Editar Tarefa' : 'Nova Tarefa'}</h2>
                    <button onClick={onClose}><X className="w-5 h-5 text-slate-500" /></button>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Título</label>
                        <input type="text" className="w-full p-2 border rounded" value={form.title || ''} onChange={e => setForm({...form, title: e.target.value})} placeholder="Ex: Criar novos banners..." />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Descrição</label>
                        <textarea rows={3} className="w-full p-2 border rounded resize-none" value={form.description || ''} onChange={e => setForm({...form, description: e.target.value})} />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                         <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Responsável</label>
                            <select className="w-full p-2 border rounded" value={form.assigneeId || ''} onChange={e => setForm({...form, assigneeId: e.target.value})}>
                                <option value="">Selecione...</option>
                                {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                            </select>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Cliente (Opcional)</label>
                            <select className="w-full p-2 border rounded" value={form.clientId || ''} onChange={e => setForm({...form, clientId: e.target.value})}>
                                <option value="">Nenhum</option>
                                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                         <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Prioridade</label>
                            <select className="w-full p-2 border rounded" value={form.priority || TaskPriority.MEDIUM} onChange={e => setForm({...form, priority: e.target.value as TaskPriority})}>
                                {Object.values(TaskPriority).map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Data de Entrega</label>
                            <input type="date" className="w-full p-2 border rounded" value={form.dueDate ? form.dueDate.split('T')[0] : ''} onChange={e => setForm({...form, dueDate: e.target.value})} />
                        </div>
                    </div>
                </div>
                <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-between gap-3">
                     {form.id && onDelete ? (
                        <button onClick={onDelete} className="px-4 py-2 text-red-600 hover:bg-red-50 border border-red-200 rounded-lg transition-colors font-medium flex items-center gap-2">
                            <Trash2 className="w-4 h-4" /> Excluir
                        </button>
                    ) : <div></div>}
                    <div className="flex gap-3">
                        <button onClick={onClose} className="px-6 py-2 text-slate-600 hover:bg-slate-200 rounded-lg transition-colors font-medium">Cancelar</button>
                        <button onClick={onSave} className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium">Salvar</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

interface ReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void;
    form: Partial<WeeklyReport>;
    setForm: (f: Partial<WeeklyReport>) => void;
    clients: Client[];
    currentUser: User;
    isNew: boolean;
}

const ReportModal: React.FC<ReportModalProps> = ({ isOpen, onClose, onSave, form, setForm, clients, currentUser, isNew }) => {
    if (!isOpen) return null;

    const isManager = currentUser.role === UserRole.MANAGER || currentUser.role === UserRole.ADMIN;
    const isCS = currentUser.role === UserRole.CS || currentUser.role === UserRole.ADMIN;

    const getDaysDiff = () => {
        if (!form.startDate || !form.endDate) return 0;
        const start = new Date(form.startDate);
        const end = new Date(form.endDate);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
        return diffDays + 1;
    };

    const daysCount = getDaysDiff();
    const selectedClient = clients.find(c => c.id === form.clientId);

    // Initial load of channels logic
    useEffect(() => {
        // If it's new and client is selected, populate channels from client platforms
        if (isNew && selectedClient && (!form.channels || form.channels.length === 0)) {
            const initialChannels: ChannelResult[] = selectedClient.platforms.map(p => ({
                platform: p,
                spend: 0,
                reach: 0,
                clicks: 0,
                leads: 0
            }));
            setForm({ ...form, channels: initialChannels });
        }
    }, [selectedClient, isNew]);

    const handleChannelChange = (index: number, field: keyof ChannelResult, value: number) => {
        if (!form.channels) return;
        const newChannels = [...form.channels];
        newChannels[index] = { ...newChannels[index], [field]: value };
        
        // Auto-calc totals
        const totalSpend = newChannels.reduce((sum, ch) => sum + (ch.spend || 0), 0);
        const totalReach = newChannels.reduce((sum, ch) => sum + (ch.reach || 0), 0);
        const totalClicks = newChannels.reduce((sum, ch) => sum + (ch.clicks || 0), 0);
        const totalLeads = newChannels.reduce((sum, ch) => sum + (ch.leads || 0), 0);

        setForm({ 
            ...form, 
            channels: newChannels,
            spend: totalSpend,
            reach: totalReach,
            clicks: totalClicks,
            leads: totalLeads
        });
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">
                            {isNew ? 'Novo Relatório Semanal' : 'Editar Relatório'}
                        </h2>
                        <p className="text-sm text-slate-500">Preencha os dados da semana</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>
                
                <div className="p-8 overflow-y-auto flex-1 space-y-8">
                    {/* Header Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Cliente</label>
                            <select 
                                className="w-full p-3 border border-slate-200 rounded-lg bg-slate-50 focus:ring-2 focus:ring-emerald-500 outline-none"
                                value={form.clientId}
                                onChange={e => setForm({...form, clientId: e.target.value})}
                                disabled={!isNew}
                            >
                                <option value="">Selecione o cliente...</option>
                                {clients.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                             <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Data Início</label>
                                <input 
                                    type="date" 
                                    className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                                    value={form.startDate || ''}
                                    onChange={e => setForm({...form, startDate: e.target.value})}
                                    disabled={!isManager}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Data Fim</label>
                                <input 
                                    type="date" 
                                    className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                                    value={form.endDate || ''}
                                    onChange={e => setForm({...form, endDate: e.target.value})}
                                    disabled={!isManager}
                                />
                            </div>
                        </div>
                    </div>

                    {daysCount > 0 && (
                        <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-md text-sm font-medium border border-blue-100">
                            Período selecionado: {daysCount} dias
                        </div>
                    )}

                    <div className="h-px bg-slate-100 w-full my-4"></div>

                    {/* Technical Metrics (Manager) */}
                    <div className={`space-y-6 ${!isManager ? 'opacity-50 pointer-events-none' : ''}`}>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="bg-emerald-100 p-2 rounded-lg">
                                <FileBarChart className="w-5 h-5 text-emerald-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-800">Métricas de Tráfego</h3>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Objetivo da Campanha</label>
                            <select 
                                className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                                value={form.type}
                                onChange={e => setForm({...form, type: e.target.value as CampaignType})}
                            >
                                {Object.values(CampaignType).map(t => (
                                    <option key={t} value={t}>{t}</option>
                                ))}
                            </select>
                        </div>

                        {/* Multi-Channel Inputs */}
                        <div className="space-y-4">
                            <label className="block text-sm font-medium text-slate-700">Detalhamento por Plataforma</label>
                            {form.channels && form.channels.length > 0 ? (
                                form.channels.map((channel, idx) => (
                                    <div key={idx} className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                                        <div className="flex items-center gap-2 mb-3 border-b border-slate-200 pb-2">
                                            <Layers className="w-4 h-4 text-slate-500" />
                                            <span className="font-bold text-slate-700">{channel.platform}</span>
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            <div>
                                                <label className="text-xs text-slate-500 block mb-1">Valor Gasto (R$)</label>
                                                <input 
                                                    type="number" 
                                                    className="w-full p-2 border border-slate-200 rounded text-sm"
                                                    value={channel.spend || 0}
                                                    onChange={e => handleChannelChange(idx, 'spend', Number(e.target.value))}
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs text-slate-500 block mb-1">Alcance</label>
                                                <input 
                                                    type="number" 
                                                    className="w-full p-2 border border-slate-200 rounded text-sm"
                                                    value={channel.reach || 0}
                                                    onChange={e => handleChannelChange(idx, 'reach', Number(e.target.value))}
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs text-slate-500 block mb-1">Cliques</label>
                                                <input 
                                                    type="number" 
                                                    className="w-full p-2 border border-slate-200 rounded text-sm"
                                                    value={channel.clicks || 0}
                                                    onChange={e => handleChannelChange(idx, 'clicks', Number(e.target.value))}
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs text-slate-500 block mb-1">Leads</label>
                                                <input 
                                                    type="number" 
                                                    className="w-full p-2 border border-slate-200 rounded text-sm font-bold text-emerald-600 bg-emerald-50"
                                                    value={channel.leads || 0}
                                                    onChange={e => handleChannelChange(idx, 'leads', Number(e.target.value))}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-sm text-slate-500 italic">Nenhuma plataforma configurada para este cliente.</div>
                            )}
                        </div>
                        
                        {/* Totals Display (Read Only) */}
                        <div className="bg-slate-800 text-white p-4 rounded-lg grid grid-cols-4 gap-4 text-center">
                            <div>
                                <span className="text-xs text-slate-400 block">Total Gasto</span>
                                <span className="font-bold">{FORMATTER.format(form.spend || 0)}</span>
                            </div>
                            <div>
                                <span className="text-xs text-slate-400 block">Total Leads</span>
                                <span className="font-bold text-emerald-400">{form.leads || 0}</span>
                            </div>
                            <div>
                                <span className="text-xs text-slate-400 block">CPL Geral</span>
                                <span className="font-bold text-yellow-400">{FORMATTER.format((form.leads || 0) > 0 ? (form.spend || 0) / (form.leads || 0) : 0)}</span>
                            </div>
                             <div>
                                <span className="text-xs text-slate-400 block">Total Cliques</span>
                                <span className="font-bold">{form.clicks || 0}</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Link do Criativo Campeão</label>
                                <input 
                                    type="text" 
                                    placeholder="https://..."
                                    className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                                    value={form.topCreativeLink || ''}
                                    onChange={e => setForm({...form, topCreativeLink: e.target.value})}
                                />
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Observações Técnicas (Gestor)</label>
                                <textarea 
                                    rows={3}
                                    className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
                                    value={form.managerNotes || ''}
                                    onChange={e => setForm({...form, managerNotes: e.target.value})}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="h-px bg-slate-100 w-full my-4"></div>

                    {/* Sales Metrics (CS) */}
                    <div className={`space-y-6 ${!isCS ? 'opacity-50 pointer-events-none' : ''}`}>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="bg-blue-100 p-2 rounded-lg">
                                <Users className="w-5 h-5 text-blue-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-800">Comercial & Relacionamento</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Qtd. Vendas</label>
                                <input 
                                    type="number" 
                                    className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={form.sales || 0}
                                    onChange={e => setForm({...form, sales: Number(e.target.value)})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Faturamento Total (R$)</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-3 text-slate-400">R$</span>
                                    <input 
                                        type="number" 
                                        className="w-full p-3 pl-10 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-800"
                                        value={form.revenue || 0}
                                        onChange={e => setForm({...form, revenue: Number(e.target.value)})}
                                    />
                                </div>
                            </div>
                        </div>
                        
                         <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Produtos/Serviços Vendidos</label>
                            <textarea 
                                rows={2}
                                placeholder="Ex: 3x Botox, 1x Limpeza de Pele..."
                                className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                                value={form.productsSold || ''}
                                onChange={e => setForm({...form, productsSold: e.target.value})}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Feedback do Cliente (CS)</label>
                            <textarea 
                                rows={3}
                                className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                                value={form.csNotes || ''}
                                onChange={e => setForm({...form, csNotes: e.target.value})}
                            />
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                    <button onClick={onClose} className="px-6 py-2 text-slate-600 hover:bg-slate-200 rounded-lg transition-colors font-medium">
                        Cancelar
                    </button>
                    <button onClick={onSave} className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-lg shadow-emerald-600/20 transition-all font-medium flex items-center gap-2">
                        <Save className="w-4 h-4" />
                        Salvar Relatório
                    </button>
                </div>
            </div>
        </div>
    );
};

interface ClientModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void;
    form: Partial<Client>;
    setForm: (f: Partial<Client>) => void;
    managers: User[];
    css: User[];
    isNew: boolean;
    products: ServiceProduct[];
    contracts: Contract[];
    meetings: Meeting[]; // Added meetings prop
    onAddContract: (c: Contract) => void;
    onDeleteContract: (id: string) => void;
}

const ClientModal: React.FC<ClientModalProps> = ({ isOpen, onClose, onSave, form, setForm, managers, css, isNew, products, contracts, meetings, onAddContract, onDeleteContract }) => {
    if (!isOpen) return null;
    const [activeTab, setActiveTab] = useState<'general' | 'contract' | 'team' | 'strategy' | 'history'>('general');
    const [newContractForm, setNewContractForm] = useState<Partial<Contract>>({});

    const handlePlatformToggle = (p: Platform) => {
        const current = form.platforms || [];
        if (current.includes(p)) {
            setForm({ ...form, platforms: current.filter(x => x !== p) });
        } else {
            setForm({ ...form, platforms: [...current, p] });
        }
    };

    const handleAddNewContract = () => {
        if (!newContractForm.serviceProductId || !newContractForm.value) return;
        
        const product = products.find(p => p.id === newContractForm.serviceProductId);
        
        const contract: Contract = {
            id: Math.random().toString(36).substr(2, 9),
            clientId: form.id || '',
            serviceProductId: newContractForm.serviceProductId,
            serviceName: product?.name || '',
            startDate: newContractForm.startDate || new Date().toISOString().split('T')[0],
            value: Number(newContractForm.value),
            paymentDay: Number(newContractForm.paymentDay) || 10,
            status: 'ACTIVE'
        };
        onAddContract(contract);
        setNewContractForm({}); // Reset
    }

    const clientMeetings = meetings.filter(m => m.clientId === form.id).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const handleCopyMeetingSummary = (m: Meeting) => {
        const text = `
📄 *ATA DE REUNIÃO - ${form.name}*
📅 Data: ${new Date(m.date).toLocaleDateString()} | ⏰ ${m.time}

📌 *Pauta & Notas:*
${m.notes || 'Sem notas registradas.'}

🚀 *Próximos Passos / Ações:*
${m.actionItems && m.actionItems.length > 0 ? m.actionItems.map(i => `• ${i}`).join('\n') : '• Nenhuma ação definida.'}

👥 *Participantes:*
${m.attendees.map(a => USERS.find(u => u.id === a.userId)?.name).join(', ')}
`;
        navigator.clipboard.writeText(text);
        alert('Resumo copiado! Pronto para colar no WhatsApp.');
    }

    return (
         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
                 <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h2 className="text-xl font-bold text-slate-800">{isNew ? 'Novo Cliente' : 'Editar Cliente'}</h2>
                    <button onClick={onClose}><X className="w-5 h-5 text-slate-500" /></button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-slate-200 px-6 overflow-x-auto">
                    <button onClick={() => setActiveTab('general')} className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'general' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-slate-500'}`}>Dados Gerais</button>
                    <button onClick={() => setActiveTab('contract')} className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'contract' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-slate-500'}`}>Contrato</button>
                    <button onClick={() => setActiveTab('team')} className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'team' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-slate-500'}`}>Equipe</button>
                    <button onClick={() => setActiveTab('strategy')} className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'strategy' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-slate-500'}`}>Estratégia</button>
                    <button onClick={() => setActiveTab('history')} className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'history' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-slate-500'}`}>Histórico</button>
                </div>

                <div className="p-8 overflow-y-auto flex-1 space-y-6">
                    
                    {activeTab === 'general' && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Nome da Empresa</label>
                                <input type="text" className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" value={form.name || ''} onChange={e => setForm({...form, name: e.target.value})} />
                            </div>
                             <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Email de Contato</label>
                                    <input type="email" className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" value={form.email || ''} onChange={e => setForm({...form, email: e.target.value})} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Telefone/WhatsApp</label>
                                    <input type="text" className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" value={form.phone || ''} onChange={e => setForm({...form, phone: e.target.value})} />
                                </div>
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Nicho de Atuação</label>
                                <input type="text" className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" value={form.niche || ''} onChange={e => setForm({...form, niche: e.target.value})} />
                            </div>
                        </>
                    )}

                    {activeTab === 'strategy' && (
                        <div className="space-y-6">
                            <div className="bg-purple-50 p-4 rounded-lg border border-purple-100 flex gap-3 items-start">
                                <Compass className="w-6 h-6 text-purple-600 mt-1" />
                                <div>
                                    <h3 className="font-bold text-purple-800">DNA & Estratégia</h3>
                                    <p className="text-sm text-purple-600">Registre aqui informações cruciais para o alinhamento de expectativas.</p>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Resumo do Negócio (O que vendem?)</label>
                                <textarea rows={2} className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none resize-none" value={form.businessSummary || ''} onChange={e => setForm({...form, businessSummary: e.target.value})} placeholder="Ex: E-commerce de moda feminina focado em peças de linho..." />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Público-Alvo (Quem compra?)</label>
                                <textarea rows={2} className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none resize-none" value={form.targetAudience || ''} onChange={e => setForm({...form, targetAudience: e.target.value})} placeholder="Ex: Mulheres, 25-45 anos, classe A/B, região Sul..." />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Estratégia Atual & Roadmap</label>
                                <textarea rows={4} className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none resize-none" value={form.marketingStrategy || ''} onChange={e => setForm({...form, marketingStrategy: e.target.value})} placeholder="Ex: Focar em branding no Q1 para aumentar base de leads. Q2 foco total em conversão..." />
                            </div>
                        </div>
                    )}

                    {activeTab === 'history' && (
                         <div className="space-y-6">
                             <div className="flex justify-between items-center">
                                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                    <History className="w-5 h-5 text-slate-500" /> Histórico de Reuniões
                                </h3>
                             </div>

                             <div className="relative border-l-2 border-slate-200 ml-3 space-y-8">
                                 {clientMeetings.length === 0 && (
                                     <p className="text-sm text-slate-500 ml-6 italic">Nenhuma reunião registrada.</p>
                                 )}
                                 {clientMeetings.map(m => (
                                     <div key={m.id} className="ml-6 relative">
                                         <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white"></div>
                                         <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 hover:shadow-md transition-shadow">
                                             <div className="flex justify-between items-start mb-2">
                                                 <div>
                                                     <h4 className="font-bold text-slate-800">{m.title}</h4>
                                                     <p className="text-xs text-slate-500">{new Date(m.date).toLocaleDateString()} às {m.time} • {m.type}</p>
                                                 </div>
                                                 <button 
                                                    onClick={() => handleCopyMeetingSummary(m)}
                                                    className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-full transition-colors border border-emerald-200"
                                                 >
                                                     <Copy className="w-3 h-3" /> Copiar Ata
                                                 </button>
                                             </div>
                                             <p className="text-sm text-slate-600 mb-3 whitespace-pre-wrap">{m.notes}</p>
                                             
                                             {m.actionItems && m.actionItems.length > 0 && (
                                                 <div className="bg-white p-3 rounded border border-slate-200 shadow-sm mt-3">
                                                     <p className="text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-2">
                                                         <ListTodo className="w-3 h-3" /> Próximos Passos
                                                     </p>
                                                     <ul className="text-sm space-y-2">
                                                         {m.actionItems.map((item, idx) => (
                                                             <li key={idx} className="flex items-center gap-2">
                                                                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0"></div>
                                                                 <span className="text-slate-700">{item}</span>
                                                             </li>
                                                         ))}
                                                     </ul>
                                                 </div>
                                             )}
                                         </div>
                                     </div>
                                 ))}
                             </div>
                         </div>
                    )}

                    {activeTab === 'contract' && (
                         <div className="space-y-6">
                            {/* Basic Info */}
                            <div className="grid grid-cols-2 gap-4">
                                 <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Verba Mídia/Mês (R$)</label>
                                    <input type="number" className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" value={form.adBudget || 0} onChange={e => setForm({...form, adBudget: Number(e.target.value)})} />
                                </div>
                                 <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Método de Pagamento (Anúncios)</label>
                                    <select className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" value={form.paymentMethod} onChange={e => setForm({...form, paymentMethod: e.target.value as PaymentMethod})}>
                                        {Object.values(PaymentMethod).map(m => <option key={m} value={m}>{m}</option>)}
                                    </select>
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Plataformas de Anúncio</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {Object.values(Platform).map(p => (
                                        <label key={p} className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-slate-50">
                                            <input 
                                                type="checkbox" 
                                                checked={form.platforms?.includes(p)}
                                                onChange={() => handlePlatformToggle(p)}
                                                className="rounded text-emerald-600 focus:ring-emerald-500"
                                            />
                                            <span className="text-sm">{p}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                             <div className="h-px bg-slate-200 w-full my-4"></div>

                            {/* Contract List */}
                            <div>
                                <h3 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
                                    <Package className="w-5 h-5 text-purple-600" /> Produtos Contratados
                                </h3>
                                
                                <div className="space-y-3 mb-4">
                                    {contracts.map(c => (
                                        <div key={c.id} className="flex justify-between items-center p-3 border border-slate-200 rounded-lg bg-slate-50">
                                            <div>
                                                <p className="font-bold text-slate-700">{c.serviceName}</p>
                                                <p className="text-xs text-slate-500">Início: {new Date(c.startDate).toLocaleDateString()} • Venc. dia {c.paymentDay}</p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="font-mono font-bold text-slate-600">{FORMATTER.format(c.value)}</span>
                                                <button onClick={() => onDeleteContract(c.id)} className="text-red-400 hover:text-red-600 p-1"><Trash2 className="w-4 h-4"/></button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Add New Contract Form */}
                                <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                                    <h4 className="text-sm font-bold text-purple-700 mb-3">Adicionar Novo Produto</h4>
                                    <div className="grid grid-cols-2 gap-3 mb-3">
                                        <select 
                                            className="p-2 border rounded text-sm"
                                            value={newContractForm.serviceProductId || ''}
                                            onChange={e => {
                                                const prod = products.find(p => p.id === e.target.value);
                                                setNewContractForm({
                                                    ...newContractForm, 
                                                    serviceProductId: e.target.value,
                                                    value: prod ? prod.defaultPrice : 0
                                                })
                                            }}
                                        >
                                            <option value="">Selecione o Serviço...</option>
                                            {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                        </select>
                                        <input 
                                            type="number" 
                                            placeholder="Valor Mensal" 
                                            className="p-2 border rounded text-sm"
                                            value={newContractForm.value || ''}
                                            onChange={e => setNewContractForm({...newContractForm, value: Number(e.target.value)})}
                                        />
                                        <input 
                                            type="date" 
                                            className="p-2 border rounded text-sm"
                                            value={newContractForm.startDate || ''}
                                            onChange={e => setNewContractForm({...newContractForm, startDate: e.target.value})}
                                        />
                                        <input 
                                            type="number" 
                                            placeholder="Dia Vencimento (Ex: 10)" 
                                            className="p-2 border rounded text-sm"
                                            value={newContractForm.paymentDay || ''}
                                            onChange={e => setNewContractForm({...newContractForm, paymentDay: Number(e.target.value)})}
                                        />
                                    </div>
                                    <button 
                                        onClick={handleAddNewContract}
                                        disabled={!newContractForm.serviceProductId}
                                        className="w-full py-2 bg-purple-600 text-white rounded text-sm font-bold hover:bg-purple-700 disabled:opacity-50"
                                    >
                                        + Adicionar Contrato
                                    </button>
                                </div>
                            </div>
                         </div>
                    )}

                    {activeTab === 'team' && (
                        <>
                             <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Gestor de Tráfego Responsável</label>
                                <select className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" value={form.managerId || ''} onChange={e => setForm({...form, managerId: e.target.value})}>
                                    <option value="">Selecione...</option>
                                    {managers.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                                </select>
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Customer Success (CS) Responsável</label>
                                <select className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" value={form.csId || ''} onChange={e => setForm({...form, csId: e.target.value})}>
                                    <option value="">Selecione...</option>
                                    {css.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                                </select>
                            </div>
                             <div className="mt-4">
                                <label className="block text-sm font-medium text-slate-700 mb-2">Status do Cliente</label>
                                <select className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" value={form.isActive ? 'active' : 'inactive'} onChange={e => setForm({...form, isActive: e.target.value === 'active'})}>
                                    <option value="active">Ativo</option>
                                    <option value="inactive">Inativo</option>
                                </select>
                            </div>
                        </>
                    )}

                </div>

                 <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                    <button onClick={onClose} className="px-6 py-2 text-slate-600 hover:bg-slate-200 rounded-lg transition-colors font-medium">Cancelar</button>
                    <button onClick={onSave} className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-lg shadow-emerald-600/20 transition-all font-medium">Salvar Cliente</button>
                </div>
            </div>
         </div>
    )
}

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onPay: (amount: number, date: string) => void;
    invoice: Invoice;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, onPay, invoice }) => {
    if(!isOpen) return null;

    const [paidDate, setPaidDate] = useState(new Date().toISOString().split('T')[0]);
    const [finalAmount, setFinalAmount] = useState(invoice.amount);
    
    // Calculate suggested interest
    const calculateSuggested = () => {
        const due = new Date(invoice.dueDate);
        const paid = new Date(paidDate);
        const diffTime = paid.getTime() - due.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays > 0) {
            // Rule: 2% Fine + 0.033% per day (approx 1% mo)
            const fine = invoice.amount * 0.02;
            const interest = invoice.amount * (0.00033 * diffDays);
            return invoice.amount + fine + interest;
        }
        return invoice.amount;
    }

    const suggested = calculateSuggested();

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                <div className="p-6 border-b border-slate-100 bg-slate-50">
                    <h3 className="font-bold text-lg text-slate-800">Baixar Fatura</h3>
                    <p className="text-sm text-slate-500">{invoice.clientName} - {invoice.serviceName}</p>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Data do Pagamento</label>
                        <input type="date" className="w-full p-2 border rounded" value={paidDate} onChange={e => setPaidDate(e.target.value)} />
                    </div>
                    
                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 text-sm text-blue-800">
                        <div className="flex justify-between mb-1">
                            <span>Valor Original:</span>
                            <span className="font-bold">{FORMATTER.format(invoice.amount)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Sugestão (com juros):</span>
                            <span className="font-bold">{FORMATTER.format(suggested)}</span>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Valor Final Pago</label>
                        <input 
                            type="number" 
                            className="w-full p-3 border border-emerald-300 rounded focus:ring-2 focus:ring-emerald-500 font-bold text-lg" 
                            value={finalAmount} 
                            onChange={e => setFinalAmount(Number(e.target.value))} 
                        />
                    </div>
                </div>
                <div className="p-6 border-t border-slate-100 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded">Cancelar</button>
                    <button onClick={() => onPay(finalAmount, paidDate)} className="px-4 py-2 bg-emerald-600 text-white hover:bg-emerald-700 rounded font-bold shadow-lg shadow-emerald-600/20">
                        Confirmar Pagamento
                    </button>
                </div>
            </div>
        </div>
    )
}

interface MeetingModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void;
    onDelete?: () => void;
    form: Partial<Meeting>;
    setForm: (f: Partial<Meeting>) => void;
    clients: Client[];
    team: User[];
}

const MeetingModal: React.FC<MeetingModalProps> = ({ isOpen, onClose, onSave, onDelete, form, setForm, clients, team }) => {
    if (!isOpen) return null;
    const [newActionItem, setNewActionItem] = useState('');

    const toggleAttendee = (userId: string) => {
        const current = form.attendees || [];
        const exists = current.find(a => a.userId === userId);
        if (exists) {
            setForm({ ...form, attendees: current.filter(a => a.userId !== userId) });
        } else {
            setForm({ ...form, attendees: [...current, { userId, status: 'pending' }] });
        }
    };

    const addActionItem = () => {
        if (!newActionItem.trim()) return;
        setForm({
            ...form,
            actionItems: [...(form.actionItems || []), newActionItem.trim()]
        });
        setNewActionItem('');
    };

    const removeActionItem = (index: number) => {
        const items = [...(form.actionItems || [])];
        items.splice(index, 1);
        setForm({ ...form, actionItems: items });
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h2 className="text-xl font-bold text-slate-800">{form.id ? 'Editar Reunião' : 'Nova Reunião'}</h2>
                    <button onClick={onClose}><X className="w-5 h-5 text-slate-500" /></button>
                </div>
                <div className="p-6 space-y-4 overflow-y-auto">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Título</label>
                        <input type="text" className="w-full p-2 border rounded" value={form.title || ''} onChange={e => setForm({...form, title: e.target.value})} placeholder="Ex: Alinhamento Mensal" />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Data</label>
                            <input type="date" className="w-full p-2 border rounded" value={form.date || ''} onChange={e => setForm({...form, date: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Hora</label>
                            <input type="time" className="w-full p-2 border rounded" value={form.time || ''} onChange={e => setForm({...form, time: e.target.value})} />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Tipo</label>
                            <select className="w-full p-2 border rounded" value={form.type || 'Mensal'} onChange={e => setForm({...form, type: e.target.value as any})}>
                                <option value="Semanal">Semanal</option>
                                <option value="Mensal">Mensal</option>
                                <option value="Onboarding">Onboarding</option>
                                <option value="Emergência">Emergência</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Cliente</label>
                            <select className="w-full p-2 border rounded" value={form.clientId || ''} onChange={e => setForm({...form, clientId: e.target.value})}>
                                <option value="">Nenhum (Interno)</option>
                                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Participantes</label>
                        <div className="flex flex-wrap gap-2">
                            {team.map(u => {
                                const isSelected = form.attendees?.some(a => a.userId === u.id);
                                return (
                                    <button 
                                        key={u.id}
                                        onClick={() => toggleAttendee(u.id)}
                                        className={`px-3 py-1 rounded-full text-xs font-bold border transition-colors ${isSelected ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-slate-50 text-slate-500 border-slate-200'}`}
                                    >
                                        {u.name.split(' ')[0]}
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Pauta / Notas</label>
                        <textarea rows={3} className="w-full p-2 border rounded resize-none" value={form.notes || ''} onChange={e => setForm({...form, notes: e.target.value})} />
                    </div>

                    {/* ACTION ITEMS SECTION */}
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                        <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                            <ListTodo className="w-4 h-4 text-emerald-600" /> Próximos Passos / Ações
                        </label>
                        
                        <div className="flex gap-2 mb-3">
                            <input 
                                type="text" 
                                placeholder="Ex: Cliente enviar fotos..." 
                                className="flex-1 p-2 border rounded text-sm"
                                value={newActionItem}
                                onChange={e => setNewActionItem(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && addActionItem()}
                            />
                            <button onClick={addActionItem} className="bg-emerald-600 text-white px-3 rounded text-sm hover:bg-emerald-700 font-medium">Adicionar</button>
                        </div>

                        {form.actionItems && form.actionItems.length > 0 ? (
                            <ul className="space-y-2">
                                {form.actionItems.map((item, idx) => (
                                    <li key={idx} className="flex justify-between items-center bg-white p-2 rounded border border-slate-100 text-sm shadow-sm">
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                            <span className="text-slate-700">{item}</span>
                                        </div>
                                        <button onClick={() => removeActionItem(idx)} className="text-slate-400 hover:text-red-500">
                                            <X className="w-3 h-3" />
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-xs text-slate-400 italic">Nenhum plano de ação definido.</p>
                        )}
                    </div>
                    {/* END ACTION ITEMS */}

                    {form.title && form.date && (
                        <div className="pt-2">
                             <a 
                                href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(form.title)}&dates=${form.date.replace(/-/g, '')}T${(form.time || '09:00').replace(':', '')}00/${form.date.replace(/-/g, '')}T${(parseInt((form.time || '09:00').split(':')[0])+1).toString().padStart(2,'0')}${((form.time || '09:00').split(':')[1])}00&details=${encodeURIComponent(form.notes || '')}`}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-2 text-sm text-purple-600 font-bold hover:text-purple-800 bg-purple-50 px-3 py-2 rounded-lg border border-purple-100 w-full justify-center transition-colors"
                             >
                                 <Calendar className="w-4 h-4" /> Adicionar ao Google Agenda
                             </a>
                        </div>
                    )}

                </div>
                <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-between gap-3">
                    {form.id && onDelete ? (
                        <button onClick={onDelete} className="px-4 py-2 text-red-600 hover:bg-red-50 border border-red-200 rounded-lg transition-colors font-medium flex items-center gap-2">
                            <Trash2 className="w-4 h-4" /> Excluir
                        </button>
                    ) : <div></div>}
                    <div className="flex gap-3">
                        <button onClick={onClose} className="px-6 py-2 text-slate-600 hover:bg-slate-200 rounded-lg transition-colors font-medium">Cancelar</button>
                        <button onClick={onSave} className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium">Salvar</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

// --- Main Application ---

export default function App() {
  // Auth State
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // App State
  const [activeTab, setActiveTab] = useState('dashboard');
  const [clients, setClients] = useState<Client[]>([]);
  const [reports, setReports] = useState<WeeklyReport[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  // Finance State
  const [products, setProducts] = useState<ServiceProduct[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  const [logs, setLogs] = useState<AuditLog[]>([]);

  // Filter State
  const [clientFilter, setClientFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Modal States
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportForm, setReportForm] = useState<Partial<WeeklyReport>>({});
  const [isNewReport, setIsNewReport] = useState(true);

  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [clientForm, setClientForm] = useState<Partial<Client>>({});
  const [isNewClient, setIsNewClient] = useState(true);
  const [tempContracts, setTempContracts] = useState<Contract[]>([]);

  const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false);
  const [meetingForm, setMeetingForm] = useState<Partial<Meeting>>({});

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskForm, setTaskForm] = useState<Partial<Task>>({});
  
  const [paymentModalInvoice, setPaymentModalInvoice] = useState<Invoice | null>(null);

  // Chat State
  const [chatRecipient, setChatRecipient] = useState<string>('ALL');
  const [chatInput, setChatInput] = useState('');
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);

  // Card Modal
  const [cardReport, setCardReport] = useState<WeeklyReport | null>(null);
  const [cardClient, setCardClient] = useState<Client | null>(null);
  const [isCardOpen, setIsCardOpen] = useState(false);

  // Kanban Drag State
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

  // --- Effects ---
  useEffect(() => {
    // Load data on mount if user logged in
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = () => {
      setClients(db.getClients());
      setReports(db.getReports());
      setLogs(db.getLogs());
      setTasks(db.getTasks());
      setMeetings(db.getMeetings());
      setProducts(db.getProducts());
      setContracts(db.getContracts());
      setInvoices(db.getInvoices());
      if(user) {
          setChatMessages(db.getChatMessages(user.id));
          setNotifications(db.getNotifications(user.id));
      }
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const loggedUser = db.login(email, password);
    if (loggedUser) {
      setUser(loggedUser);
      setLoginError('');
      // Reset form
      setEmail('');
      setPassword('');
    } else {
      setLoginError('Email ou senha inválidos');
    }
  };

  const handleLogout = () => {
    setUser(null);
    setActiveTab('dashboard');
  };

  // --- Actions ---

  const handleSaveReport = () => {
    if (!user) return;
    const reportToSave = {
        ...reportForm,
        id: reportForm.id || Math.random().toString(36).substr(2, 9),
        updatedAt: new Date().toISOString(),
        updatedBy: user.id
    } as WeeklyReport;

    if (isNewReport) {
        reportToSave.createdAt = new Date().toISOString();
    }

    db.saveReport(reportToSave, user.id);
    loadData(); // Reload all
    setIsReportModalOpen(false);
  };

  const handleSaveClient = () => {
      if (!user) return;
      const clientToSave = {
          ...clientForm,
          id: clientForm.id || Math.random().toString(36).substr(2, 9),
          isActive: clientForm.isActive ?? true,
          // Recalculate fee based on contracts
          fee: tempContracts.reduce((sum, c) => sum + c.value, 0)
      } as Client;

      db.saveClient(clientToSave, user.id);
      
      // Save Contracts associated
      tempContracts.forEach(c => {
          if (c.clientId === clientToSave.id) {
              db.saveContract(c);
          } else {
              // New contracts for new clients need ID update
              db.saveContract({ ...c, clientId: clientToSave.id });
          }
      });

      loadData();
      setIsClientModalOpen(false);
  }

  const handleDeleteClient = (e: React.MouseEvent, id: string) => {
      e.stopPropagation(); // Prevent opening client details
      if (!user) return;
      if (window.confirm('Tem certeza que deseja excluir este cliente? Todos os relatórios serão perdidos.')) {
          db.deleteClient(id, user.id);
          // FORCE UPDATE UI IMMEDIATELY
          setClients(db.getClients()); 
      }
  }

  const handleToggleClientStatus = (e: React.MouseEvent, client: Client) => {
      e.stopPropagation();
      if (!user) return;
      const updated = { ...client, isActive: !client.isActive };
      db.saveClient(updated, user.id);
       // FORCE UPDATE UI IMMEDIATELY
       setClients(db.getClients());
  }

  const handlePayInvoice = (amount: number, date: string) => {
      if (paymentModalInvoice) {
          db.payInvoice(paymentModalInvoice.id, amount, date);
          loadData();
          setPaymentModalInvoice(null);
      }
  }

  const openNewReportModal = (clientId?: string) => {
    setReportForm({
        clientId: clientId || '',
        startDate: '',
        endDate: '',
        type: CampaignType.WHATSAPP,
        spend: 0,
        leads: 0,
        sales: 0,
        channels: []
    });
    setIsNewReport(true);
    setIsReportModalOpen(true);
  };

  const openEditReportModal = (report: WeeklyReport) => {
      setReportForm({ ...report });
      setIsNewReport(false);
      setIsReportModalOpen(true);
  }

  const openCardModal = (report: WeeklyReport, client: Client) => {
      setCardReport(report);
      setCardClient(client);
      setIsCardOpen(true);
  }

  const generateMonthlyReport = (monthKey: string, reports: WeeklyReport[], client: Client): WeeklyReport | null => {
    // FIX: Filter reports ONLY for this client to avoid aggregating other clients data
    const monthReports = reports.filter(r => r.clientId === client.id && r.startDate.startsWith(monthKey));
    if (monthReports.length === 0) return null;

    const startDate = monthReports[0].startDate;
    const endDate = monthReports[monthReports.length - 1].endDate;

    // Aggregate Totals
    const totalSpend = monthReports.reduce((sum, r) => sum + r.spend, 0);
    const totalReach = monthReports.reduce((sum, r) => sum + r.reach, 0);
    const totalClicks = monthReports.reduce((sum, r) => sum + r.clicks, 0);
    const totalLeads = monthReports.reduce((sum, r) => sum + r.leads, 0);
    const totalSales = monthReports.reduce((sum, r) => sum + (r.sales || 0), 0);
    const totalRevenue = monthReports.reduce((sum, r) => sum + (r.revenue || 0), 0);

    // Aggregate Channels (Platform breakdown)
    const channelMap: Record<string, ChannelResult> = {};

    monthReports.forEach(report => {
        if (report.channels && report.channels.length > 0) {
            report.channels.forEach(ch => {
                if (!channelMap[ch.platform]) {
                    channelMap[ch.platform] = {
                        platform: ch.platform,
                        spend: 0,
                        reach: 0,
                        clicks: 0,
                        leads: 0
                    };
                }
                channelMap[ch.platform].spend += ch.spend;
                channelMap[ch.platform].reach += ch.reach;
                channelMap[ch.platform].clicks += ch.clicks;
                channelMap[ch.platform].leads += ch.leads;
            });
        }
    });

    const aggregatedChannels = Object.values(channelMap);

    return {
      id: `monthly-${monthKey}`,
      clientId: client.id,
      startDate,
      endDate,
      type: monthReports[0].type, // Assume type is consistent or take first
      channels: aggregatedChannels,
      spend: totalSpend,
      reach: totalReach,
      clicks: totalClicks,
      leads: totalLeads,
      topCreativeLink: '',
      managerNotes: 'Fechamento Mensal Consolidado',
      sales: totalSales,
      revenue: totalRevenue,
      productsSold: 'Vários (Fechamento Mensal)',
      csNotes: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  };

  // --- Filtering Logic ---
  const filteredClients = useMemo(() => {
      let list = clients;
      
      // Role Filter
      if (user?.role === UserRole.MANAGER) {
          list = list.filter(c => c.managerId === user.id);
      } else if (user?.role === UserRole.CS) {
          list = list.filter(c => c.csId === user.id);
      }

      // Status Filter
      if (clientFilter === 'active') return list.filter(c => c.isActive);
      if (clientFilter === 'inactive') return list.filter(c => !c.isActive);
      return list;
  }, [clients, user, clientFilter]);

  // --- Budget Health Logic ---
  const calculateBudgetHealth = (client: Client) => {
      const clientReports = reports.filter(r => r.clientId === client.id);
      // Get current month spend
      const currentMonth = new Date().toISOString().slice(0, 7);
      const spentThisMonth = clientReports
        .filter(r => r.startDate.startsWith(currentMonth))
        .reduce((sum, r) => sum + r.spend, 0);
      
      const budget = client.adBudget;
      const percentUsed = (spentThisMonth / budget) * 100;
      
      // Alert Logic for Prepaid (Boleto/Pix)
      const isPrepaid = client.paymentMethod === PaymentMethod.BOLETO || client.paymentMethod === PaymentMethod.PIX;
      const remaining = budget - spentThisMonth;
      
      // Estimate burn rate (daily spend)
      const daysPassed = new Date().getDate();
      const avgDailySpend = daysPassed > 0 ? spentThisMonth / daysPassed : 0;
      const daysLeftOfBudget = avgDailySpend > 0 ? remaining / avgDailySpend : 30;

      let status: 'ok' | 'warning' | 'critical' = 'ok';
      if (isPrepaid && daysLeftOfBudget < 5) status = 'critical';
      else if (percentUsed > 90) status = 'warning';

      return { spentThisMonth, percentUsed, status, remaining, daysLeftOfBudget };
  }

  // --- Workflow Handlers ---
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
      setDraggedTaskId(taskId);
      // e.dataTransfer.setData("taskId", taskId); // Legacy support, state is better for React
  }

  const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault(); // Necessary to allow dropping
  }

  const handleDrop = (e: React.DragEvent, status: TaskStatus) => {
      e.preventDefault();
      if (!draggedTaskId || !user) return;

      const updatedTasks = tasks.map(t => {
          if (t.id === draggedTaskId) {
              return { ...t, status };
          }
          return t;
      });
      
      setTasks(updatedTasks);
      // Persist
      const task = tasks.find(t => t.id === draggedTaskId);
      if (task) {
         db.saveTask({ ...task, status }, user.id);
      }
      setDraggedTaskId(null);
  }

  const handleSaveMeeting = () => {
      if (!user) return;
      const m = {
          ...meetingForm,
          id: meetingForm.id || Math.random().toString(36).substr(2, 9),
          organizerId: meetingForm.organizerId || user.id,
          attendees: meetingForm.attendees || []
      } as Meeting;
      db.saveMeeting(m, user.id);
      loadData();
      setIsMeetingModalOpen(false);
  }

  const handleDeleteMeeting = () => {
      if (meetingForm.id) {
          if(window.confirm("Excluir reunião?")) {
              db.deleteMeeting(meetingForm.id);
              loadData();
              setIsMeetingModalOpen(false);
          }
      }
  }

  const handleMeetingRSVP = (meetingId: string, status: 'confirmed' | 'declined') => {
      if (!user) return;
      db.respondToMeetingInvite(meetingId, user.id, status);
      loadData();
  }

  const handleSaveTask = () => {
      if (!user) return;
      const t = {
          ...taskForm,
          id: taskForm.id || Math.random().toString(36).substr(2, 9),
          creatorId: taskForm.creatorId || user.id,
          status: taskForm.status || TaskStatus.TODO,
          createdAt: taskForm.createdAt || new Date().toISOString()
      } as Task;
      db.saveTask(t, user.id);
      loadData();
      setIsTaskModalOpen(false);
  }

  const handleDeleteTask = () => {
      if (taskForm.id) {
          if(window.confirm("Excluir tarefa?")) {
              db.deleteTask(taskForm.id);
              loadData();
              setIsTaskModalOpen(false);
          }
      }
  }

  const openNewTaskModal = (status: TaskStatus) => {
      setTaskForm({ status, priority: TaskPriority.MEDIUM });
      setIsTaskModalOpen(true);
  }

  const openEditTaskModal = (task: Task) => {
      setTaskForm(task);
      setIsTaskModalOpen(true);
  }

  const handleChatInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setChatInput(val);
      
      // Detect last word being @something
      const lastWord = val.split(' ').pop();
      if (lastWord && lastWord.startsWith('@')) {
          setMentionQuery(lastWord.substring(1)); // Remove @
      } else {
          setMentionQuery(null);
      }
  }

  const insertMention = (userName: string) => {
      if (!mentionQuery) return;
      const words = chatInput.split(' ');
      words.pop(); // Remove partial @
      const newText = [...words, `@${userName} `].join(' ');
      setChatInput(newText);
      setMentionQuery(null);
      // Focus back input logic would go here
  }

  // --- Render Helpers ---

  const renderMessageContent = (text: string) => {
      // Robust logic to find known user mentions and highlight them
      const userNames = USERS.map(u => u.name).join('|');
      const regex = new RegExp(`(@(?:${userNames}))`, 'g');
      
      const parts = text.split(regex);
      return parts.map((part, i) => {
          if (part.startsWith('@')) {
               // Check if it's a valid user for extra safety
               const matchedUser = USERS.find(u => `@${u.name}` === part);
               if (matchedUser) {
                   return <span key={i} className="font-bold text-emerald-600 bg-emerald-50 px-1 rounded mx-0.5">{part}</span>
               }
          }
          return part;
      });
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
        <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl">
            <div className="text-center mb-8">
                <div className="inline-flex p-3 bg-emerald-100 rounded-xl mb-4">
                    <Users className="w-8 h-8 text-emerald-600" />
                </div>
                <h1 className="text-2xl font-bold text-slate-900">AgencyFlow CRM</h1>
                <p className="text-slate-500 mt-2">Entre para gerenciar sua operação</p>
            </div>
            
            <form onSubmit={handleLogin} className="space-y-4">
                {loginError && (
                    <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" /> {loginError}
                    </div>
                )}
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                    <div className="relative">
                        <Mail className="w-5 h-5 absolute left-3 top-3 text-slate-400" />
                        <input 
                            type="email" 
                            className="w-full pl-10 p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                            placeholder="seu@email.com"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                        />
                    </div>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Senha</label>
                     <div className="relative">
                        <Lock className="w-5 h-5 absolute left-3 top-3 text-slate-400" />
                        <input 
                            type="password" 
                            className="w-full pl-10 p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                            placeholder="••••••"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                        />
                    </div>
                </div>
                <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-lg transition-all shadow-lg shadow-emerald-600/20">
                    Entrar na Plataforma
                </button>
            </form>

            <div className="mt-6 pt-6 border-t border-slate-100">
                <p className="text-xs text-slate-400 mb-3 text-center uppercase font-bold tracking-wider">Acesso Rápido (Teste)</p>
                <div className="grid grid-cols-2 gap-2">
                    <button 
                        onClick={() => { setEmail('admin@agency.com'); setPassword('123'); }}
                        className="w-full text-left p-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center gap-2 transition-colors group"
                    >
                        <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-[10px]">A</div>
                        <div className="text-xs">
                            <p className="font-bold text-slate-700">Admin</p>
                        </div>
                    </button>
                    <button 
                        onClick={() => { setEmail('ana@agency.com'); setPassword('123'); }}
                        className="w-full text-left p-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center gap-2 transition-colors group"
                    >
                        <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold text-[10px]">F</div>
                        <div className="text-xs">
                            <p className="font-bold text-slate-700">Financeiro</p>
                        </div>
                    </button>
                    <button 
                        onClick={() => { setEmail('carlos@agency.com'); setPassword('123'); }}
                        className="w-full text-left p-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center gap-2 transition-colors group"
                    >
                        <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-[10px]">G</div>
                        <div className="text-xs">
                            <p className="font-bold text-slate-700">Gestor</p>
                        </div>
                    </button>
                    <button 
                        onClick={() => { setEmail('mariana@agency.com'); setPassword('123'); }}
                        className="w-full text-left p-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center gap-2 transition-colors group"
                    >
                         <div className="w-6 h-6 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 font-bold text-[10px]">C</div>
                        <div className="text-xs">
                            <p className="font-bold text-slate-700">CS</p>
                        </div>
                    </button>
                </div>
            </div>
        </div>
      </div>
    );
  }

  const userNotifications = notifications.filter(n => !n.read);

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      {/* Sidebar */}
      <aside className="w-72 bg-slate-900 text-slate-300 flex flex-col flex-shrink-0">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3 text-white mb-1">
            <div className="bg-emerald-600 p-2 rounded-lg">
                <Users className="w-6 h-6" />
            </div>
            <span className="text-xl font-bold tracking-tight">AgencyFlow</span>
          </div>
          <p className="text-xs text-slate-500 ml-11">CRM de Performance</p>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <div onClick={() => setActiveTab('dashboard')} className={navItemClass(activeTab === 'dashboard')}>
            <LayoutDashboard className="w-5 h-5" />
            <span className="font-medium">Dashboard</span>
          </div>
          
          {(user.role === UserRole.ADMIN || user.role === UserRole.FINANCIAL) && (
             <div onClick={() => setActiveTab('finance')} className={navItemClass(activeTab === 'finance')}>
                <DollarSign className="w-5 h-5" />
                <span className="font-medium">Financeiro</span>
            </div>
          )}

          <div onClick={() => setActiveTab('clients')} className={navItemClass(activeTab === 'clients')}>
            <Users className="w-5 h-5" />
            <span className="font-medium">Meus Clientes</span>
          </div>
          <div onClick={() => setActiveTab('calendar')} className={navItemClass(activeTab === 'calendar')}>
            <Calendar className="w-5 h-5" />
            <span className="font-medium">Agenda</span>
          </div>
          <div onClick={() => setActiveTab('kanban')} className={navItemClass(activeTab === 'kanban')}>
            <CheckSquare className="w-5 h-5" />
            <span className="font-medium">Tarefas (Kanban)</span>
          </div>
          <div onClick={() => setActiveTab('chat')} className={navItemClass(activeTab === 'chat')}>
            <MessageSquare className="w-5 h-5" />
            <span className="font-medium">Chat Equipe</span>
          </div>
          
          <div className="pt-4 mt-4 border-t border-slate-800">
              <div onClick={() => setActiveTab('notifications')} className={navItemClass(activeTab === 'notifications')}>
                <div className="relative">
                    <Bell className="w-5 h-5" />
                    {userNotifications.length > 0 && (
                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"></span>
                    )}
                </div>
                <span className="font-medium flex-1">Notificações</span>
                {userNotifications.length > 0 && (
                    <span className="bg-emerald-600 text-white text-xs px-2 py-0.5 rounded-full">{userNotifications.length}</span>
                )}
            </div>
          </div>

           {user.role === UserRole.ADMIN && (
            <div className="pt-4 mt-4 border-t border-slate-800">
                <div onClick={() => setActiveTab('audit')} className={navItemClass(activeTab === 'audit')}>
                    <ShieldAlert className="w-5 h-5" />
                    <span className="font-medium">Auditoria</span>
                </div>
            </div>
          )}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-800/50 mb-3">
            <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full border-2 border-emerald-500" />
            <div className="overflow-hidden">
                <p className="text-sm font-bold text-white truncate">{user.name}</p>
                <p className="text-[10px] uppercase tracking-wide text-emerald-400">{user.role}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 text-slate-400 hover:text-white py-2 hover:bg-slate-800 rounded transition-colors text-sm">
            <LogOut className="w-4 h-4" /> Sair
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8">
        
        {/* HEADER */}
        <header className="flex justify-between items-center mb-8">
            <div>
                <h1 className="text-2xl font-bold text-slate-800">
                    {activeTab === 'dashboard' && 'Visão Geral'}
                    {activeTab === 'finance' && 'Gestão Financeira'}
                    {activeTab === 'clients' && 'Carteira de Clientes'}
                    {activeTab === 'audit' && 'Logs de Auditoria'}
                    {activeTab === 'calendar' && 'Agenda da Equipe'}
                    {activeTab === 'kanban' && 'Gestão de Tarefas'}
                    {activeTab === 'chat' && 'Chat Interno'}
                    {activeTab === 'notifications' && 'Suas Notificações'}
                </h1>
                <p className="text-slate-500 text-sm">
                    {activeTab === 'dashboard' && `Bem-vindo de volta, ${user.name.split(' ')[0]}`}
                    {activeTab === 'clients' && 'Gerencie seus contratos e relatórios'}
                </p>
            </div>
            
            {activeTab === 'clients' && user.role === UserRole.ADMIN && (
                 <button onClick={() => {
                     setClientForm({});
                     setTempContracts([]); // Reset new contracts
                     setIsNewClient(true);
                     setIsClientModalOpen(true);
                 }} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg shadow-lg shadow-emerald-600/20 flex items-center gap-2 transition-all font-medium">
                    <Plus className="w-4 h-4" /> Novo Cliente
                </button>
            )}
             {activeTab === 'calendar' && (
                 <button onClick={() => {
                     setMeetingForm({});
                     setIsMeetingModalOpen(true);
                 }} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg shadow-lg shadow-emerald-600/20 flex items-center gap-2 transition-all font-medium">
                    <Plus className="w-4 h-4" /> Nova Reunião
                </button>
            )}
        </header>

        {activeTab === 'dashboard' && (
            <div className="space-y-8">
                {/* ADMIN DASHBOARD */}
                {user.role === UserRole.ADMIN && (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="bg-blue-100 p-3 rounded-lg">
                                        <Users className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <span className="text-xs font-bold text-slate-400 uppercase">Total</span>
                                </div>
                                <h3 className="text-3xl font-bold text-slate-800">{clients.length}</h3>
                                <p className="text-slate-500 text-sm mt-1">Clientes Cadastrados</p>
                            </div>
                             <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="bg-emerald-100 p-3 rounded-lg">
                                        <Check className="w-6 h-6 text-emerald-600" />
                                    </div>
                                    <span className="text-xs font-bold text-slate-400 uppercase">Ativos</span>
                                </div>
                                <h3 className="text-3xl font-bold text-slate-800">{clients.filter(c => c.isActive).length}</h3>
                                <p className="text-slate-500 text-sm mt-1">Clientes Ativos</p>
                            </div>
                             <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="bg-red-100 p-3 rounded-lg">
                                        <X className="w-6 h-6 text-red-600" />
                                    </div>
                                    <span className="text-xs font-bold text-slate-400 uppercase">Churn</span>
                                </div>
                                <h3 className="text-3xl font-bold text-slate-800">{clients.filter(c => !c.isActive).length}</h3>
                                <p className="text-slate-500 text-sm mt-1">Clientes Inativos</p>
                            </div>
                             <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="bg-purple-100 p-3 rounded-lg">
                                        <Wallet className="w-6 h-6 text-purple-600" />
                                    </div>
                                    <span className="text-xs font-bold text-slate-400 uppercase">MRR</span>
                                </div>
                                <h3 className="text-3xl font-bold text-slate-800">
                                    {FORMATTER.format(contracts.filter(c => c.status === 'ACTIVE').reduce((acc, curr) => acc + curr.value, 0))}
                                </h3>
                                <p className="text-slate-500 text-sm mt-1">Receita Recorrente</p>
                            </div>
                        </div>
                    </>
                )}

                {/* TEAM DASHBOARD (MANAGER / CS / ADMIN SEES TOO) */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Left Col: Alerts & Budget Health */}
                    <div className="lg:col-span-2 space-y-6">
                         <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <ShieldAlert className="w-5 h-5 text-orange-500" />
                                Saúde do Orçamento (Boleto/Pix)
                            </h3>
                            <div className="space-y-4">
                                {filteredClients.filter(c => ['Boleto', 'PIX'].includes(c.paymentMethod) && c.isActive).map(client => {
                                    const health = calculateBudgetHealth(client);
                                    if (health.status === 'ok') return null; // Only show warnings

                                    return (
                                        <div key={client.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                                            <div>
                                                <p className="font-bold text-slate-700">{client.name}</p>
                                                <p className="text-xs text-slate-500 mt-1">
                                                    Orçamento: {FORMATTER.format(client.adBudget)} | Gasto: {FORMATTER.format(health.spentThisMonth)}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                {health.status === 'critical' ? (
                                                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-bold">
                                                        <AlertTriangle className="w-3 h-3" /> Saldo Crítico ({Math.floor(health.daysLeftOfBudget)} dias)
                                                    </span>
                                                ) : (
                                                     <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 text-xs font-bold">
                                                        <Info className="w-3 h-3" /> Atenção ({health.percentUsed.toFixed(0)}% usado)
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    )
                                })}
                                {filteredClients.filter(c => ['Boleto', 'PIX'].includes(c.paymentMethod) && c.isActive).every(c => calculateBudgetHealth(c).status === 'ok') && (
                                    <p className="text-slate-400 text-sm italic text-center py-4">Nenhum alerta de saldo. Operação saudável.</p>
                                )}
                            </div>
                        </div>
                        
                         <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                            <h3 className="font-bold text-slate-800 mb-4">Carteira Atribuída</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                                        <tr>
                                            <th className="px-4 py-3">Cliente</th>
                                            <th className="px-4 py-3">Plataforma</th>
                                            <th className="px-4 py-3">Pagamento</th>
                                            <th className="px-4 py-3">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredClients.slice(0, 5).map(c => (
                                            <tr key={c.id} className="border-b border-slate-100 hover:bg-slate-50">
                                                <td className="px-4 py-3 font-medium">{c.name}</td>
                                                <td className="px-4 py-3 flex gap-1">
                                                    {c.platforms.map(p => (
                                                        <span key={p} className="px-2 py-0.5 bg-slate-200 rounded text-[10px]">{p.split(' ')[0]}</span>
                                                    ))}
                                                </td>
                                                <td className="px-4 py-3">{c.paymentMethod}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${c.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                                                        {c.isActive ? 'Ativo' : 'Inativo'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Right Col: Payment Methods Chart */}
                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-80">
                             <h3 className="font-bold text-slate-800 mb-4">Métodos de Pagamento</h3>
                             <ResponsiveContainer width="100%" height="100%">
                                <RePieChart>
                                    <Pie
                                        data={[
                                            { name: 'Cartão', value: filteredClients.filter(c => c.paymentMethod === PaymentMethod.CREDIT_CARD).length },
                                            { name: 'Boleto', value: filteredClients.filter(c => c.paymentMethod === PaymentMethod.BOLETO).length },
                                            { name: 'PIX', value: filteredClients.filter(c => c.paymentMethod === PaymentMethod.PIX).length },
                                        ]}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        <Cell fill="#10b981" />
                                        <Cell fill="#3b82f6" />
                                        <Cell fill="#f59e0b" />
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </RePieChart>
                             </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* FINANCE TAB */}
        {activeTab === 'finance' && (
             <div className="space-y-8">
                 {/* Finance KPIs */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                     <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                        <div className="flex justify-between items-start mb-4">
                            <div className="bg-emerald-100 p-3 rounded-lg">
                                <DollarSign className="w-6 h-6 text-emerald-600" />
                            </div>
                            <span className="text-xs font-bold text-slate-400 uppercase">Total Recebido</span>
                        </div>
                        <h3 className="text-2xl font-bold text-slate-800">
                             {FORMATTER.format(invoices.filter(i => i.status === 'PAID').reduce((acc, i) => acc + (i.paidAmount || 0), 0))}
                        </h3>
                        <p className="text-slate-500 text-sm mt-1">Acumulado</p>
                    </div>
                     <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                        <div className="flex justify-between items-start mb-4">
                            <div className="bg-blue-100 p-3 rounded-lg">
                                <TrendingUp className="w-6 h-6 text-blue-600" />
                            </div>
                            <span className="text-xs font-bold text-slate-400 uppercase">Juros/Multas</span>
                        </div>
                        <h3 className="text-2xl font-bold text-slate-800">
                             {FORMATTER.format(invoices.filter(i => i.status === 'PAID').reduce((acc, i) => acc + ((i.paidAmount || 0) - i.amount), 0))}
                        </h3>
                        <p className="text-slate-500 text-sm mt-1">Receita Extra</p>
                    </div>
                     <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                        <div className="flex justify-between items-start mb-4">
                            <div className="bg-red-100 p-3 rounded-lg">
                                <AlertTriangle className="w-6 h-6 text-red-600" />
                            </div>
                            <span className="text-xs font-bold text-slate-400 uppercase">Inadimplência</span>
                        </div>
                        <h3 className="text-2xl font-bold text-slate-800">
                             {FORMATTER.format(invoices.filter(i => i.status === 'OVERDUE').reduce((acc, i) => acc + i.amount, 0))}
                        </h3>
                        <p className="text-slate-500 text-sm mt-1">{invoices.filter(i => i.status === 'OVERDUE').length} Faturas em atraso</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Invoices List */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                        <h3 className="font-bold text-slate-800 mb-4">Contas a Receber</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                                    <tr>
                                        <th className="px-4 py-3">Cliente</th>
                                        <th className="px-4 py-3">Vencimento</th>
                                        <th className="px-4 py-3">Valor</th>
                                        <th className="px-4 py-3">Status</th>
                                        <th className="px-4 py-3">Ação</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {invoices.sort((a,b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()).map(inv => (
                                        <tr key={inv.id} className="border-b border-slate-100">
                                            <td className="px-4 py-3">
                                                <div className="font-medium text-slate-800">{inv.clientName}</div>
                                                <div className="text-xs text-slate-500">{inv.serviceName}</div>
                                            </td>
                                            <td className="px-4 py-3">{new Date(inv.dueDate).toLocaleDateString()}</td>
                                            <td className="px-4 py-3">{FORMATTER.format(inv.amount)}</td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                                                    inv.status === 'PAID' ? 'bg-emerald-100 text-emerald-700' :
                                                    inv.status === 'OVERDUE' ? 'bg-red-100 text-red-700' :
                                                    'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                    {inv.status === 'OVERDUE' ? 'Atrasado' : inv.status === 'PAID' ? 'Pago' : 'Aberto'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                {inv.status !== 'PAID' && (
                                                    <button onClick={() => setPaymentModalInvoice(inv)} className="text-xs bg-emerald-50 text-emerald-600 px-2 py-1 rounded border border-emerald-100 hover:bg-emerald-100 font-bold">
                                                        Baixar
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Products List */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-slate-800">Catálogo de Produtos</h3>
                            <button className="text-xs bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded text-slate-600 font-medium">+ Novo Produto</button>
                        </div>
                        <div className="space-y-3">
                            {products.map(prod => (
                                <div key={prod.id} className="flex justify-between items-center p-3 border border-slate-100 rounded-lg hover:bg-slate-50">
                                    <div>
                                        <p className="font-bold text-slate-700">{prod.name}</p>
                                        <p className="text-xs text-slate-500">{prod.description}</p>
                                    </div>
                                    <span className="font-bold text-slate-800">{FORMATTER.format(prod.defaultPrice)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
             </div>
        )}

        {/* Clients Tab */}
        {activeTab === 'clients' && (
             <div>
                {/* Filters */}
                <div className="flex justify-end mb-6">
                    <div className="bg-white p-1 rounded-lg border border-slate-200 flex text-sm font-medium">
                        <button onClick={() => setClientFilter('all')} className={`px-4 py-1.5 rounded-md transition-colors ${clientFilter === 'all' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}>Todos</button>
                        <button onClick={() => setClientFilter('active')} className={`px-4 py-1.5 rounded-md transition-colors ${clientFilter === 'active' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-500 hover:text-slate-700'}`}>Ativos</button>
                        <button onClick={() => setClientFilter('inactive')} className={`px-4 py-1.5 rounded-md transition-colors ${clientFilter === 'inactive' ? 'bg-red-50 text-red-700' : 'text-slate-500 hover:text-slate-700'}`}>Inativos</button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredClients.map(client => {
                        // Find last report to show summary
                        const clientReports = reports.filter(r => r.clientId === client.id).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                        
                        // Group reports by month for Accordion
                        const reportsByMonth = clientReports.reduce<Record<string, WeeklyReport[]>>((acc, report) => {
                            const monthKey = report.startDate.slice(0, 7); // YYYY-MM
                            if (!acc[monthKey]) acc[monthKey] = [];
                            acc[monthKey].push(report);
                            return acc;
                        }, {} as Record<string, WeeklyReport[]>);

                        return (
                             <div key={client.id} className={`bg-white rounded-xl shadow-sm border transition-all hover:shadow-md flex flex-col ${client.isActive ? 'border-slate-200' : 'border-slate-100 opacity-75 bg-slate-50'}`}>
                                <div className="p-6 flex-1">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-3 rounded-lg ${client.isActive ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-500'}`}>
                                                <Users className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-slate-800 text-lg">{client.name}</h3>
                                                <p className="text-sm text-slate-500">{client.niche}</p>
                                            </div>
                                        </div>
                                        {(user.role === UserRole.ADMIN || user.role === UserRole.FINANCIAL) && (
                                             <button onClick={() => {
                                                 setClientForm({...client});
                                                 setTempContracts(db.getContracts(client.id));
                                                 setIsNewClient(false);
                                                 setIsClientModalOpen(true);
                                             }} className="text-slate-400 hover:text-blue-600">
                                                <Edit2 className="w-4 h-4" />
                                             </button>
                                        )}
                                    </div>

                                    {/* ... rest of client card ... */}
                                    <div className="space-y-2 text-sm mb-6">
                                        <div className="flex justify-between">
                                            <span className="text-slate-500 flex items-center gap-2"><CreditCard className="w-4 h-4"/> Pagamento:</span>
                                            <span className="font-medium text-slate-700">{client.paymentMethod}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-500 flex items-center gap-2"><Wallet className="w-4 h-4"/> Verba:</span>
                                            <span className="font-medium text-slate-700">{FORMATTER.format(client.adBudget)}</span>
                                        </div>
                                    </div>

                                    {/* Monthly Accordion */}
                                    <div className="space-y-3">
                                        {Object.entries(reportsByMonth).sort((a,b) => b[0].localeCompare(a[0])).map(([month, monthReports]) => (
                                            <MonthAccordion 
                                                key={month} 
                                                month={month} 
                                                reports={monthReports as WeeklyReport[]} 
                                                onEditReport={openEditReportModal}
                                                onViewCard={(r) => openCardModal(r, client)}
                                                onGenerateMonthly={() => {
                                                    const monthlyReport = generateMonthlyReport(month, reports, client);
                                                    if (monthlyReport) openCardModal(monthlyReport, client);
                                                }}
                                            />
                                        ))}
                                    </div>
                                </div>
                                
                                <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center gap-2">
                                     <button 
                                        onClick={() => {
                                            setSelectedClient(client);
                                            openNewReportModal(client.id);
                                        }}
                                        className="flex-1 py-2 bg-white border border-slate-200 text-slate-700 hover:border-emerald-500 hover:text-emerald-600 rounded-lg text-sm font-medium transition-all shadow-sm"
                                    >
                                        Lançar Relatório
                                    </button>

                                    {user.role === UserRole.ADMIN && (
                                        <>
                                            <button 
                                                title={client.isActive ? "Inativar Cliente" : "Ativar Cliente"}
                                                onClick={(e) => handleToggleClientStatus(e, client)}
                                                className={`p-2 rounded-lg border transition-all ${client.isActive ? 'bg-white text-emerald-600 border-emerald-200 hover:bg-emerald-50' : 'bg-slate-200 text-slate-500 border-slate-300'}`}
                                            >
                                                <Power className="w-4 h-4" />
                                            </button>
                                            <button 
                                                title="Excluir Cliente"
                                                onClick={(e) => handleDeleteClient(e, client.id)}
                                                className="p-2 bg-white text-red-400 border border-red-100 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </>
                                    )}
                                </div>
                             </div>
                        );
                    })}
                </div>
             </div>
        )}

        {/* CALENDAR TAB */}
        {activeTab === 'calendar' && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                    <h3 className="font-bold text-slate-700">Agenda de Reuniões</h3>
                </div>
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {meetings.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map(meeting => {
                            const client = clients.find(c => c.id === meeting.clientId);
                            const myStatus = meeting.attendees.find(a => a.userId === user.id)?.status;

                            return (
                                <div key={meeting.id} onClick={() => { setMeetingForm(meeting); setIsMeetingModalOpen(true); }} className="border border-slate-200 rounded-lg p-4 hover:shadow-md cursor-pointer transition-all bg-white hover:border-emerald-300">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="bg-purple-100 text-purple-700 text-xs font-bold px-2 py-1 rounded uppercase">
                                            {meeting.type}
                                        </div>
                                        {myStatus && (
                                             <div title={`Seu status: ${myStatus}`} className={`w-3 h-3 rounded-full ${myStatus === 'confirmed' ? 'bg-emerald-500' : myStatus === 'declined' ? 'bg-red-500' : 'bg-yellow-400'}`}></div>
                                        )}
                                    </div>
                                    <h4 className="font-bold text-slate-800 mb-1">{meeting.title}</h4>
                                    <p className="text-sm text-slate-500 mb-2">{client ? client.name : 'Interno'}</p>
                                    
                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                        <Calendar className="w-4 h-4" />
                                        <span>{new Date(meeting.date).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-slate-600 mt-1">
                                        <Clock className="w-4 h-4" />
                                        <span>{meeting.time}</span>
                                    </div>
                                    
                                    <div className="mt-3 flex -space-x-2 overflow-hidden">
                                        {meeting.attendees.map(att => {
                                            const u = USERS.find(u => u.id === att.userId);
                                            if(!u) return null;
                                            return (
                                                <img key={u.id} className="inline-block h-6 w-6 rounded-full ring-2 ring-white" src={u.avatar} alt={u.name} title={`${u.name} (${att.status})`} />
                                            )
                                        })}
                                    </div>
                                </div>
                            )
                        })}
                        {meetings.length === 0 && (
                            <p className="text-slate-400 col-span-full text-center py-10">Nenhuma reunião agendada.</p>
                        )}
                    </div>
                </div>
            </div>
        )}

        {/* KANBAN TAB */}
        {activeTab === 'kanban' && (
            <div className="h-full overflow-x-auto pb-4">
                <div className="flex gap-6 min-w-[1000px] h-full">
                    {Object.values(TaskStatus).map(status => (
                        <div 
                            key={status} 
                            className="flex-1 bg-slate-100/50 rounded-xl border border-slate-200 flex flex-col min-h-[500px]"
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, status as TaskStatus)}
                        >
                            <div className="p-4 border-b border-slate-200 bg-slate-100 rounded-t-xl flex justify-between items-center sticky top-0">
                                <h3 className="font-bold text-slate-700">{status}</h3>
                                <span className="text-xs bg-slate-200 px-2 py-0.5 rounded-full text-slate-600 font-bold">
                                    {tasks.filter(t => t.status === status).length}
                                </span>
                            </div>
                            
                            <div className="p-3 space-y-3 flex-1 overflow-y-auto">
                                {tasks.filter(t => t.status === status).map(task => {
                                    const assignee = USERS.find(u => u.id === task.assigneeId);
                                    const client = clients.find(c => c.id === task.clientId);
                                    
                                    return (
                                        <div 
                                            key={task.id} 
                                            draggable
                                            onDragStart={(e) => handleDragStart(e, task.id)}
                                            onClick={() => openEditTaskModal(task)}
                                            className={`bg-white p-4 rounded-lg shadow-sm border border-slate-200 cursor-grab active:cursor-grabbing hover:shadow-md transition-all ${draggedTaskId === task.id ? 'opacity-50' : ''}`}
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <span className={`text-[10px] px-2 py-0.5 rounded uppercase font-bold ${
                                                    task.priority === TaskPriority.HIGH ? 'bg-red-100 text-red-600' :
                                                    task.priority === TaskPriority.MEDIUM ? 'bg-yellow-100 text-yellow-600' :
                                                    'bg-blue-100 text-blue-600'
                                                }`}>
                                                    {task.priority}
                                                </span>
                                                {assignee && (
                                                    <img src={assignee.avatar} className="w-6 h-6 rounded-full" title={assignee.name} />
                                                )}
                                            </div>
                                            <h4 className="font-bold text-slate-800 text-sm mb-1">{task.title}</h4>
                                            {client && (
                                                <p className="text-xs text-slate-500 mb-2 flex items-center gap-1">
                                                    <Users className="w-3 h-3" /> {client.name}
                                                </p>
                                            )}
                                            <div className="text-xs text-slate-400 mt-2 flex justify-between items-center">
                                                <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                             <div className="p-3">
                                <button onClick={() => openNewTaskModal(status as TaskStatus)} className="w-full py-2 border-2 border-dashed border-slate-300 rounded-lg text-slate-400 hover:text-slate-600 hover:border-slate-400 text-sm font-bold transition-colors">
                                    + Adicionar
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* CHAT TAB */}
        {activeTab === 'chat' && (
             <div className="bg-white rounded-xl shadow-sm border border-slate-100 flex flex-col h-[600px] overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                    <h3 className="font-bold text-slate-700 flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-emerald-600" /> Chat da Equipe
                    </h3>
                     {/* Recipient Selector */}
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500">Enviar para:</span>
                        <select 
                            className="text-sm p-1 border rounded bg-white text-slate-700 outline-none focus:ring-1 focus:ring-emerald-500"
                            value={chatRecipient}
                            onChange={(e) => setChatRecipient(e.target.value)}
                        >
                            <option value="ALL">Todos (Geral)</option>
                            {USERS.filter(u => u.id !== user.id).map(u => (
                                <option key={u.id} value={u.id}>{u.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
                
                <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50">
                    {chatMessages.sort((a,b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()).map(msg => {
                        const sender = USERS.find(u => u.id === msg.userId);
                        const isMe = msg.userId === user.id;
                        const isPrivate = msg.recipientId && msg.recipientId !== 'ALL';

                        return (
                            <div key={msg.id} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
                                <img src={sender?.avatar} className="w-8 h-8 rounded-full flex-shrink-0 self-end" title={sender?.name} />
                                <div className={`max-w-[70%] ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                                    <span className="text-xs text-slate-400 mb-1 ml-1 mr-1">{sender?.name}</span>
                                    <div className={`p-3 rounded-2xl text-sm relative ${
                                        isMe 
                                            ? 'bg-emerald-600 text-white rounded-br-none' 
                                            : isPrivate 
                                                ? 'bg-amber-100 text-amber-900 border border-amber-200 rounded-bl-none'
                                                : 'bg-white text-slate-700 border border-slate-200 rounded-bl-none'
                                    }`}>
                                        {isPrivate && (
                                            <div className="flex items-center gap-1 text-[10px] font-bold opacity-70 mb-1 uppercase tracking-wide">
                                                <Lock className="w-3 h-3" /> Privado
                                            </div>
                                        )}
                                        {renderMessageContent(msg.message)}
                                    </div>
                                    <span className="text-[10px] text-slate-400 mt-1 mx-1">
                                        {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    </span>
                                </div>
                            </div>
                        )
                    })}
                </div>

                <div className="p-4 bg-white border-t border-slate-100 relative">
                    {/* Mention Popup */}
                    {mentionQuery !== null && (
                        <div className="absolute bottom-20 left-4 bg-white border border-slate-200 shadow-xl rounded-lg p-2 min-w-[200px] z-50 animate-in slide-in-from-bottom-2 fade-in duration-200">
                             <p className="text-xs text-slate-400 mb-2 px-2 uppercase font-bold">Mencionar</p>
                             {USERS.filter(u => u.name.toLowerCase().includes(mentionQuery!.toLowerCase())).map(u => (
                                 <button 
                                    key={u.id}
                                    onClick={() => insertMention(u.name)}
                                    className="w-full text-left flex items-center gap-2 p-2 hover:bg-slate-50 rounded transition-colors text-sm text-slate-700"
                                 >
                                     <img src={u.avatar} className="w-5 h-5 rounded-full" />
                                     {u.name}
                                 </button>
                             ))}
                        </div>
                    )}

                    <div className="flex gap-2">
                        <input 
                            type="text" 
                            className="flex-1 p-3 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
                            placeholder={mentionQuery !== null ? `Mencionar...` : "Digite sua mensagem... (Use @ para marcar)"}
                            value={chatInput}
                            onChange={handleChatInputChange}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && chatInput.trim()) {
                                    const msg = {
                                        id: Math.random().toString(36).substr(2, 9),
                                        userId: user.id,
                                        message: chatInput,
                                        timestamp: new Date().toISOString(),
                                        recipientId: chatRecipient
                                    };
                                    db.sendChatMessage(msg);
                                    loadData();
                                    setChatInput('');
                                }
                            }}
                        />
                        <button 
                            onClick={() => {
                                if (chatInput.trim()) {
                                    const msg = {
                                        id: Math.random().toString(36).substr(2, 9),
                                        userId: user.id,
                                        message: chatInput,
                                        timestamp: new Date().toISOString(),
                                        recipientId: chatRecipient
                                    };
                                    db.sendChatMessage(msg);
                                    loadData();
                                    setChatInput('');
                                }
                            }}
                            className="bg-emerald-600 text-white p-3 rounded-lg hover:bg-emerald-700 transition-colors"
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        )}

         {/* NOTIFICATIONS TAB */}
         {activeTab === 'notifications' && (
             <div className="max-w-2xl mx-auto">
                 <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                     <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                        <h3 className="font-bold text-slate-700">Central de Notificações</h3>
                        <button className="text-xs text-emerald-600 hover:text-emerald-700 font-medium">Marcar todas como lidas</button>
                    </div>
                    <div className="divide-y divide-slate-100">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center text-slate-400">
                                <Bell className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                <p>Nenhuma notificação por enquanto.</p>
                            </div>
                        ) : (
                            notifications.map(notif => (
                                <div key={notif.id} className={`p-4 hover:bg-slate-50 transition-colors flex gap-4 ${!notif.read ? 'bg-blue-50/50' : ''}`}>
                                    <div className={`p-2 rounded-full h-fit flex-shrink-0 ${
                                        notif.type === 'INVITE' ? 'bg-purple-100 text-purple-600' : 
                                        notif.type === 'TASK' ? 'bg-orange-100 text-orange-600' :
                                        notif.type === 'CHAT' ? 'bg-emerald-100 text-emerald-600' :
                                        'bg-slate-100 text-slate-500'
                                    }`}>
                                        {notif.type === 'INVITE' && <Calendar className="w-5 h-5" />}
                                        {notif.type === 'TASK' && <CheckSquare className="w-5 h-5" />}
                                        {notif.type === 'CHAT' && <MessageSquare className="w-5 h-5" />}
                                        {notif.type === 'SYSTEM' && <Info className="w-5 h-5" />}
                                        {notif.type === 'FINANCE' && <DollarSign className="w-5 h-5" />}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <h4 className={`text-sm ${!notif.read ? 'font-bold text-slate-800' : 'font-medium text-slate-600'}`}>{notif.title}</h4>
                                            <span className="text-xs text-slate-400">{new Date(notif.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <p className="text-sm text-slate-500 mt-1">{notif.message}</p>
                                        
                                        <div className="flex gap-2 mt-3">
                                            {notif.type === 'INVITE' && notif.relatedId && (
                                                <>
                                                    <button onClick={() => { handleMeetingRSVP(notif.relatedId!, 'confirmed'); db.markNotificationRead(notif.id); loadData(); }} className="px-3 py-1 bg-emerald-600 text-white text-xs rounded hover:bg-emerald-700 font-medium">Aceitar</button>
                                                    <button onClick={() => { handleMeetingRSVP(notif.relatedId!, 'declined'); db.markNotificationRead(notif.id); loadData(); }} className="px-3 py-1 bg-slate-200 text-slate-600 text-xs rounded hover:bg-slate-300 font-medium">Recusar</button>
                                                </>
                                            )}
                                            {notif.type === 'CHAT' && (
                                                <button onClick={() => { setActiveTab('chat'); db.markNotificationRead(notif.id); loadData(); }} className="px-3 py-1 bg-emerald-50 text-emerald-600 border border-emerald-100 text-xs rounded hover:bg-emerald-100 font-medium">Responder</button>
                                            )}
                                            <button onClick={() => { db.markNotificationRead(notif.id); loadData(); }} className="text-xs text-slate-400 hover:text-slate-600">Marcar como lida</button>
                                            <button onClick={() => { db.deleteNotification(notif.id); loadData(); }} className="text-xs text-slate-400 hover:text-red-400">Excluir</button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                 </div>
             </div>
         )}

        {/* AUDIT TAB */}
        {activeTab === 'audit' && user.role === UserRole.ADMIN && (
             <div className="bg-white rounded-xl shadow-sm border border-slate-100">
                <div className="p-4 border-b border-slate-100 bg-slate-50">
                    <h3 className="font-bold text-slate-700">Logs de Auditoria</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                            <tr>
                                <th className="px-4 py-3">Data/Hora</th>
                                <th className="px-4 py-3">Usuário</th>
                                <th className="px-4 py-3">Ação</th>
                                <th className="px-4 py-3">Detalhes</th>
                            </tr>
                        </thead>
                        <tbody>
                            {logs.map(log => (
                                <tr key={log.id} className="border-b border-slate-100 hover:bg-slate-50">
                                    <td className="px-4 py-3 text-slate-500">{new Date(log.timestamp).toLocaleString()}</td>
                                    <td className="px-4 py-3 font-medium text-slate-700">{log.userName}</td>
                                    <td className="px-4 py-3">
                                        <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs font-mono">
                                            {log.action}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-slate-600">{log.details}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
             </div>
        )}

      </main>

      {/* Modals */}
      <ReportModal 
        isOpen={isReportModalOpen} 
        onClose={() => setIsReportModalOpen(false)} 
        onSave={handleSaveReport}
        form={reportForm}
        setForm={setReportForm}
        clients={clients}
        currentUser={user}
        isNew={isNewReport}
      />

      <ClientModal 
        isOpen={isClientModalOpen}
        onClose={() => setIsClientModalOpen(false)}
        onSave={handleSaveClient}
        form={clientForm}
        setForm={setClientForm}
        managers={USERS.filter(u => u.role === UserRole.MANAGER || u.role === UserRole.ADMIN)}
        css={USERS.filter(u => u.role === UserRole.CS || u.role === UserRole.ADMIN)}
        isNew={isNewClient}
        products={products}
        contracts={tempContracts}
        meetings={meetings} // Passing meetings to ClientModal
        onAddContract={(c) => setTempContracts([...tempContracts, c])}
        onDeleteContract={(id) => setTempContracts(tempContracts.filter(c => c.id !== id))}
      />

      {/* ... Other modals ... */}
      <MeetingModal
        isOpen={isMeetingModalOpen}
        onClose={() => setIsMeetingModalOpen(false)}
        onSave={handleSaveMeeting}
        onDelete={handleDeleteMeeting}
        form={meetingForm}
        setForm={setMeetingForm}
        clients={clients}
        team={USERS}
      />
      
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSave={handleSaveTask}
        onDelete={handleDeleteTask}
        form={taskForm}
        setForm={setTaskForm}
        clients={clients}
        users={USERS}
      />

      {paymentModalInvoice && (
          <PaymentModal 
            isOpen={true}
            onClose={() => setPaymentModalInvoice(null)}
            invoice={paymentModalInvoice}
            onPay={handlePayInvoice}
          />
      )}

      {/* WhatsApp Card Preview Modal */}
      {isCardOpen && cardReport && cardClient && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] p-4 backdrop-blur-sm overflow-auto">
              <div className="relative">
                  <button 
                    onClick={() => setIsCardOpen(false)}
                    className="absolute -top-10 right-0 text-white hover:text-emerald-400 transition-colors"
                  >
                      <X className="w-8 h-8" />
                  </button>
                  <WhatsAppCard report={cardReport} client={cardClient} />
              </div>
          </div>
      )}

    </div>
  );
}

export const MonthAccordion: React.FC<{ 
    month: string; 
    reports?: WeeklyReport[]; 
    onEditReport: (r: WeeklyReport) => void;
    onViewCard: (r: WeeklyReport) => void;
    onGenerateMonthly: () => void;
}> = ({ month, reports = [] as WeeklyReport[], onEditReport, onViewCard, onGenerateMonthly }) => {
    const [isOpen, setIsOpen] = useState(false);
    
    // Calc Monthly Totals
    const totalSpend = reports.reduce((acc, r) => acc + r.spend, 0);
    const totalLeads = reports.reduce((acc, r) => acc + r.leads, 0);
    const totalRevenue = reports.reduce((acc, r) => acc + (r.revenue || 0), 0);

    // Format YYYY-MM to Month Name
    const [year, m] = month.split('-');
    const date = new Date(parseInt(year), parseInt(m)-1);
    const monthName = date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

    return (
        <div className="border border-slate-100 rounded-lg overflow-hidden">
            <div 
                onClick={() => setIsOpen(!isOpen)}
                className="bg-slate-50 p-3 flex items-center justify-between cursor-pointer hover:bg-slate-100 transition-colors select-none"
            >
                <div className="flex items-center gap-3">
                    {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                    <span className="font-bold text-slate-700 capitalize">{monthName}</span>
                    <span className="text-xs bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full">{reports.length} semanas</span>
                </div>
                <div className="flex gap-4 text-xs">
                    <div>
                        <span className="text-slate-400 block">Investido</span>
                        <span className="font-bold text-slate-700">{FORMATTER.format(totalSpend)}</span>
                    </div>
                    <div>
                        <span className="text-slate-400 block">Faturamento</span>
                        <span className="font-bold text-emerald-600">{FORMATTER.format(totalRevenue)}</span>
                    </div>
                </div>
            </div>
            
            {isOpen && (
                <div className="p-3 bg-white space-y-2">
                     {/* Monthly Actions */}
                     <div className="flex justify-end mb-2">
                        <button 
                            onClick={(e) => { e.stopPropagation(); onGenerateMonthly(); }}
                            className="text-xs flex items-center gap-1 text-purple-600 hover:text-purple-800 font-bold bg-purple-50 px-2 py-1 rounded border border-purple-100 hover:bg-purple-100"
                        >
                            <ImageIcon className="w-3 h-3" /> Gerar Card Mensal Consolidado
                        </button>
                     </div>

                    {[...reports].sort((a,b) => a.startDate.localeCompare(b.startDate)).map((report, idx) => (
                        <div key={report.id} className="flex justify-between items-center p-3 border border-slate-100 rounded hover:border-emerald-200 transition-colors group">
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-slate-400">Semana {idx + 1}</span>
                                    <span className="text-xs text-slate-300">|</span>
                                    <span className="text-xs text-slate-500">{new Date(report.startDate).toLocaleDateString('pt-BR', {day:'2-digit', month:'2-digit'})} a {new Date(report.endDate).toLocaleDateString('pt-BR', {day:'2-digit', month:'2-digit'})}</span>
                                </div>
                                <div className="flex gap-3 mt-1 text-sm">
                                    <span className="font-medium text-slate-700">R$ {report.spend}</span>
                                    <span className="text-emerald-600 font-medium">{report.leads} Leads</span>
                                </div>
                            </div>
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => onViewCard(report)} className="p-1.5 text-slate-400 hover:text-emerald-600 bg-slate-50 hover:bg-emerald-50 rounded">
                                    <ImageIcon className="w-4 h-4" />
                                </button>
                                <button onClick={() => onEditReport(report)} className="p-1.5 text-slate-400 hover:text-blue-600 bg-slate-50 hover:bg-blue-50 rounded">
                                    <Edit2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
