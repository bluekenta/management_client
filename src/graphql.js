const graphqlUrl = import.meta.env.VITE_GRAPHQL_URL ?? '/graphql';

export async function graphql(query, variables = {}) {
  const res = await fetch(graphqlUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  if (json.errors?.length) throw new Error(json.errors[0].message);
  return json.data;
}

export const BIDS_QUERY = `
  query Bids {
    bids {
      id
      companyName
      url
      jobLink
      status
      applyDate
      updatedAt
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
      status
    }
  }
`;
