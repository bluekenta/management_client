export interface IBidConditionInput {
  step?: string;
  status?: string;
  bidderId?: number;
  callerId?: number;
  lang?: string;
  companyName?: string;
  /** YYYY-MM-DD; with endDate defines range. Empty = use default (last 7 days). */
  startDate?: string;
  /** YYYY-MM-DD; with startDate defines range. Empty = use default. */
  endDate?: string;
}
