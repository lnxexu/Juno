// Mock API Layer - Simulates NestJS Backend with PostgreSQL

// Simulate API delay
const delay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

// Types matching your PostgreSQL schema
export interface User {
  id: string;
  email: string;
  name: string;
  companyName: string;
  plan: 'starter' | 'professional' | 'enterprise';
  createdAt: string;
}

export interface Conversation {
  id: number;
  customerId: string;
  customerName: string;
  lastMessage: string;
  timestamp: string;
  source: 'facebook' | 'instagram' | 'web';
  unread: boolean;
  aiHandled: boolean;
}

export interface Message {
  id: number;
  conversationId: number;
  sender: 'customer' | 'ai' | 'agent';
  text: string;
  timestamp: string;
  aiGenerated?: boolean;
}

export interface Lead {
  id: number;
  name: string;
  email: string;
  phone: string;
  source: 'facebook' | 'instagram' | 'web';
  status: 'new' | 'contacted' | 'converted';
  interest: string;
  date: string;
  value: string;
}

export interface KnowledgeBaseItem {
  id: number;
  question: string;
  answer: string;
  category: string;
  embedding?: number[]; // OpenAI embeddings
}

export interface AnalyticsData {
  messagesHandled: Array<{ date: string; messages: number; aiHandled: number }>;
  conversionRate: Array<{ month: string; rate: number }>;
  responseTime: Array<{ week: string; time: number }>;
  channelDistribution: Array<{ name: string; value: number; color: string }>;
}

// Mock data storage (simulates PostgreSQL)
const mockDatabase = {
  user: {
    id: '1',
    email: 'john@business.com',
    name: 'John Doe',
    companyName: 'My Business LLC',
    plan: 'professional' as const,
    createdAt: '2026-01-15',
  },
  conversations: [
    { id: 1, customerId: 'c1', customerName: 'Sarah Miller', lastMessage: 'Do you offer wholesale pricing?', timestamp: new Date(Date.now() - 2 * 60000).toISOString(), source: 'facebook' as const, unread: true, aiHandled: true },
    { id: 2, customerId: 'c2', customerName: 'Mike Chen', lastMessage: 'What are your shipping options?', timestamp: new Date(Date.now() - 15 * 60000).toISOString(), source: 'instagram' as const, unread: false, aiHandled: true },
    { id: 3, customerId: 'c3', customerName: 'Emma Wilson', lastMessage: 'I need help with my order', timestamp: new Date(Date.now() - 60 * 60000).toISOString(), source: 'web' as const, unread: false, aiHandled: false },
    { id: 4, customerId: 'c4', customerName: 'David Brown', lastMessage: 'Are you open on weekends?', timestamp: new Date(Date.now() - 120 * 60000).toISOString(), source: 'facebook' as const, unread: false, aiHandled: true },
    { id: 5, customerId: 'c5', customerName: 'Lisa Anderson', lastMessage: 'Product inquiry', timestamp: new Date(Date.now() - 180 * 60000).toISOString(), source: 'instagram' as const, unread: false, aiHandled: true },
  ],
  messages: new Map<number, Message[]>([
    [1, [
      { id: 1, conversationId: 1, sender: 'customer', text: 'Hi! Do you offer wholesale pricing for bulk orders?', timestamp: new Date(Date.now() - 5 * 60000).toISOString() },
      { id: 2, conversationId: 1, sender: 'ai', text: 'Hello! Yes, we do offer wholesale pricing for orders of 50+ units. Our wholesale discount starts at 20% off retail prices. Would you like me to send you our wholesale catalog?', timestamp: new Date(Date.now() - 4 * 60000).toISOString(), aiGenerated: true },
      { id: 3, conversationId: 1, sender: 'customer', text: 'Yes please! What is the minimum order quantity?', timestamp: new Date(Date.now() - 3 * 60000).toISOString() },
      { id: 4, conversationId: 1, sender: 'ai', text: 'The minimum order quantity is 50 units per SKU. I can connect you with our sales team to discuss your specific needs. What products are you interested in?', timestamp: new Date(Date.now() - 2 * 60000).toISOString(), aiGenerated: true },
    ]],
  ]),
  leads: [
    { id: 1, name: 'Sarah Miller', email: 'sarah.miller@example.com', phone: '+1 (555) 123-4567', source: 'facebook' as const, status: 'new' as const, interest: 'Wholesale pricing', date: '2026-04-18', value: '$5,000' },
    { id: 2, name: 'Mike Chen', email: 'mike.chen@example.com', phone: '+1 (555) 234-5678', source: 'instagram' as const, status: 'contacted' as const, interest: 'Product catalog', date: '2026-04-18', value: '$1,200' },
    { id: 3, name: 'Emma Wilson', email: 'emma.wilson@example.com', phone: '+1 (555) 345-6789', source: 'web' as const, status: 'converted' as const, interest: 'Premium package', date: '2026-04-17', value: '$3,500' },
    { id: 4, name: 'David Brown', email: 'david.brown@example.com', phone: '+1 (555) 456-7890', source: 'facebook' as const, status: 'contacted' as const, interest: 'Shipping options', date: '2026-04-17', value: '$800' },
    { id: 5, name: 'Lisa Anderson', email: 'lisa.anderson@example.com', phone: '+1 (555) 567-8901', source: 'instagram' as const, status: 'new' as const, interest: 'Bulk order', date: '2026-04-16', value: '$8,500' },
    { id: 6, name: 'James Taylor', email: 'james.taylor@example.com', phone: '+1 (555) 678-9012', source: 'web' as const, status: 'contacted' as const, interest: 'Custom order', date: '2026-04-16', value: '$2,100' },
  ],
  knowledgeBase: [
    { id: 1, question: 'What are your business hours?', answer: 'We are open Monday-Friday 9AM-6PM EST and Saturday 10AM-4PM EST. We are closed on Sundays.', category: 'General' },
    { id: 2, question: 'Do you offer wholesale pricing?', answer: 'Yes! We offer wholesale pricing for orders of 50+ units with a 20% discount. Contact our sales team for details.', category: 'Pricing' },
    { id: 3, question: 'What is your return policy?', answer: 'We offer a 30-day money-back guarantee. Items must be unused and in original packaging. Return shipping is free.', category: 'Returns' },
    { id: 4, question: 'What payment methods do you accept?', answer: 'We accept all major credit cards (Visa, MasterCard, Amex), PayPal, and bank transfers for wholesale orders.', category: 'Payment' },
    { id: 5, question: 'Do you ship internationally?', answer: 'Yes, we ship to over 50 countries worldwide. Shipping costs and delivery times vary by location.', category: 'Shipping' },
  ],
};

// API Service - simulates NestJS controllers
export const api = {
  // Auth endpoints
  auth: {
    async getCurrentUser(): Promise<User> {
      await delay();
      return mockDatabase.user;
    },
    async updateProfile(data: Partial<User>): Promise<User> {
      await delay();
      Object.assign(mockDatabase.user, data);
      return mockDatabase.user;
    },
  },

  // Conversations endpoints (Meta Graph API integration)
  conversations: {
    async getAll(): Promise<Conversation[]> {
      await delay();
      return mockDatabase.conversations;
    },
    async getById(id: number): Promise<Conversation | undefined> {
      await delay();
      return mockDatabase.conversations.find(c => c.id === id);
    },
    async getMessages(conversationId: number): Promise<Message[]> {
      await delay();
      return mockDatabase.messages.get(conversationId) || [];
    },
    async sendMessage(conversationId: number, text: string, useAI: boolean): Promise<Message> {
      await delay(1000); // Simulate OpenAI API call

      const messages = mockDatabase.messages.get(conversationId) || [];
      const newMessage: Message = {
        id: messages.length + 1,
        conversationId,
        sender: useAI ? 'ai' : 'agent',
        text: useAI ? `AI Response: ${text}` : text,
        timestamp: new Date().toISOString(),
        aiGenerated: useAI,
      };

      messages.push(newMessage);
      mockDatabase.messages.set(conversationId, messages);

      // Update conversation
      const conv = mockDatabase.conversations.find(c => c.id === conversationId);
      if (conv) {
        conv.lastMessage = text;
        conv.timestamp = newMessage.timestamp;
      }

      return newMessage;
    },
    async markAsRead(conversationId: number): Promise<void> {
      await delay(100);
      const conv = mockDatabase.conversations.find(c => c.id === conversationId);
      if (conv) conv.unread = false;
    },
  },

  // Leads endpoints
  leads: {
    async getAll(): Promise<Lead[]> {
      await delay();
      return mockDatabase.leads;
    },
    async updateStatus(id: number, status: Lead['status']): Promise<Lead> {
      await delay();
      const lead = mockDatabase.leads.find(l => l.id === id);
      if (!lead) throw new Error('Lead not found');
      lead.status = status;
      return lead;
    },
    async exportCSV(): Promise<Blob> {
      await delay();
      const csv = mockDatabase.leads.map(l =>
        `${l.name},${l.email},${l.phone},${l.source},${l.status},${l.interest},${l.value},${l.date}`
      ).join('\n');
      return new Blob([csv], { type: 'text/csv' });
    },
  },

  // AI Training endpoints (OpenAI embeddings + vector DB)
  aiTraining: {
    async getKnowledgeBase(): Promise<KnowledgeBaseItem[]> {
      await delay();
      return mockDatabase.knowledgeBase;
    },
    async addKnowledgeItem(item: Omit<KnowledgeBaseItem, 'id' | 'embedding'>): Promise<KnowledgeBaseItem> {
      await delay(1500); // Simulate OpenAI embedding generation
      const newItem: KnowledgeBaseItem = {
        ...item,
        id: mockDatabase.knowledgeBase.length + 1,
        embedding: Array(1536).fill(0).map(() => Math.random()), // Mock embedding vector
      };
      mockDatabase.knowledgeBase.push(newItem);
      return newItem;
    },
    async deleteKnowledgeItem(id: number): Promise<void> {
      await delay();
      const index = mockDatabase.knowledgeBase.findIndex(k => k.id === id);
      if (index !== -1) mockDatabase.knowledgeBase.splice(index, 1);
    },
    async updateKnowledgeItem(id: number, data: Partial<KnowledgeBaseItem>): Promise<KnowledgeBaseItem> {
      await delay(1500);
      const item = mockDatabase.knowledgeBase.find(k => k.id === id);
      if (!item) throw new Error('Item not found');
      Object.assign(item, data);
      return item;
    },
    async trainModel(): Promise<{ success: boolean; accuracy: number }> {
      await delay(3000); // Simulate model training
      return { success: true, accuracy: 0.94 };
    },
    async testAI(question: string): Promise<{ answer: string; confidence: number }> {
      await delay(1000); // Simulate OpenAI API call
      const kb = mockDatabase.knowledgeBase.find(k =>
        k.question.toLowerCase().includes(question.toLowerCase())
      );
      return {
        answer: kb?.answer || "I don't have that information in my knowledge base yet. Would you like me to connect you with a human agent?",
        confidence: kb ? 0.95 : 0.45,
      };
    },
  },

  // Analytics endpoints
  analytics: {
    async getStats(): Promise<{
      totalConversations: number;
      leadsCaptured: number;
      responseRate: number;
      conversionRate: number;
    }> {
      await delay();
      return {
        totalConversations: 1248,
        leadsCaptured: 342,
        responseRate: 98.7,
        conversionRate: 27.4,
      };
    },
    async getChartData(): Promise<AnalyticsData> {
      await delay();
      return {
        messagesHandled: [
          { date: 'Apr 12', messages: 65, aiHandled: 58 },
          { date: 'Apr 13', messages: 78, aiHandled: 72 },
          { date: 'Apr 14', messages: 90, aiHandled: 84 },
          { date: 'Apr 15', messages: 81, aiHandled: 75 },
          { date: 'Apr 16', messages: 95, aiHandled: 89 },
          { date: 'Apr 17', messages: 108, aiHandled: 101 },
          { date: 'Apr 18', messages: 120, aiHandled: 115 },
        ],
        conversionRate: [
          { month: 'Jan', rate: 18 },
          { month: 'Feb', rate: 22 },
          { month: 'Mar', rate: 25 },
          { month: 'Apr', rate: 27 },
        ],
        responseTime: [
          { week: 'Week 1', time: 4.2 },
          { week: 'Week 2', time: 3.8 },
          { week: 'Week 3', time: 2.5 },
          { week: 'Week 4', time: 1.2 },
        ],
        channelDistribution: [
          { name: 'Facebook', value: 45, color: '#3b5998' },
          { name: 'Instagram', value: 35, color: '#E4405F' },
          { name: 'Web Chat', value: 20, color: '#6366f1' },
        ],
      };
    },
  },

  // Settings endpoints
  settings: {
    async getIntegrations(): Promise<Array<{
      id: string;
      name: string;
      status: 'active' | 'inactive';
      accountName?: string;
    }>> {
      await delay();
      return [
        { id: 'fb', name: 'Facebook Messenger', status: 'active', accountName: '@mybusiness' },
        { id: 'ig', name: 'Instagram Direct', status: 'active', accountName: '@mybusiness' },
        { id: 'web', name: 'Website Chat Widget', status: 'active', accountName: 'mybusiness.com' },
      ];
    },
    async toggleAI(enabled: boolean): Promise<{ success: boolean }> {
      await delay();
      return { success: true };
    },
  },
};
