export const BID_STATUSES_QUERY = `
  query BidStatuses {
    bidStatuses
  }
`;

export const BIDS_QUERY = `
  query Bids {
    bids {
      id
      companyName
      url
      jobLink
      status
      applyDate
      lastUpdated
    }
  }
`;

export const BID_BY_STATUS_QUERY = `
  query BidsByStatus($status: String!) {
    bidsByStatus(status: $status) {
      id
      companyName
      url
      jobLink
      status
      applyDate
      lastUpdated
    }
  }
`;

export const CREATE_BID_MUTATION = `
  mutation CreateBid($input: CreateBidInput!) {
    createBid(input: $input) {
      id
      companyName
      url
      jobLink
      status
      applyDate
    }
  }
`;

export const DELETE_BID_MUTATION = `
  mutation DeleteBid($id: Int!) {
    deleteBid(id: $id)
  }
`;

export const UPDATE_BID_MUTATION = `
  mutation UpdateBid($id: Int!, $input: UpdateBidInput!) {
    updateBid(id: $id, input: $input) {
      id
      companyName
      url
      jobLink
      applyDate
      status
      lastUpdated
    }
  }
`;
