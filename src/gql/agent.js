export const AGENTS_QUERY = `
  query Agents {
    agents {
      id
      status
      companyName
      url
      workStartDate
      manager
      language
      bidder
      caller
      createdAt
      updatedAt
    }
  }
`;

export const ACTIVE_AGENTS_QUERY = `
  query ActiveAgents {
    activeAgents {
      id
      companyName
    }
  }
`;

export const AGENT_QUERY = `
  query Agent($id: Int!) {
    agent(id: $id) {
      id
      status
      companyName
      url
      workStartDate
      manager
      language
      bidder
      caller
      createdAt
      updatedAt
    }
  }
`;

export const CREATE_AGENT_MUTATION = `
  mutation CreateAgent($input: CreateAgentInput!) {
    createAgent(input: $input) {
      id
      status
      companyName
      url
      workStartDate
      manager
      language
      bidder
      caller
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_AGENT_MUTATION = `
  mutation UpdateAgent($id: Int!, $input: UpdateAgentInput!) {
    updateAgent(id: $id, input: $input) {
      id
      status
      companyName
      url
      workStartDate
      manager
      language
      bidder
      caller
      createdAt
      updatedAt
    }
  }
`;

export const DELETE_AGENT_MUTATION = `
  mutation DeleteAgent($id: Int!) {
    deleteAgent(id: $id)
  }
`;
