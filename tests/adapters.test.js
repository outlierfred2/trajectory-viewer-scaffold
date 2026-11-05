import { test } from 'node:test';
import assert from 'node:assert/strict';
import { detect, normalize } from '../src/adapters.js';
test('detects reference steps and retains unknown fields', () => {
 const doc = { steps: [{ source: 'assistant', message: 'Hello', tool_calls: [1] }] };
 const result = normalize(doc, detect(doc).mapping);
 assert.equal(result.events[0].content, 'Hello'); assert.deepEqual(result.events[0].raw.tool_calls, [1]); assert.equal(result.raw, doc);
});
test('supports nested custom formats and structured content', () => {
 const result = normalize({ data: { turns: [{ actor: { name: 'tool' }, payload: { ok: true } }] } }, { events: 'data.turns', role: 'actor.name', content: 'payload' });
 assert.equal(result.events[0].role, 'tool'); assert.match(result.events[0].content, /true/);
});
test('rejects an invalid array path', () => assert.throws(() => normalize({}, { events: 'missing' }), /array/));
test('root arrays and primitive events remain readable', () => assert.equal(normalize(['hello'], detect([]).mapping).events[0].content, 'hello'));
test('reasoning, tool linkage and falsy observations survive normalization', () => {
 const doc = { steps: [{ source: 'assistant', reasoning_content: 'Check logs', tool_calls: [{ tool_call_id: 'a', function_name: 'read', arguments: { limit: 0 } }], observation: { results: [{ source_call_id: 'a', content: false }, { source_call_id: 'other', content: 'unmatched' }] } }] };
 const event = normalize(doc, detect(doc).mapping).events[0];
 assert.equal(event.reasoning, 'Check logs');
 assert.equal(event.toolCalls[0].result[0].content, false);
 assert.equal(event.observation.results.length, 2);
});
