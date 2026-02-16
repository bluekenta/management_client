const BID_AGENT_FRAGMENT = `
  agent {
    id
    companyName
  }
`;

const BID_BIDDER_FRAGMENT = `
  bidder {
    id
    name
  }
`;

const BID_CALLER_FRAGMENT = `
  caller {
    id
    name
  }
`;

const BID_FIELDS = `
  id
  companyName
  url
  jobLink
  step
  status
  applyDate
  lastUpdated
  lang
  bidderId
  callerId
  agentId
  detail
  ${BID_AGENT_FRAGMENT}
  ${BID_BIDDER_FRAGMENT}
  ${BID_CALLER_FRAGMENT}
`;

export const BIDS_QUERY = `
  query Bids {
    bids {
      ${BID_FIELDS}
    }
  }
`;

export const BIDS_BY_CONDITION_QUERY = `
  query BidsByCondition($condition: BidConditionInput!) {
    bidsByCondition(condition: $condition) {
      bids {
        ${BID_FIELDS}
      }
      total
    }
  }
`;

export const CREATE_BID_MUTATION = `
  mutation CreateBid($input: CreateBidInput!) {
    createBid(input: $input) {
      ${BID_FIELDS}
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
      ${BID_FIELDS}
    }
  }
`;
