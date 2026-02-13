export interface TBid {
  id: number;
  companyName: string;
  url?: string | null;
  jobLink?: string | null;
  status?: string | null;
  applyDate: string;
  lastUpdated?: string | null;
  bidder?: string | null;
  caller?: string | null;
  lang?: string | null;
  agentId?: number | null;
  agent?: { id: number; companyName: string } | null;
  detail?: string | null;
  updatedAt?: string | null;
}
