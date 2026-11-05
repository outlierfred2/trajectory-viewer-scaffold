// Adapters own schema knowledge; the reader only consumes normalized events.
export const get = (value, path) => path ? path.split('.').reduce((v, k) => v?.[k], value) : value;
export const text = value => typeof value === 'string' ? value : JSON.stringify(value, null, 2) ?? '';
export function normalize(doc, mapping) {
  const records = get(doc, mapping.events);
  if (!Array.isArray(records)) throw new Error('The selected event path must point to an array.');
  return {
    events: records.map((raw, index) => ({
      id: index + 1,
      role: text(get(raw, mapping.role) ?? 'unknown'),
      content: text(get(raw, mapping.content) ?? raw),
      reasoning: raw?.reasoning_content,
      timestamp: raw?.timestamp,
      toolCalls: Array.isArray(raw?.tool_calls) ? raw.tool_calls.map(call => ({
        id: call?.tool_call_id ?? call?.id,
        name: call?.function_name ?? call?.function?.name ?? call?.name,
        arguments: call?.arguments ?? call?.function?.arguments,
        result: (Array.isArray(raw?.observation?.results) ? raw.observation.results : [])
          .filter(result => call?.tool_call_id != null && result?.source_call_id === call.tool_call_id),
      })) : undefined,
      observation: raw?.observation,
      raw,
    })),
    raw: doc,
  };
}
export const adapters = [
  { id: 'steps', label: 'Trajectory steps', matches: d => Array.isArray(d?.steps), mapping: { events: 'steps', role: 'source', content: 'message' } },
  { id: 'messages', label: 'Chat messages', matches: d => Array.isArray(d?.messages), mapping: { events: 'messages', role: 'role', content: 'content' } },
  { id: 'array', label: 'Event array', matches: Array.isArray, mapping: { events: '', role: 'role', content: 'content' } },
];
export function detect(doc) { return adapters.find(adapter => adapter.matches(doc)); }

// Dedicated adapters may implement normalize(doc) for richer source schemas.
export function read(doc, mapping) {
  const adapter = detect(doc);
  return adapter?.normalize ? adapter.normalize(doc) : normalize(doc, mapping);
}
