export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  type?: 'requirement' | 'clarification' | 'general';
  requirements?: ExtractedRequirement[];
}

export interface ExtractedRequirement {
  id: string;
  title: string;
  description: string;
  type: 'functional' | 'non-functional';
  priority: 'high' | 'medium' | 'low';
  category: string;
  acceptance_criteria: string[];
  estimated_effort: string;
  dependencies: string[];
  created_at?: Date;
  updated_at?: Date;
}

export interface JiraConfig {
  url: string;
  token: string;
  projectKey: string;
}

export interface TrelloConfig {
  token: string;
  listId: string;
}

export interface ChatResponse {
  response: string;
  type: 'requirement' | 'clarification' | 'general';
  requirements: ExtractedRequirement[];
  status?: 'success' | 'fallback' | 'error';
}

export interface ApiStatus {
  status: 'connected' | 'disconnected' | 'fallback';
  message: string;
  timestamp?: Date;
}