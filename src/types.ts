export interface ComplaintContext {
  issue: string;
  category: string;
  subcategory: string;
  location: string;
  time: string;
  severity: string;
  description: string;
  attachments: string[];
  priority?: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  context?: Partial<ComplaintContext>;
}

export const INITIAL_CONTEXT: ComplaintContext = {
  issue: '',
  category: '',
  subcategory: '',
  location: '',
  time: '',
  severity: '',
  description: '',
  attachments: [],
};
