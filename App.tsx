
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  LayoutDashboard, Users, FileBarChart, LogOut, Plus, Save, Edit2, Calendar,
  DollarSign, Filter, Trash2, ShieldAlert, Phone, Mail, Lock, AlertTriangle,
  CheckSquare, MessageSquare, Clock, Send, Bell, Check, X, Layers, Package,
  History, UserCheck, Briefcase, Target, TrendingUp, Receipt, Search, ExternalLink
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts';

import { Client, WeeklyReport, UserRole, User, CampaignType, PaymentMethod, Platform, AuditLog, Task, Meeting, ChatMessage, TaskStatus, TaskPriority, Notification, ChannelResult, ServiceProduct, Contract, Invoice } from './types';
import { FORMATTER, INITIAL_PRODUCTS } from './constants';
import { db } from './services/mockDb';
import { WhatsAppCard } from './components/WhatsAppCard';
import { ClientModal } from './components/ClientModal';
import { ReportModal } from './components/ReportModal';

// --- Estilos de Navegação ---
const navItemClass = (isActive: boolean) => 
  `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 cursor-pointer ${
    isActive 
      ? 'bg-emerald-600 text-white shadow-md' 
      : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
  }`;

// --- MODAIS INTERNOS ---

const MeetingModal = ({ isOpen, onClose, onSave, meetingToEdit, clients, users }: any) => {
    const [form, setForm] = useState<Partial<Meeting>>({});
    useEffect(() => {
        if (meetingToEdit) setForm(meetingToEdit);
        else setForm({ 
            date: new Date().toISOString().split('T')[0], 
            time: '09:00', 
            type: 'Semanal', 
            attendees: [{ userId: users[0]?.id, status: 'confirmed' }] 
        });
    }, [meetingToEdit, isOpen, users]);
    if (!isOpen) return null;

    const handleAttendeeChange = (userId: string, checked: boolean) => {
        setForm(prev => {
            const currentAttendees = prev.attendees || [];
            if (checked) {
                return { ...prev, attendees: [...currentAttendees, { userId, status: 'pending' }] };
            } else {
                return { ...prev, attendees: currentAttendees.filter(a => a.userId !== userId) };
            }
        });
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[70] backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
                <div className="p-6 border-b flex justify-between items-center bg-slate-50">
                    <h2 className="text-xl font-bold">Reunião</h2>
                    <button onClick={onClose}><X size={20}/></button>
                </div>
                <div className="p-6 space-y-4">
                    <input type="text" className="w-full p-2 border rounded" placeholder="Título da Reunião" value={form.title || ''} onChange={e => setForm({...form, title: e.target.value})} />
                    <select className="w-full p-2 border rounded" value={form.clientId || ''} onChange={e => setForm({...form, clientId: e.target.value})}>
                        <option value="">Cliente...</option>
                        {clients.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <select className="w-full p-2 border rounded" value={form.type || ''} onChange={e => setForm({...form, type: e.target.value as any})}>
                        <option value="Semanal">Semanal</option>
                        <option value="Mensal">Mensal</option>
                        <option value="Onboarding">Onboarding</option>
                        <option value="Emergência">Emergência</option>
                    </select>
                    <div className="grid grid-cols-2 gap-2">
                        <input type="date" className="w-full p-2 border rounded" value={form.date || ''} onChange={e => setForm({...form, date: e.target.value})} />
                        <input type="time" className="w-full p-2 border rounded" value={form.time || ''} onChange={e => setForm({...form, time: e.target.value})} />
                    </div>
                    <textarea className="w-full p-2 border rounded h-24" placeholder="Notas/Ata da reunião" value={form.notes || ''} onChange={e => setForm({...form, notes: e.target.value})} />
                    
                    <div>
                        <p className="text-sm font-bold mb-2">Participantes:</p>
                        <div className="grid grid-cols-2 gap-2">
                            {users.map((u: any) => (
                                <label key={u.id} className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={form.attendees?.some(a => a.userId === u.id) || false}
                                        onChange={e => handleAttendeeChange(u.id, e.target.checked)}
                                    />
                                    {u.name}
                                </label>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="p-6 border-t bg-slate-50 flex justify-end gap-2">
                    <button onClick={onClose} className="px-4 py-2">Cancelar</button>
                    <button onClick={() => onSave(form)} className="px-6 py-2 bg-emerald-600 text-white rounded font-bold">Salvar</button>
                </div>
            </div>
        </div>
    );
};


const TaskModal = ({ isOpen, onClose, onSave, taskToEdit, users }: any) => {
    const [form, setForm] = useState<Partial<Task>>({});
    useEffect(() => {
        if (taskToEdit) setForm(taskToEdit);
        else setForm({ status: TaskStatus.TODO, priority: TaskPriority.MEDIUM, dueDate: new Date().toISOString().split('T')[0], creatorId: users[0]?.id || '', assigneeId: users[0]?.id || '' }); // Set default creator/assignee
    }, [taskToEdit, isOpen, users]);
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[70] backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
                <div className="p-6 border-b flex justify-between items-center bg-slate-50">
                    <h2 className="text-xl font-bold">Tarefa</h2>
                    <button onClick={onClose}><X size={20}/></button>
                </div>
                <div className="p-6 space-y-4">
                    <input type="text" className="w-full p-2 border rounded" placeholder="Título" value={form.title || ''} onChange={e => setForm({...form, title: e.target.value})} />
                    <textarea className="w-full p-2 border rounded h-24" placeholder="Descrição" value={form.description || ''} onChange={e => setForm({...form, description: e.target.value})} />
                    <select className="w-full p-2 border rounded" value={form.assigneeId || ''} onChange={e => setForm({...form, assigneeId: e.target.value})}>
                        <option value="">Responsável...</option>
                        {users.map((u: any) => <option key={u.id} value={u.id}>{u.name}</option>)}
                    </select>
                    <select className="w-full p-2 border rounded" value={form.status || ''} onChange={e => setForm({...form, status: e.target.value as TaskStatus})}>
                        {Object.values(TaskStatus).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <input type="date" className="w-full p-2 border rounded" value={form.dueDate || ''} onChange={e => setForm({...form, dueDate: e.target.value})} />
                    <select className="w-full p-2 border rounded" value={form.priority || ''} onChange={e => setForm({...form, priority: e.target.value as TaskPriority})}>
                        {Object.values(TaskPriority).map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                </div>
                <div className="p-6 border-t bg-slate-50 flex justify-end gap-2">
                    <button onClick={onClose} className="px-4 py-2">Cancelar</button>
                    <button onClick={() => onSave(form)} className="px-6 py-2 bg-emerald-600 text-white rounded font-bold">Salvar</button>
                </div>
            </div>
        </div>
    );
};

const UserModal = ({ isOpen, onClose, onSave, userToEdit }: any) => {
    const [form, setForm] = useState<Partial<User>>({});
    useEffect(() => {
        if (isOpen) {
            if (userToEdit) setForm(userToEdit);
            else setForm({ role: UserRole.MANAGER, avatar: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}` });
        }
    }, [userToEdit, isOpen]);
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[70] backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
                <div className="p-6 border-b flex justify-between items-center bg-slate-50 rounded-t-xl">
                    <h2 className="text-xl font-bold text-slate-800">{userToEdit ? 'Editar Acesso' : 'Novo Integrante'}</h2>
                    <button onClick={onClose}><X size={20}/></button>
                </div>
                <div className="p-6 space-y-4">
                    <input type="text" className="w-full p-2 border rounded" value={form.name || ''} onChange={e => setForm({...form, name: e.target.value})} placeholder="Nome Completo" />
                    <input type="email" className="w-full p-2 border rounded" value={form.email || ''} onChange={e => setForm({...form, email: e.target.value})} placeholder="E-mail de Login" />
                    <input type="text" className="w-full p-2 border rounded" value={form.password || ''} onChange={e => setForm({...form, password: e.target.value})} placeholder="Senha" />
                    <select className="w-full p-2 border rounded" value={form.role || ''} onChange={e => setForm({...form, role: e.target.value as UserRole})}>
                        <option value={UserRole.ADMIN}>Admin Geral</option>
                        <option value={UserRole.MANAGER}>Gestor de Tráfego</option>
                        <option value={UserRole.CS}>Customer Success (CS)</option>
                        <option value={UserRole.FINANCIAL}>Financeiro</option>
                        <option value={UserRole.SDR}>SDR (Vendas)</option>
                    </select>
                </div>
                <div className="p-6 border-t bg-slate-50 flex justify-end gap-3 rounded-b-xl">
                    <button onClick={onClose} className="px-4 py-2 text-slate-600 font-bold">Cancelar</button>
                    <button onClick={() => onSave(form)} className="px-6 py-2 bg-emerald-600 text-white rounded font-bold">Salvar</button>
                </div>
            </div>
        </div>
    );
};

// --- APP PRINCIPAL ---
export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const [activeTab, setActiveTab] = useState('dashboard');
  const [clients, setClients] = useState<Client[]>([]);
  const [reports, setReports] = useState<WeeklyReport[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [logs, setLogs] = useState<AuditLog[]>([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');

  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [clientToEdit, setClientToEdit] = useState<Client | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportToEdit, setReportToEdit] = useState<WeeklyReport | null>(null);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false);
  const [meetingToEdit, setMeetingToEdit] = useState<Meeting | null>(null);


  const [chatInput, setChatInput] = useState('');

  const loadData = useCallback(() => {
      setClients(db.getClients());
      setReports(db.getReports());
      setTasks(db.getTasks());
      setMeetings(db.getMeetings());
      setInvoices(db.getInvoices());
      setUsers(db.getUsers());
      setLogs(db.getLogs());
      setChatMessages(db.getChatMessages());
  }, []);

  useEffect(() => {
    if (user) loadData();
  }, [user, loadData]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const loggedUser = db.login(email, password);
    if (loggedUser) {
      setUser(loggedUser);
      setLoginError('');
      setActiveTab('dashboard');
    } else {
      setLoginError('Credenciais inválidas.');
    }
  };

  const handleSendMessage = () => {
    if (!chatInput.trim() || !user) return;
    db.sendChatMessage({ id: Date.now().toString(), userId: user.id, message: chatInput, timestamp: new Date().toISOString() });
    setChatInput('');
    loadData();
  };

  // Client Handlers
  const handleOpenNewClient = () => {
    setClientToEdit(null);
    setIsClientModalOpen(true);
  };

  const handleEditClient = (client: Client) => {
    setClientToEdit(client);
    setIsClientModalOpen(true);
  };

  const handleSaveClient = (client: Client) => {
    if (!user) return;
    db.saveClient(client, user.id);
    loadData();
    setIsClientModalOpen(false);
  };

  const handleDeleteClient = (clientId: string) => {
    if (!user) return;
    if (window.confirm('Excluir este cliente removerá permanentemente todos os seus dados. Confirmar?')) {
      db.deleteClient(clientId, user.id);
      loadData();
      setIsClientModalOpen(false);
      // If the deleted client was the one being viewed, go back to the clients list
      if (selectedClientId === clientId) {
        setSelectedClientId(null);
        setActiveTab('clients');
      }
    }
  };

  // Report Handlers
  const handleOpenNewReport = (clientIdForReport: string) => {
    setReportToEdit(null);
    setSelectedClientId(clientIdForReport); // Ensure the correct client is selected for the report
    setIsReportModalOpen(true);
  };

  const handleEditReport = (report: WeeklyReport) => {
    setReportToEdit(report);
    setSelectedClientId(report.clientId); // Ensure client context for modal
    setIsReportModalOpen(true);
  };

  const handleSaveReport = (report: WeeklyReport) => {
    if (!user) return;
    db.saveReport(report, user.id);
    loadData();
    setIsReportModalOpen(false);
  };

  const handleDeleteReport = (reportId: string) => {
    if (window.confirm('Excluir este relatório semanal?')) {
      db.deleteReport(reportId);
      loadData();
      setIsReportModalOpen(false);
      if (selectedReportId === reportId) setSelectedReportId(null);
    }
  };

  // Meeting Handlers
  const handleOpenNewMeeting = () => {
      setMeetingToEdit(null);
      setIsMeetingModalOpen(true);
  };

  const handleSaveMeeting = (meeting: Meeting) => {
      if (!user) return;
      db.saveMeeting(meeting); // assuming saveMeeting in mockDb handles ID generation and persistence
      loadData();
      setIsMeetingModalOpen(false);
  };

  const currentClient = useMemo(() => clients.find(c => c.id === selectedClientId), [clients, selectedClientId]);
  const currentClientReports = useMemo(() => reports.filter(r => r.clientId === selectedClientId).sort((a,b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime()), [reports, selectedClientId]);
  const displayedReport = useMemo(() => selectedReportId ? currentClientReports.find(r => r.id === selectedReportId) : currentClientReports[0], [selectedReportId, currentClientReports]);

  const filteredClients = useMemo(() => {
    let currentClients = clients;
    if (searchQuery) {
        currentClients = currentClients.filter(
            c => c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                 c.niche.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }
    if (filterStatus === 'active') {
        currentClients = currentClients.filter(c => c.isActive);
    } else if (filterStatus === 'inactive') {
        currentClients = currentClients.filter(c => !c.isActive);
    }
    return currentClients;
  }, [clients, searchQuery, filterStatus]);

  // Dashboard calculations
  const totalClients = clients.length;
  const activeClients = clients.filter(c => c.isActive).length;
  const inactiveClients = totalClients - activeClients;
  const monthlyRecurringRevenue = clients.filter(c => c.isActive).reduce((sum, c) => sum + c.fee, 0);

  const totalReceived = useMemo(() => invoices.filter(i => i.status === 'PAID').reduce((sum, i) => sum + (i.paidAmount || i.amount), 0), [invoices]);
  const totalOverdue = useMemo(() => invoices.filter(i => i.status === 'OVERDUE').reduce((sum, i) => sum + i.amount, 0), [invoices]);
  const totalPending = useMemo(() => invoices.filter(i => i.status === 'PENDING').reduce((sum, i) => sum + i.amount, 0), [invoices]);

  const paymentMethodData = useMemo(() => {
    const counts: { [key: string]: number } = {};
    clients.forEach(client => {
      counts[client.paymentMethod] = (counts[client.paymentMethod] || 0) + 1;
    });
    return Object.keys(counts).map(method => ({
      name: method,
      value: counts[method],
    }));
  }, [clients]);

  const PIE_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28DFF', '#FF0000'];


  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
        <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl">
            <div className="text-center mb-8">
                <div className="inline-flex p-3 bg-emerald-600 rounded-xl mb-4 text-white"><Briefcase /></div>
                <h1 className="text-2xl font-black text-slate-900">AgencyFlow</h1>
                <p className="text-slate-500 text-sm">Painel de Controle Interno</p>
            </div>
            <form onSubmit={handleLogin} className="space-y-4">
                {loginError && <div className="p-3 bg-red-50 text-red-600 text-xs rounded-lg border border-red-100 flex items-center gap-2"><AlertTriangle size={16}/> {loginError}</div>}
                <input type="email" className="w-full p-3 bg-slate-50 border rounded-lg" value={email} onChange={e => setEmail(e.target.value)} required placeholder="E-mail" />
                <input type="password" className="w-full p-3 bg-slate-50 border rounded-lg" value={password} onChange={e => setPassword(e.target.value)} required placeholder="Senha" />
                <button type="submit" className="w-full bg-emerald-600 text-white font-bold py-3 rounded-lg hover:bg-emerald-700">Entrar</button>
            </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-400 flex flex-col flex-shrink-0 border-r border-slate-800">
        <div className="p-6 border-b border-slate-800">
            <div className="flex items-center gap-3 text-white font-bold text-xl tracking-tighter">
                <div className="bg-emerald-600 p-1.5 rounded"><Target size={20}/></div> AgencyFlow
            </div>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            <div onClick={() => { setActiveTab('dashboard'); setSelectedClientId(null); }} className={navItemClass(activeTab === 'dashboard')}><LayoutDashboard size={20}/><span>Dashboard</span></div>
            <div onClick={() => { setActiveTab('finance'); setSelectedClientId(null); }} className={navItemClass(activeTab === 'finance')}><DollarSign size={20}/><span>Financeiro</span></div>
            <div onClick={() => { setActiveTab('clients'); setSelectedClientId(null); }} className={navItemClass(activeTab === 'clients' || activeTab === 'clientDetail')}><Users size={20}/><span>Meus Clientes</span></div>
            <div onClick={() => setActiveTab('calendar')} className={navItemClass(activeTab === 'calendar')}><Calendar size={20}/><span>Agenda</span></div>
            <div onClick={() => setActiveTab('kanban')} className={navItemClass(activeTab === 'kanban')}><CheckSquare size={20}/><span>Tarefas (Kanban)</span></div>
            <div onClick={() => setActiveTab('chat')} className={navItemClass(activeTab === 'chat')}><MessageSquare size={20}/><span>Chat Equipe</span></div>
            {user.role === UserRole.ADMIN && (
                <>
                    <div className="pt-6 border-t border-slate-800 my-4 text-[10px] font-bold uppercase tracking-widest text-slate-600 px-4">Administração</div>
                    <div onClick={() => setActiveTab('team')} className={navItemClass(activeTab === 'team')}><UserCheck size={20}/><span>Equipe</span></div>
                    <div onClick={() => setActiveTab('audit')} className={navItemClass(activeTab === 'audit')}><History size={20}/><span>Auditoria</span></div>
                </>
            )}
        </nav>
        <div className="p-4 border-t border-slate-800 bg-slate-950/30">
            <div className="flex items-center gap-3 mb-4">
                <img src={user.avatar} className="w-10 h-10 rounded-full border-2 border-emerald-500" alt={user.name} />
                <div className="overflow-hidden"><p className="text-xs font-bold text-white truncate">{user.name}</p></div>
            </div>
            <button onClick={() => setUser(null)} className="flex items-center justify-center gap-2 w-full py-2 bg-slate-800 hover:bg-red-900/40 rounded-lg text-xs font-bold transition-all"><LogOut size={14}/> Sair</button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-slate-50 relative">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 flex-shrink-0 z-20">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                {activeTab === 'clientDetail' && currentClient ? (
                  <>
                    <span onClick={() => setActiveTab('clients')} className="text-slate-400 hover:text-emerald-600 cursor-pointer">Meus Clientes</span>
                    <span className="text-slate-300">/</span>
                    <span>{currentClient.name}</span>
                  </>
                ) : (
                  <span className="capitalize">
                    {activeTab === 'clients' ? 'Carteira de Clientes' : 
                     activeTab === 'finance' ? 'Gestão Financeira' :
                     activeTab === 'calendar' ? 'Agenda da Equipe' :
                     activeTab === 'kanban' ? 'Gestão de Tarefas' :
                     activeTab === 'dashboard' ? 'Visão Geral' :
                     activeTab}
                  </span>
                )}
            </h2>
            <div className="flex items-center gap-4">
                {activeTab === 'clients' && (
                    <button onClick={handleOpenNewClient} className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 shadow-lg shadow-emerald-900/20 hover:bg-emerald-700 transition-all active:scale-95">
                        <Plus size={18}/> Novo Cliente
                    </button>
                )}
                {activeTab === 'calendar' && (
                    <button onClick={handleOpenNewMeeting} className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 shadow-lg shadow-emerald-900/20 hover:bg-emerald-700 transition-all active:scale-95">
                        <Plus size={18}/> Nova Reunião
                    </button>
                )}
                <button className="relative p-2 text-slate-400 hover:text-emerald-600">
                    <Bell size={20}/>
                </button>
            </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 bg-[#f8fafc]">
            {activeTab === 'dashboard' && (
                <div className="space-y-6">
                    <p className="text-slate-500 -mt-4 text-sm">Bem-vindo de volta, {user.role === UserRole.ADMIN ? 'Admin' : user.name.split(' ')[0]}</p>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                        <div className="bg-white p-6 rounded-2xl border shadow-sm flex flex-col items-center justify-center text-center">
                            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg mb-3"><Users size={20}/></div>
                            <h3 className="text-3xl font-black text-slate-900">{totalClients}</h3>
                            <p className="text-xs text-slate-400">Clientes Cadastrados</p>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border shadow-sm flex flex-col items-center justify-center text-center">
                            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg mb-3"><Check size={20}/></div>
                            <h3 className="text-3xl font-black text-slate-900">{activeClients}</h3>
                            <p className="text-xs text-slate-400">Clientes Ativos</p>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border shadow-sm flex flex-col items-center justify-center text-center">
                            <div className="p-3 bg-red-50 text-red-600 rounded-lg mb-3"><X size={20}/></div>
                            <h3 className="text-3xl font-black text-slate-900">{inactiveClients}</h3>
                            <p className="text-xs text-slate-400">Clientes Inativos</p>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border shadow-sm flex flex-col items-center justify-center text-center">
                            <div className="p-3 bg-purple-50 text-purple-600 rounded-lg mb-3"><AlertTriangle size={20}/></div>
                            <h3 className="text-3xl font-black text-slate-900">0</h3>
                            <p className="text-xs text-slate-400">Churn</p>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border shadow-sm flex flex-col items-center justify-center text-center">
                            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg mb-3"><Receipt size={20}/></div>
                            <h3 className="text-3xl font-black text-emerald-600">{FORMATTER.format(monthlyRecurringRevenue)}</h3>
                            <p className="text-xs text-slate-400">Receita Recorrente</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white p-6 rounded-2xl border shadow-sm">
                            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><DollarSign size={18}/> Saúde do Orçamento (Boleto/Pix)</h3>
                            {totalOverdue === 0 ? (
                                <p className="text-slate-500 italic text-sm text-center py-4">Nenhum alerta de saldo. Operação saudável.</p>
                            ) : (
                                <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 flex items-center gap-2">
                                    <AlertTriangle size={16}/> {invoices.filter(i => i.status === 'OVERDUE').length} fatura(s) atrasada(s) totalizando {FORMATTER.format(totalOverdue)}.
                                </div>
                            )}
                        </div>
                        <div className="bg-white p-6 rounded-2xl border shadow-sm">
                            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><Briefcase size={18}/> Métodos de Pagamento</h3>
                            <ResponsiveContainer width="100%" height={200}>
                                <PieChart>
                                    <Pie
                                        data={paymentMethodData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {paymentMethodData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value: number) => `${value} clientes`}/>
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border shadow-sm">
                        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><Users size={18}/> Carteira Atribuída</h3>
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 border-b text-[10px] font-black uppercase tracking-widest text-slate-400">
                                <tr>
                                    <th className="px-4 py-3">Cliente</th>
                                    <th className="px-4 py-3">Plataforma</th>
                                    <th className="px-4 py-3">Pagamento</th>
                                    <th className="px-4 py-3">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {clients.map(c => (
                                    <tr key={c.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                                        <td className="px-4 py-3 font-bold text-slate-800">{c.name}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex flex-wrap gap-1">
                                                {c.platforms.map(p => (
                                                    <span key={p} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{p.split(' ')[0]}</span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-slate-600">{c.paymentMethod}</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase ${c.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                                                {c.isActive ? 'Ativo' : 'Inativo'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'finance' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white p-6 rounded-2xl border shadow-sm flex flex-col items-center text-center">
                            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg mb-3"><DollarSign size={20}/></div>
                            <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">Total Recebido</p>
                            <h3 className="text-3xl font-black text-emerald-600">{FORMATTER.format(totalReceived)}</h3>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border shadow-sm flex flex-col items-center text-center">
                            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg mb-3"><TrendingUp size={20}/></div>
                            <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">Juros/Multas</p>
                            <h3 className="text-3xl font-black text-slate-900">{FORMATTER.format(0)}</h3> {/* Placeholder for now */}
                        </div>
                        <div className="bg-white p-6 rounded-2xl border shadow-sm flex flex-col items-center text-center">
                            <div className="p-3 bg-red-50 text-red-600 rounded-lg mb-3"><AlertTriangle size={20}/></div>
                            <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">Inadimplência</p>
                            <h3 className="text-3xl font-black text-red-600">{FORMATTER.format(totalOverdue)}</h3>
                            <p className="text-xs text-slate-400">{invoices.filter(i => i.status === 'OVERDUE').length} faturas em atraso</p>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
                        <h3 className="text-lg font-bold text-slate-800 p-6 border-b flex items-center gap-2"><Receipt size={18}/> Contas a Receber</h3>
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 border-b text-[10px] font-black uppercase tracking-widest text-slate-400">
                                <tr>
                                    <th className="px-6 py-4">Cliente / Serviço</th>
                                    <th className="px-6 py-4">Vencimento</th>
                                    <th className="px-6 py-4">Valor</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Ação</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {invoices.map(inv => (
                                    <tr key={inv.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <p className="font-black text-slate-800">{inv.clientName}</p>
                                            <p className="text-[10px] text-slate-400">{inv.serviceName}</p>
                                        </td>
                                        <td className="px-6 py-4 text-slate-500">{new Date(inv.dueDate).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 font-bold text-slate-700">{FORMATTER.format(inv.amount)}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase border ${
                                                inv.status === 'PAID' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                                                inv.status === 'OVERDUE' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-blue-50 text-blue-600 border-blue-100'
                                            }`}>
                                                {inv.status === 'PENDING' ? 'ABERTO' : inv.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {inv.status !== 'PAID' && <button onClick={() => { db.payInvoice(inv.id, user.id); loadData(); }} className="text-emerald-600 font-black uppercase text-[10px] hover:underline">Baixar</button>}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
                        <h3 className="text-lg font-bold text-slate-800 p-6 border-b flex items-center gap-2"><Package size={18}/> Catálogo de Produtos</h3>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            {INITIAL_PRODUCTS.map(product => (
                                <div key={product.id} className="border border-slate-100 rounded-lg p-4 bg-slate-50">
                                    <div className="flex justify-between items-center mb-2">
                                        <h4 className="font-bold text-slate-900">{product.name}</h4>
                                        <span className="font-black text-emerald-600">{FORMATTER.format(product.defaultPrice)}</span>
                                    </div>
                                    <p className="text-xs text-slate-500">{product.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'clients' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                    <p className="text-slate-500 -mt-4 text-sm">Gerencie seus contratos e relatórios</p>
                    <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                        <div className="relative w-96">
                            <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
                            <input type="text" placeholder="Buscar por nome ou nicho..." className="w-full pl-10 p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                        </div>
                        <div className="flex gap-2 bg-slate-50 rounded-lg p-1 border border-slate-200">
                            <button onClick={() => setFilterStatus('all')} className={`px-4 py-2 text-sm font-bold rounded-md transition-colors ${filterStatus === 'all' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>Todos</button>
                            <button onClick={() => setFilterStatus('active')} className={`px-4 py-2 text-sm font-bold rounded-md transition-colors ${filterStatus === 'active' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>Ativos</button>
                            <button onClick={() => setFilterStatus('inactive')} className={`px-4 py-2 text-sm font-bold rounded-md transition-colors ${filterStatus === 'inactive' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>Inativos</button>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredClients.map(c => {
                            const clientReports = reports.filter(r => r.clientId === c.id).sort((a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime());
                            const latestReport = clientReports.length > 0 ? clientReports[0] : null;

                            const totalSpend = latestReport ? latestReport.spend : 0;
                            const overspend = c.adBudget > 0 ? (totalSpend - c.adBudget) : 0; // if adBudget is 0, overspend is 0

                            return (
                                <div key={c.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-emerald-200 transition-all relative group flex flex-col">
                                    <div className="absolute top-4 right-4 flex gap-2">
                                        <button onClick={() => handleEditClient(c)} className="text-slate-400 hover:text-emerald-600 transition-colors p-1 rounded-full hover:bg-slate-100"><Edit2 size={16}/></button>
                                    </div>
                                    <div className={`absolute top-4 left-4 px-2.5 py-1 rounded-full text-[10px] font-black tracking-tighter ${c.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                                        {c.isActive ? 'ATIVO' : 'INATIVO'}
                                    </div>

                                    <div className="flex items-center gap-3 mb-4 mt-8"> {/* Added mt-8 to give space for top badges */}
                                        <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                                            {c.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-900 text-lg leading-tight">{c.name}</h3>
                                            <p className="text-xs text-slate-400 uppercase tracking-widest">{c.niche}</p>
                                        </div>
                                    </div>

                                    <div className="border-t border-slate-100 pt-4 mt-auto space-y-3">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-500">Pagamento:</span>
                                            <span className="font-bold text-slate-700">{c.paymentMethod}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-500">Verba:</span>
                                            <span className="font-bold text-slate-700">{FORMATTER.format(c.adBudget)}</span>
                                        </div>
                                    </div>

                                    <div className="border-t border-slate-100 pt-4 mt-4 text-sm">
                                        {latestReport ? (
                                            <>
                                                <p className="font-bold text-slate-700 mb-1">{new Date(latestReport.startDate).toLocaleDateString('pt-BR', { month: 'long' })} ({clientReports.length} Semanas)</p>
                                                <div className="flex justify-between">
                                                    <span className="text-slate-500">Invertido:</span>
                                                    <span className="font-bold text-emerald-600">{FORMATTER.format(totalSpend)}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-slate-500">Estoramento:</span>
                                                    <span className={`${overspend > 0 ? 'text-red-600' : 'text-slate-700'} font-bold`}>{FORMATTER.format(overspend)}</span>
                                                </div>
                                            </>
                                        ) : (
                                            <p className="text-slate-400 italic text-xs text-center">Nenhum relatório ainda.</p>
                                        )}
                                    </div>

                                    <div className="flex gap-2 mt-4 pt-4 border-t border-slate-100">
                                        <button 
                                            onClick={() => handleOpenNewReport(c.id)} 
                                            className="flex-1 py-2 bg-emerald-600 text-white font-bold text-xs rounded-lg hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
                                        >
                                            <Plus size={14}/> Lançar Relatório
                                        </button>
                                        {latestReport && (
                                            <button onClick={() => handleDeleteReport(latestReport.id)} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-all flex items-center justify-center">
                                                <Trash2 size={14}/>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {activeTab === 'clientDetail' && currentClient && (
                <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
                    <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div className="flex items-center gap-5">
                            <div className="w-20 h-20 bg-emerald-600 text-white rounded-2xl flex items-center justify-center text-3xl font-black shadow-xl shadow-emerald-900/20">
                                {currentClient.name.charAt(0)}
                            </div>
                            <div>
                                <h2 className="text-4xl font-black text-slate-900 tracking-tighter">{currentClient.name}</h2>
                                <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">{currentClient.niche} • Cliente desde {new Date(currentClient.startDate).toLocaleDateString('pt-BR')}</p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => handleEditClient(currentClient)} className="bg-white border border-slate-200 text-slate-700 px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-50 transition-all shadow-sm">
                                <Edit2 size={18}/> Editar Perfil
                            </button>
                            <button onClick={() => handleDeleteClient(currentClient.id)} className="bg-red-50 text-red-600 px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-red-100 transition-all shadow-sm">
                                <Trash2 size={18}/> Encerrar Contrato
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        <div className="lg:col-span-1 space-y-6">
                            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                                <h3 className="font-black text-slate-800 text-xs uppercase tracking-widest mb-4 flex items-center gap-2 border-b pb-2"><Phone size={14}/> Contato & Ops</h3>
                                <div className="space-y-4">
                                    <div><p className="text-[10px] text-slate-400 font-bold uppercase">Email</p><p className="text-sm font-bold text-slate-700 truncate">{currentClient.email || 'Não informado'}</p></div>
                                    <div><p className="text-[10px] text-slate-400 font-bold uppercase">Telefone</p><p className="text-sm font-bold text-slate-700">{currentClient.phone || 'Não informado'}</p></div>
                                    <div><p className="text-[10px] text-slate-400 font-bold uppercase">Gestor Responsável</p><p className="text-sm font-bold text-emerald-600">{users.find(u => u.id === currentClient.managerId)?.name || 'N/A'}</p></div>
                                    <div><p className="text-[10px] text-slate-400 font-bold uppercase">Customer Success</p><p className="text-sm font-bold text-blue-600">{users.find(u => u.id === currentClient.csId)?.name || 'N/A'}</p></div>
                                </div>
                            </div>
                            <div className="bg-slate-900 p-6 rounded-2xl shadow-xl">
                                <h3 className="font-black text-white text-xs uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-white/10 pb-2"><DollarSign size={14}/> Dados Financeiros</h3>
                                <div className="space-y-4">
                                    <div><p className="text-[10px] text-slate-400 font-bold uppercase">Fee da Agência</p><p className="text-xl font-black text-emerald-400">{FORMATTER.format(currentClient.fee)}</p></div>
                                    <div><p className="text-[10px] text-slate-400 font-bold uppercase">Budget de Mídia</p><p className="text-xl font-black text-blue-400">{FORMATTER.format(currentClient.adBudget)}</p></div>
                                    <div><p className="text-[10px] text-slate-400 font-bold uppercase">Método</p><p className="text-sm font-bold text-white">{currentClient.paymentMethod}</p></div>
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-3 space-y-8">
                             <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[650px]">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="font-black text-slate-800 text-xs uppercase tracking-widest flex items-center gap-2"><FileBarChart size={18}/> Histórico de Relatórios</h3>
                                        <button onClick={() => handleOpenNewReport(currentClient.id)} className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2 hover:bg-emerald-700 transition-all shadow-md"><Plus size={16}/> Novo Relatório</button>
                                    </div>
                                    <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                                        {currentClientReports.length === 0 ? (
                                          <div className="flex flex-col items-center justify-center h-full text-slate-400 italic text-center p-8 border-2 border-dashed rounded-xl">
                                              <Layers size={40} className="mb-4 opacity-20"/>
                                              <p>Ainda não há relatórios para este cliente. Clique no botão acima para gerar o primeiro!</p>
                                          </div>
                                        ) : currentClientReports.map(report => (
                                            <div 
                                                key={report.id} 
                                                onClick={() => setSelectedReportId(report.id)}
                                                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedReportId === report.id ? 'bg-emerald-50 border-emerald-500 ring-4 ring-emerald-500/10 scale-[0.99]' : 'bg-white border-slate-100 hover:border-slate-300'}`}
                                            >
                                                <div className="flex justify-between items-center">
                                                    <div>
                                                        <p className="font-black text-slate-900 text-sm">{new Date(report.startDate).toLocaleDateString('pt-BR')} — {new Date(report.endDate).toLocaleDateString('pt-BR')}</p>
                                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight mt-0.5">{report.type}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-sm font-black text-emerald-600">{report.leads} <span className="text-[10px] text-slate-400 font-normal">Leads</span></p>
                                                        <p className="text-[10px] text-slate-400 font-bold uppercase">CPL {FORMATTER.format(report.spend / (report.leads || 1))}</p>
                                                    </div>
                                                </div>
                                                <div className="flex justify-end gap-3 mt-3 pt-3 border-t border-slate-200/50">
                                                    <button onClick={(e) => { e.stopPropagation(); handleEditReport(report); }} className="text-blue-600 text-[10px] font-black uppercase hover:underline flex items-center gap-1"><Edit2 size={10}/> Editar</button>
                                                    <button onClick={(e) => { e.stopPropagation(); handleDeleteReport(report.id); }} className="text-red-500 text-[10px] font-black uppercase hover:underline flex items-center gap-1"><Trash2 size={10}/> Apagar</button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="bg-[#0f172a] p-4 rounded-2xl shadow-2xl flex flex-col items-center justify-center min-h-[650px] relative overflow-hidden">
                                    <div className="absolute inset-0 bg-emerald-500/5 pointer-events-none"></div>
                                    {displayedReport ? (
                                        <div className="transform scale-[0.65] xl:scale-[0.55] origin-center -my-32">
                                            <WhatsAppCard report={displayedReport} client={currentClient} />
                                        </div>
                                    ) : (
                                        <div className="text-center text-slate-500 italic flex flex-col items-center gap-4 z-10">
                                            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-2"><MessageSquare className="text-slate-600"/></div>
                                            <p>Selecione um relatório à esquerda para gerar o card visual.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'kanban' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 h-[calc(100vh-200px)]">
                        {Object.values(TaskStatus).map(status => (
                            <div key={status} className="bg-slate-100/50 rounded-2xl p-4 flex flex-col border">
                                <h4 className="font-black text-[10px] uppercase tracking-widest text-slate-500 mb-4">{status}</h4>
                                <div className="flex-1 space-y-3 overflow-y-auto">
                                    {tasks.filter(t => t.status === status).map(task => (
                                        <div key={task.id} onClick={() => { setTaskToEdit(task); setIsTaskModalOpen(true); }} className="bg-white p-4 rounded-xl shadow-sm border hover:border-emerald-500 cursor-pointer transition-all">
                                            <h5 className="font-bold text-sm text-slate-900">{task.title}</h5>
                                            <p className="text-[10px] text-slate-400 mt-1 truncate">{task.description}</p>
                                            <div className="mt-3 flex justify-between items-center">
                                                <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${task.priority === TaskPriority.HIGH ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-600'}`}>{task.priority}</span>
                                                <img src={users.find(u => u.id === task.assigneeId)?.avatar} className="w-5 h-5 rounded-full" alt="assignee" />
                                            </div>
                                        </div>
                                    ))}
                                    <button onClick={() => { setTaskToEdit(null); setIsTaskModalOpen(true); }} className="w-full py-2 border-2 border-dashed rounded-xl text-slate-400 text-xs font-bold hover:bg-white"><Plus size={14} className="mx-auto"/></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'calendar' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {meetings.map(m => (
                            <div key={m.id} className="bg-white p-6 rounded-2xl border shadow-sm hover:border-emerald-500 transition-all">
                                <span className="bg-blue-50 text-blue-600 px-2 py-1 rounded text-[10px] font-black uppercase mb-3 inline-block">{m.type}</span>
                                <h4 className="font-black text-slate-900 mb-1">{m.title}</h4>
                                <div className="flex items-center gap-2 text-xs text-slate-400 mb-3"><Clock size={12}/> {m.date} às {m.time}</div>
                                <div className="flex -space-x-2 overflow-hidden">
                                    {m.attendees.map(attendee => (
                                        <img key={attendee.userId} className="inline-block h-6 w-6 rounded-full ring-2 ring-white" src={users.find(u => u.id === attendee.userId)?.avatar} alt={users.find(u => u.id === attendee.userId)?.name} title={users.find(u => u.id === attendee.userId)?.name} />
                                    ))}
                                </div>
                            </div>
                        ))}
                        <button onClick={handleOpenNewMeeting} className="border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-6 text-slate-400 hover:bg-emerald-50"><Plus size={32}/><span className="font-bold text-sm">Novo Agendamento</span></button>
                    </div>
                </div>
            )}

            {activeTab === 'chat' && (
                <div className="bg-white rounded-2xl border shadow-lg h-[calc(100vh-200px)] flex flex-col overflow-hidden">
                    <div className="p-4 border-b bg-slate-50 flex items-center gap-2"><MessageSquare size={18} className="text-emerald-600"/> <h3 className="font-bold">Chat de Equipe</h3></div>
                    <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50">
                        {chatMessages.map(msg => {
                            const sender = users.find(u => u.id === msg.userId);
                            const isMe = msg.userId === user.id;
                            return (
                                <div key={msg.id} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
                                    <img src={sender?.avatar} className="w-8 h-8 rounded-full shadow-sm" alt="sender"/>
                                    <div className={`p-3 rounded-2xl text-sm max-w-[70%] ${isMe ? 'bg-emerald-600 text-white rounded-tr-none' : 'bg-white border shadow-sm rounded-tl-none text-slate-700'}`}>
                                        {!isMe && <p className="text-[10px] font-black uppercase text-emerald-600 mb-1">{sender?.name}</p>}
                                        {msg.message}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <div className="p-4 bg-white border-t flex gap-2">
                        <input type="text" className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSendMessage()} placeholder="Sua mensagem..." />
                        <button onClick={handleSendMessage} className="bg-emerald-600 text-white p-3 rounded-xl shadow-lg shadow-emerald-200 hover:bg-emerald-700 active:scale-95 transition-all"><Send size={20}/></button>
                    </div>
                </div>
            )}

            {activeTab === 'team' && user.role === UserRole.ADMIN && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {users.map(u => (
                        <div key={u.id} className="bg-white p-6 rounded-2xl border shadow-sm text-center">
                            <img src={u.avatar} className="w-16 h-16 rounded-full mx-auto mb-4 border-4 border-slate-100" alt={u.name}/>
                            <h4 className="font-black text-slate-900">{u.name}</h4>
                            <span className="text-[10px] bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full uppercase font-black">{u.role}</span>
                            <div className="mt-6 flex gap-2 pt-4 border-t border-slate-50">
                                <button onClick={() => { setUserToEdit(u); setIsUserModalOpen(true); }} className="flex-1 py-2 bg-slate-50 rounded-lg"><Edit2 size={16} className="mx-auto text-slate-400"/></button>
                            </div>
                        </div>
                    ))}
                    <button onClick={() => { setUserToEdit(null); setIsUserModalOpen(true); }} className="border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-6 text-slate-400 hover:bg-emerald-50"><Plus size={32}/><span className="font-bold text-sm">Novo Acesso</span></button>
                </div>
            )}
            
            {activeTab === 'audit' && user.role === UserRole.ADMIN && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-6 border-b bg-slate-50 flex items-center gap-3">
                        <History size={20} className="text-emerald-600"/>
                        <h3 className="font-black text-slate-800 text-sm uppercase tracking-widest">Logs de Atividade do Sistema</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-black tracking-widest border-b">
                                <tr>
                                    <th className="px-6 py-4">Data/Hora</th>
                                    <th className="px-6 py-4">Usuário</th>
                                    <th className="px-6 py-4">Ação Realizada</th>
                                    <th className="px-6 py-4">Objeto da Ação</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {logs.map(log => (
                                    <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4 text-xs font-bold text-slate-400">{new Date(log.timestamp).toLocaleString('pt-BR')}</td>
                                        <td className="px-6 py-4 font-black text-slate-700">{log.userName}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${
                                              log.action.includes('CREATE') ? 'bg-emerald-50 text-emerald-600' : 
                                              log.action.includes('DELETE') ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'
                                            }`}>{log.action.replace('_', ' ')}</span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600 font-medium">{log.details}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
      </main>

      {/* Modais */}
      {user && (
          <>
            <ClientModal isOpen={isClientModalOpen} onClose={() => setIsClientModalOpen(false)} onSave={handleSaveClient} onDelete={handleDeleteClient} clientToEdit={clientToEdit} users={users} products={INITIAL_PRODUCTS} />
            {selectedClientId && (
                <ReportModal isOpen={isReportModalOpen} onClose={() => setIsReportModalOpen(false)} onSave={handleSaveReport} onDelete={handleDeleteReport} reportToEdit={reportToEdit} clientId={selectedClientId} />
            )}
            <UserModal isOpen={isUserModalOpen} onClose={() => setIsUserModalOpen(false)} onSave={(u:any) => { db.saveUser(u, user.id); loadData(); setIsUserModalOpen(false); }} userToEdit={userToEdit} />
            <TaskModal isOpen={isTaskModalOpen} onClose={() => setIsTaskModalOpen(false)} onSave={(t:any) => { db.saveTask(t, user.id); loadData(); setIsTaskModalOpen(false); }} taskToEdit={taskToEdit} users={users} />
            <MeetingModal isOpen={isMeetingModalOpen} onClose={() => setIsMeetingModalOpen(false)} onSave={handleSaveMeeting} meetingToEdit={meetingToEdit} clients={clients} users={users} />
          </>
      )}
    </div>
  );
}
