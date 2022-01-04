export default {
  type: "object",
  properties: {
    name: { type: "string" },
    subnet: { type: "string" },
    roles: { type: "Array" },
    readPct: { type: "number" },
    readIOPs: { type: "number" },
    writeIOPs: { type: "number" },
    buckets: { type: "Array" },
    required: [],
  },
} as const;
