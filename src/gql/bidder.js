const BIDDER_FIELDS = `
  id
  name
`;

export const BIDDERS_QUERY = `
  query Bidders {
    bidders {
      ${BIDDER_FIELDS}
    }
  }
`;

export const CREATE_BIDDER_MUTATION = `
  mutation CreateBidder($input: CreateBidderInput!) {
    createBidder(input: $input) {
      ${BIDDER_FIELDS}
    }
  }
`;

export const UPDATE_BIDDER_MUTATION = `
  mutation UpdateBidder($id: Int!, $input: UpdateBidderInput!) {
    updateBidder(id: $id, input: $input) {
      ${BIDDER_FIELDS}
    }
  }
`;

export const DELETE_BIDDER_MUTATION = `
  mutation DeleteBidder($id: Int!) {
    deleteBidder(id: $id)
  }
`;
