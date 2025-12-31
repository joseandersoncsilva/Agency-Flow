
import { Client, WeeklyReport, AuditLog, User, Task, Meeting, ChatMessage, Notification, ServiceProduct, Contract, Invoice } from "../types";
import { INITIAL_CLIENTS, INITIAL_REPORTS, USERS, INITIAL_TASKS, INITIAL_MEETINGS, INITIAL_CHAT, INITIAL_NOTIFICATIONS, INITIAL_PRODUCTS, INITIAL_CONTRACTS, INITIAL_INVOICES } from "../constants";

const CLIENTS_KEY = 'agency_clients_v3';
const REPORTS_KEY = 'agency_reports_v3';
const LOGS_KEY = 'agency_logs_v2';
const USERS_KEY = 'agency_users_v2';
const NOTIFICATIONS_KEY = 'agency_notifications_v2';
const TASKS_KEY = 'agency_tasks_v2';
const MEETINGS_KEY = 'agency_meetings_v2';
const INVOICES_KEY = 'agency_invoices_v2';
const CHAT_KEY = 'agency_chat_v2';

export const db = {
  // --- USUÁRIOS ---
  getUsers: (): User[] => {
    const stored = localStorage.getItem(USERS_KEY);
    if (!stored) {
      localStorage.setItem(USERS_KEY, JSON.stringify(USERS));
      return USERS;
    }
    return JSON.parse(stored);
  },

  saveUser: (user: User, adminId: string) => {
    const users = db.getUsers();
    const existingIndex = users.findIndex(u => u.id === user.id);
    if (existingIndex >= 0) users[existingIndex] = user;
    else {
      if (!user.id) user.id = Math.random().toString(36).substr(2, 9);
      users.push(user);
    }
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    db.logAction(adminId, "SAVE_USER", `Usuário: ${user.name}`);
  },

  deleteUser: (id: string, adminId: string) => {
    const users = db.getUsers().filter(u => u.id !== id);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    db.logAction(adminId, "DELETE_USER", `ID: ${id}`);
  },

  login: (email: string, password: string): User | undefined => {
    return db.getUsers().find(u => u.email === email && u.password === password);
  },

  // --- CLIENTES ---
  getClients: (): Client[] => {
    const stored = localStorage.getItem(CLIENTS_KEY);
    if (!stored) {
      localStorage.setItem(CLIENTS_KEY, JSON.stringify(INITIAL_CLIENTS));
      return INITIAL_CLIENTS;
    }
    return JSON.parse(stored);
  },

  saveClient: (client: Client, userId: string) => {
    const clients = db.getClients();
    const existingIndex = clients.findIndex(c => c.id === client.id);
    if (existingIndex >= 0) clients[existingIndex] = client;
    else {
      if (!client.id) client.id = Math.random().toString(36).substr(2, 9);
      clients.push(client);
    }
    localStorage.setItem(CLIENTS_KEY, JSON.stringify(clients));
    db.logAction(userId, "SAVE_CLIENT", `Cliente: ${client.name}`);
  },

  deleteClient: (id: string, userId: string) => {
    const filtered = db.getClients().filter(c => c.id !== id);
    localStorage.setItem(CLIENTS_KEY, JSON.stringify(filtered));
    db.logAction(userId, "DELETE_CLIENT", `ID: ${id}`);
  },

  // --- RELATÓRIOS ---
  getReports: (): WeeklyReport[] => {
    const stored = localStorage.getItem(REPORTS_KEY);
    if (!stored) {
      localStorage.setItem(REPORTS_KEY, JSON.stringify(INITIAL_REPORTS));
      return INITIAL_REPORTS;
    }
    return JSON.parse(stored);
  },

  saveReport: (report: WeeklyReport, userId: string) => {
    const reports = db.getReports();
    const idx = reports.findIndex(r => r.id === report.id);
    if (idx >= 0) reports[idx] = report;
    else {
      if (!report.id) report.id = Math.random().toString(36).substr(2, 9);
      reports.push(report);
    }
    localStorage.setItem(REPORTS_KEY, JSON.stringify(reports));
    db.logAction(userId, "SAVE_REPORT", `ID Rel: ${report.id}`);
  },

  deleteReport: (id: string) => {
    const filtered = db.getReports().filter(r => r.id !== id);
    localStorage.setItem(REPORTS_KEY, JSON.stringify(filtered));
  },

  // --- TAREFAS (KANBAN) ---
  getTasks: (): Task[] => {
    const stored = localStorage.getItem(TASKS_KEY);
    return stored ? JSON.parse(stored) : INITIAL_TASKS;
  },

  saveTask: (task: Task, userId: string) => {
    const tasks = db.getTasks();
    const idx = tasks.findIndex(t => t.id === task.id);
    if (idx >= 0) tasks[idx] = task;
    else tasks.push(task);
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
  },

  deleteTask: (id: string) => {
    const filtered = db.getTasks().filter(t => t.id !== id);
    localStorage.setItem(TASKS_KEY, JSON.stringify(filtered));
  },

  // --- REUNIÕES ---
  getMeetings: (): Meeting[] => {
    const stored = localStorage.getItem(MEETINGS_KEY);
    return stored ? JSON.parse(stored) : INITIAL_MEETINGS;
  },

  saveMeeting: (meeting: Meeting) => {
    const items = db.getMeetings();
    const idx = items.findIndex(m => m.id === meeting.id);
    if (idx >= 0) items[idx] = meeting;
    else items.push(meeting);
    localStorage.setItem(MEETINGS_KEY, JSON.stringify(items));
  },

  // --- FINANCEIRO ---
  getInvoices: (): Invoice[] => {
    const stored = localStorage.getItem(INVOICES_KEY);
    return stored ? JSON.parse(stored) : INITIAL_INVOICES;
  },

  payInvoice: (id: string, userId: string) => {
    const invs = db.getInvoices();
    const idx = invs.findIndex(i => i.id === id);
    if (idx >= 0) {
      invs[idx].status = 'PAID';
      invs[idx].paidDate = new Date().toISOString().split('T')[0];
      localStorage.setItem(INVOICES_KEY, JSON.stringify(invs));
      db.logAction(userId, "PAY_INVOICE", `Fatura ID: ${id}`);
    }
  },

  // --- CHAT ---
  getChatMessages: (): ChatMessage[] => {
    const stored = localStorage.getItem(CHAT_KEY);
    return stored ? JSON.parse(stored) : INITIAL_CHAT;
  },

  sendChatMessage: (msg: ChatMessage) => {
    const msgs = db.getChatMessages();
    msgs.push(msg);
    localStorage.setItem(CHAT_KEY, JSON.stringify(msgs));
  },

  // --- SISTEMA ---
  getNotifications: (userId: string): Notification[] => {
      const stored = localStorage.getItem(NOTIFICATIONS_KEY);
      const notifs: Notification[] = stored ? JSON.parse(stored) : INITIAL_NOTIFICATIONS;
      return notifs.filter(n => n.userId === userId);
  },

  getLogs: (): AuditLog[] => {
    const stored = localStorage.getItem(LOGS_KEY);
    return stored ? JSON.parse(stored).sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()) : [];
  },

  logAction: (userId: string, action: string, details: string) => {
    const logs = db.getLogs();
    const user = db.getUsers().find(u => u.id === userId);
    const newLog: AuditLog = {
      id: Math.random().toString(36).substr(2, 9),
      userId,
      userName: user?.name || 'Sistema',
      action,
      details,
      timestamp: new Date().toISOString()
    };
    logs.unshift(newLog);
    localStorage.setItem(LOGS_KEY, JSON.stringify(logs.slice(0, 100)));
  },
  
  getContracts: () => INITIAL_CONTRACTS
};
