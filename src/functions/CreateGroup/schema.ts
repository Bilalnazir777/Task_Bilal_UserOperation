export default {
  type: "object",
  properties: {
    name: { type: "string" },
    systemID: { type: "string" },
    userNames: { type: "Array" },
    policyNames: { type: "Array" },
    required: [],
  },
} as const;
