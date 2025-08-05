export interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  title: string;
  company: string;
  industry: string;
  leadSource: string;
  assignedTo: string;
  status: 'New' | 'Contacted' | 'Qualified' | 'Nurturing';
  createdAt: string;
  updatedAt?: string;
  aiEmail: {
    subject: string;
    preview: string;
    fullText: string;
    score: number;
    personalizations: string[];
  };
  responseStatus: 'Responded' | 'Meeting Scheduled' | 'No Response' | null;
  responseRate: 'positive' | 'none' | null;
}

export interface Activity {
  id: string;
  type: 'webhook' | 'ai' | 'email' | 'response' | 'success';
  message: string;
  timestamp: string;
  leadId?: string;
}

