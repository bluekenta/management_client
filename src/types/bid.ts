export interface IBidConditionInput {
  status?: string;
  bidder?: string;
  caller?: string;
  lang?: string;
  companyName?: string;
  /** YYYY-MM-DD; with endDate defines range. Empty = use default (last 7 days). */
  startDate?: string;
  /** YYYY-MM-DD; with startDate defines range. Empty = use default. */
  endDate?: string;
}
