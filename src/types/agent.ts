export type AgentStatus = 'ACTIVE' | 'INACTIVE';

export interface IAgent {
  id: number;
  status?: AgentStatus;
  companyName: string;
  url?: string | null;
  workStartDate?: string | null;
  manager?: string | null;
  language?: string | null;
  bidderId?: number | null;
  callerId?: number | null;
  bidder?: { id: number; name: string } | null;
  caller?: { id: number; name: string } | null;
  createdAt?: string;
  updatedAt?: string;
}
