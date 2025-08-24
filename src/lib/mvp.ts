// MVP Mode - Local storage helper for testing without backend
interface Button {
  name: string;
  url: string;
  responseMessage: string;
}

export interface MVPAutomation {
  id: string;
  name: string;
  accountName: string;
  postUrl: string;
  keywords: string[];
  dmTemplate: string;
  messageType?: 'simple' | 'link' | 'button';
  linkUrl?: string;
  buttons?: Button[];
  createdAt: string;
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

// Mock data for MVP insights
export const getMVPInsights = () => {
  const automations = getMVPAutomations();
  return {
    totalAutomations: automations.length,
    totalComments: Math.floor(Math.random() * 100) + automations.length * 5, // Simulated
    totalMessages: Math.floor(Math.random() * 80) + automations.length * 3, // Simulated
  };
};
