// MVP Mode - Local storage helper for testing without backend
interface Button {
  name: string;
  url: string;
  responseMessage: string;
}

interface InstagramPost {
  id: string;
  media_url: string;
  thumbnail_url?: string;
  caption?: string;
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';
  timestamp: string;
}

export interface MVPAutomation {
  id: string;
  name: string;
  accountName: string;
  postUrl: string;
  selectedPosts?: InstagramPost[];
  keywords: string[];
  dmTemplate: string;
  messageType?: 'simple' | 'link' | 'button';
  linkUrl?: string;
  buttons?: Button[];
  createdAt: string;
  active?: boolean;
}

const MVP_KEY = 'comente_dm_mvp_mode';
const AUTOMATIONS_KEY = 'comente_dm_mvp_automations';

export const isMVPMode = (): boolean => {
  return localStorage.getItem(MVP_KEY) === 'true';
};

export const enableMVPMode = () => {
  localStorage.setItem(MVP_KEY, 'true');
};

export const disableMVPMode = () => {
  localStorage.removeItem(MVP_KEY);
  localStorage.removeItem(AUTOMATIONS_KEY);
};

export const getMVPAutomations = (): MVPAutomation[] => {
  const data = localStorage.getItem(AUTOMATIONS_KEY);
  return data ? JSON.parse(data) : [];
};

export const addMVPAutomation = (automation: Omit<MVPAutomation, 'id' | 'createdAt'>): MVPAutomation => {
  const newAutomation: MVPAutomation = {
    ...automation,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
  };

  const automations = getMVPAutomations();
  automations.push(newAutomation);
  localStorage.setItem(AUTOMATIONS_KEY, JSON.stringify(automations));

  return newAutomation;
};

export const updateMVPAutomation = (id: string, updates: Partial<MVPAutomation>): boolean => {
  const automations = getMVPAutomations();
  const index = automations.findIndex(automation => automation.id === id);

  if (index === -1) return false;

  automations[index] = { ...automations[index], ...updates };
  localStorage.setItem(AUTOMATIONS_KEY, JSON.stringify(automations));

  return true;
};

export const deleteMVPAutomation = (id: string): boolean => {
  const automations = getMVPAutomations();
  const filteredAutomations = automations.filter(automation => automation.id !== id);

  if (filteredAutomations.length === automations.length) return false;

  localStorage.setItem(AUTOMATIONS_KEY, JSON.stringify(filteredAutomations));

  return true;
};

// Mock data for MVP insights
export const getMVPInsights = () => {
  const automations = getMVPAutomations();
  return {
    totalAutomations: automations.length,
    totalComments: Math.floor(Math.random() * 100) + automations.length * 5, // Simulated
    totalMessages: Math.floor(Math.random() * 80) + automations.length * 3, // Simulated
  };
};
