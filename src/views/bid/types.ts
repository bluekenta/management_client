export interface TBid {
  id: number;
  companyName: string;
  url?: string | null;
  jobLink?: string | null;
  country?: string | null;
  step?: string | null;
  status?: string | null;
  applyDate: string;
  lastUpdated?: string | null;
  bidderId?: number | null;
  callerId?: number | null;
  bidder?: { id: number; name: string } | null;
  caller?: { id: number; name: string } | null;
  lang?: string | null;
  agentId?: number | null;
  agent?: { id: number; companyName: string } | null;
  detail?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}
