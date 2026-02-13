export type AgentStatus = 'ACTIVE' | 'INACTIVE';

export interface IAgent {
  id: number;
  status?: AgentStatus;
  companyName: string;
  url?: string | null;
  workStartDate?: string | null;
  manager?: string | null;
  language?: string | null;
  bidder?: string | null;
  caller?: string | null;
  createdAt?: string;
  updatedAt?: string;
}
