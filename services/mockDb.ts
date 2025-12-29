
import { Client, WeeklyReport, AuditLog, User, Task, Meeting, ChatMessage, Notification, ServiceProduct, Contract, Invoice } from "../types";
import { INITIAL_CLIENTS, INITIAL_REPORTS, USERS, INITIAL_TASKS, INITIAL_MEETINGS, INITIAL_CHAT, INITIAL_NOTIFICATIONS, INITIAL_PRODUCTS, INITIAL_CONTRACTS, INITIAL_INVOICES } from "../constants";

// Keys for LocalStorage
const CLIENTS_KEY = 'agency_clients_v2';
const REPORTS_KEY = 'agency_reports_v2';
const LOGS_KEY = 'agency_logs_v1';
const TASKS_KEY = 'agency_tasks_v1';
const MEETINGS_KEY = 'agency_meetings_v1';
const CHAT_KEY = 'agency_chat_v1';
const NOTIFICATIONS_KEY = 'agency_notifications_v1';
const PRODUCTS_KEY = 'agency_products_v1';
const CONTRACTS_KEY = 'agency_contracts_v1';
const INVOICES_KEY = 'agency_invoices_v1';

export const db = {
  login: (email: string, password: string): User | undefined => {
    return USERS.find(u => u.email === email && u.password === password);
  },

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
    let action = "";
    
    if (existingIndex >= 0) {
      clients[existingIndex] = client;
      action = "UPDATE_CLIENT";
    } else {
      clients.push(client);
      action = "CREATE_CLIENT";
    }
    
    localStorage.setItem(CLIENTS_KEY, JSON.stringify(clients));
    db.logAction(userId, action, `Cliente: ${client.name}`);
  },

  deleteClient: (id: string, userId: string) => {
    const clients = db.getClients();
    const client = clients.find(c => c.id === id);
    const filteredClients = clients.filter(c => c.id !== id);
    localStorage.setItem(CLIENTS_KEY, JSON.stringify(filteredClients));
    db.logAction(userId, "DELETE_CLIENT", `Cliente ID: ${id} (${client?.name})`);
  },

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
    const existingIndex = reports.findIndex(r => r.id === report.id);
    let action = "";

    if (existingIndex >= 0) {
      reports[existingIndex] = report;
      action = "UPDATE_REPORT";
    } else {
      reports.push(report);
      action = "CREATE_REPORT";
    }
    localStorage.setItem(REPORTS_KEY, JSON.stringify(reports));
    db.logAction(userId, action, `Relatório Cliente ID: ${report.clientId}`);
  },

  // Tasks (Kanban)
  getTasks: (): Task[] => {
    const stored = localStorage.getItem(TASKS_KEY);
    if (!stored) {
      localStorage.setItem(TASKS_KEY, JSON.stringify(INITIAL_TASKS));
      return INITIAL_TASKS;
    }
    return JSON.parse(stored);
  },

  saveTask: (task: Task, userId: string) => {
    const tasks = db.getTasks();
    const existingIndex = tasks.findIndex(t => t.id === task.id);
    
    if (existingIndex >= 0) {
      tasks[existingIndex] = task;
    } else {
      tasks.push(task);
    }
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
  },

  deleteTask: (taskId: string) => {
      const tasks = db.getTasks();
      const filtered = tasks.filter(t => t.id !== taskId);
      localStorage.setItem(TASKS_KEY, JSON.stringify(filtered));
  },

  // Meetings (Agenda)
  getMeetings: (): Meeting[] => {
    const stored = localStorage.getItem(MEETINGS_KEY);
    if (!stored) {
      localStorage.setItem(MEETINGS_KEY, JSON.stringify(INITIAL_MEETINGS));
      return INITIAL_MEETINGS;
    }
    return JSON.parse(stored);
  },

  saveMeeting: (meeting: Meeting, userId: string) => {
    const meetings = db.getMeetings();
    const existingIndex = meetings.findIndex(m => m.id === meeting.id);
    
    // Check for new attendees to send notifications
    const oldMeeting = existingIndex >= 0 ? meetings[existingIndex] : null;
    const newAttendees = meeting.attendees.filter(a => 
        !oldMeeting || !oldMeeting.attendees.some(oa => oa.userId === a.userId)
    );

    newAttendees.forEach(att => {
        if (att.userId !== userId) { // Don't notify self
             db.createNotification({
                 id: Math.random().toString(36).substr(2, 9),
                 userId: att.userId,
                 type: 'INVITE',
                 title: 'Convite de Reunião',
                 message: `Você foi convidado para: ${meeting.title}`,
                 relatedId: meeting.id,
                 read: false,
                 createdAt: new Date().toISOString()
             });
        }
    });
    
    if (existingIndex >= 0) {
      meetings[existingIndex] = meeting;
    } else {
      meetings.push(meeting);
    }
    localStorage.setItem(MEETINGS_KEY, JSON.stringify(meetings));
  },

  deleteMeeting: (meetingId: string) => {
      const meetings = db.getMeetings();
      const filtered = meetings.filter(m => m.id !== meetingId);
      localStorage.setItem(MEETINGS_KEY, JSON.stringify(filtered));
  },

  respondToMeetingInvite: (meetingId: string, userId: string, status: 'confirmed' | 'declined') => {
      const meetings = db.getMeetings();
      const meeting = meetings.find(m => m.id === meetingId);
      if (meeting) {
          const attendee = meeting.attendees.find(a => a.userId === userId);
          if (attendee) {
              attendee.status = status;
              localStorage.setItem(MEETINGS_KEY, JSON.stringify(meetings));
          }
      }
  },

  // Notifications
  getNotifications: (userId: string): Notification[] => {
      const stored = localStorage.getItem(NOTIFICATIONS_KEY);
      let notifs: Notification[] = stored ? JSON.parse(stored) : INITIAL_NOTIFICATIONS;
      // Filter only for this user
      return notifs.filter(n => n.userId === userId).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  createNotification: (notif: Notification) => {
      const stored = localStorage.getItem(NOTIFICATIONS_KEY);
      let notifs: Notification[] = stored ? JSON.parse(stored) : INITIAL_NOTIFICATIONS;
      notifs.push(notif);
      localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifs));
  },

  markNotificationRead: (notifId: string) => {
      const stored = localStorage.getItem(NOTIFICATIONS_KEY);
      if(stored) {
          let notifs: Notification[] = JSON.parse(stored);
          const n = notifs.find(x => x.id === notifId);
          if (n) n.read = true;
          localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifs));
      }
  },

  deleteNotification: (notifId: string) => {
      const stored = localStorage.getItem(NOTIFICATIONS_KEY);
      if(stored) {
          let notifs: Notification[] = JSON.parse(stored);
          notifs = notifs.filter(x => x.id !== notifId);
          localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifs));
      }
  },

  // Chat
  getChatMessages: (currentUserId?: string): ChatMessage[] => {
    const stored = localStorage.getItem(CHAT_KEY);
    let msgs: ChatMessage[] = [];
    
    if (!stored) {
      localStorage.setItem(CHAT_KEY, JSON.stringify(INITIAL_CHAT));
      msgs = INITIAL_CHAT;
    } else {
      msgs = JSON.parse(stored);
    }

    if (currentUserId) {
        // Filter messages:
        // 1. Recipient is 'ALL'
        // 2. I sent the message (even if private)
        // 3. I am the recipient of the private message
        return msgs.filter(m => 
            !m.recipientId || 
            m.recipientId === 'ALL' || 
            m.userId === currentUserId || 
            m.recipientId === currentUserId
        );
    }
    
    return msgs;
  },

  sendChatMessage: (msg: ChatMessage) => {
    // 1. Save Message
    const stored = localStorage.getItem(CHAT_KEY);
    let msgs: ChatMessage[] = stored ? JSON.parse(stored) : INITIAL_CHAT;
    msgs.push(msg);
    localStorage.setItem(CHAT_KEY, JSON.stringify(msgs));

    // 2. Create Notifications
    const sender = USERS.find(u => u.id === msg.userId);
    const senderName = sender ? sender.name : 'Alguém';
    const preview = msg.message.length > 30 ? msg.message.substring(0, 30) + '...' : msg.message;

    // --- MENTIONS LOGIC ---
    const mentionedUsers = USERS.filter(u => msg.message.includes(`@${u.name}`));
    const mentionedIds = mentionedUsers.map(u => u.id);

    // Notify Mentioned Users
    mentionedUsers.forEach(user => {
        if (user.id !== msg.userId) {
            db.createNotification({
                id: Math.random().toString(36).substr(2, 9),
                userId: user.id,
                type: 'CHAT',
                title: `Você foi mencionado por ${senderName}`,
                message: preview,
                read: false,
                createdAt: new Date().toISOString()
            });
        }
    });

    // Handle Recipients
    if (msg.recipientId === 'ALL') {
        USERS.forEach(user => {
            if (user.id !== msg.userId && !mentionedIds.includes(user.id)) {
                db.createNotification({
                    id: Math.random().toString(36).substr(2, 9),
                    userId: user.id,
                    type: 'CHAT',
                    title: `Mensagem de ${senderName}`,
                    message: preview,
                    read: false,
                    createdAt: new Date().toISOString()
                });
            }
        });
    } else if (msg.recipientId) {
        if (!mentionedIds.includes(msg.recipientId) && msg.recipientId !== msg.userId) {
            db.createNotification({
                id: Math.random().toString(36).substr(2, 9),
                userId: msg.recipientId,
                type: 'CHAT',
                title: `Mensagem Privada de ${senderName}`,
                message: preview,
                read: false,
                createdAt: new Date().toISOString()
            });
        }
    }
  },

  // --- FINANCE (PRODUCTS, CONTRACTS, INVOICES) ---

  getProducts: (): ServiceProduct[] => {
      const stored = localStorage.getItem(PRODUCTS_KEY);
      if (!stored) {
          localStorage.setItem(PRODUCTS_KEY, JSON.stringify(INITIAL_PRODUCTS));
          return INITIAL_PRODUCTS;
      }
      return JSON.parse(stored);
  },

  saveProduct: (product: ServiceProduct) => {
      const items = db.getProducts();
      const idx = items.findIndex(i => i.id === product.id);
      if (idx >= 0) items[idx] = product;
      else items.push(product);
      localStorage.setItem(PRODUCTS_KEY, JSON.stringify(items));
  },

  deleteProduct: (id: string) => {
       const items = db.getProducts();
       localStorage.setItem(PRODUCTS_KEY, JSON.stringify(items.filter(i => i.id !== id)));
  },

  getContracts: (clientId?: string): Contract[] => {
      const stored = localStorage.getItem(CONTRACTS_KEY);
      let items: Contract[] = stored ? JSON.parse(stored) : INITIAL_CONTRACTS;
      if (!stored) localStorage.setItem(CONTRACTS_KEY, JSON.stringify(items));
      
      if (clientId) return items.filter(c => c.clientId === clientId);
      return items;
  },

  saveContract: (contract: Contract) => {
      const items = db.getContracts();
      const idx = items.findIndex(c => c.id === contract.id);
      if (idx >= 0) items[idx] = contract;
      else items.push(contract);
      localStorage.setItem(CONTRACTS_KEY, JSON.stringify(items));
  },

  getInvoices: (): Invoice[] => {
      const stored = localStorage.getItem(INVOICES_KEY);
      let items: Invoice[] = stored ? JSON.parse(stored) : INITIAL_INVOICES;
      if (!stored) localStorage.setItem(INVOICES_KEY, JSON.stringify(items));
      
      // Auto-update overdue status
      const today = new Date().toISOString().split('T')[0];
      let hasUpdates = false;
      items = items.map(inv => {
          if (inv.status === 'PENDING' && inv.dueDate < today) {
              hasUpdates = true;
              return { ...inv, status: 'OVERDUE' };
          }
          return inv;
      });
      if (hasUpdates) localStorage.setItem(INVOICES_KEY, JSON.stringify(items));

      return items;
  },

  payInvoice: (invoiceId: string, paidAmount: number, paidDate: string, notes?: string) => {
      const items = db.getInvoices();
      const idx = items.findIndex(i => i.id === invoiceId);
      if (idx >= 0) {
          const oldInv = items[idx];
          items[idx] = {
              ...oldInv,
              status: 'PAID',
              paidAmount,
              paidDate,
              notes
          };
          localStorage.setItem(INVOICES_KEY, JSON.stringify(items));

          // Notify Admin
          USERS.filter(u => u.role === 'ADMIN' || u.role === 'FINANCIAL').forEach(adm => {
              db.createNotification({
                  id: Math.random().toString(),
                  userId: adm.id,
                  type: 'FINANCE',
                  title: 'Pagamento Recebido',
                  message: `Fatura de ${oldInv.clientName} paga (R$ ${paidAmount})`,
                  read: false,
                  createdAt: new Date().toISOString()
              });
          });
      }
  },

  // Audit Logs
  getLogs: (): AuditLog[] => {
    const stored = localStorage.getItem(LOGS_KEY);
    if (!stored) return [];
    return JSON.parse(stored).sort((a: AuditLog, b: AuditLog) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  },

  logAction: (userId: string, action: string, details: string) => {
    const logs = db.getLogs();
    const user = USERS.find(u => u.id === userId);
    const newLog: AuditLog = {
      id: Math.random().toString(36).substr(2, 9),
      userId,
      userName: user?.name || 'Unknown',
      action,
      details,
      timestamp: new Date().toISOString()
    };
    logs.unshift(newLog); // Add to beginning
    localStorage.setItem(LOGS_KEY, JSON.stringify(logs.slice(0, 100))); // Keep last 100 logs
  }
};
