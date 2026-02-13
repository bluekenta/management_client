const CALLER_FIELDS = `
  id
  name
`;

export const CALLERS_QUERY = `
  query Callers {
    callers {
      ${CALLER_FIELDS}
    }
  }
`;

export const CREATE_CALLER_MUTATION = `
  mutation CreateCaller($input: CreateCallerInput!) {
    createCaller(input: $input) {
      ${CALLER_FIELDS}
    }
  }
`;

export const UPDATE_CALLER_MUTATION = `
  mutation UpdateCaller($id: Int!, $input: UpdateCallerInput!) {
    updateCaller(id: $id, input: $input) {
      ${CALLER_FIELDS}
    }
  }
`;

export const DELETE_CALLER_MUTATION = `
  mutation DeleteCaller($id: Int!) {
    deleteCaller(id: $id)
  }
`;
