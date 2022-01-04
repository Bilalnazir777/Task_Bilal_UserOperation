export default {
  type: "object",
  properties: {
    accessKey: { type: "string" },
    consoleUser: { type: "string" },
    secretKey: { type: "string" },
    systemID: { type: "string" },
    groupNames: { type: "Array" },
    policyNames: { type: "Array" },
    required: [],
  },
} as const;
