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
      lang
      bidder
      caller
    }
  }
`;

export const BIDS_BY_CONDITION_QUERY = `
  query BidsByCondition($condition: BidConditionInput!) {
    bidsByCondition(condition: $condition) {
      id
      companyName
      url
      jobLink
      status
      applyDate
      lastUpdated
      lang
      bidder
      caller
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
      lastUpdated
      lang
      bidder
      caller
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
      lang
      bidder
      caller
    }
  }
`;
