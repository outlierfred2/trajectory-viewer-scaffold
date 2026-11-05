import { detect, read, text } from './adapters.js';
const $ = s => document.querySelector(s);
const runs = []; let active; let normalized;
const node = (tag, content) => { const n = document.createElement(tag); n.textContent = content; return n; };
function open(run) {
  active = run; normalized = undefined; $('#timeline').replaceChildren(); $('#raw').textContent = text(run.doc);
  const adapter = detect(run.doc);
  const mapping = run.mapping ?? adapter?.mapping ?? { events: '', role: '', content: '' };
  for (const key of ['events', 'role', 'content']) $('#mapping').elements[key].value = mapping[key];
  $('#format').textContent = adapter ? `Detected: ${adapter.label}` : 'Unrecognized format. Map its fields below.';
  apply(mapping);
}
function apply(mapping) {
  try {
    normalized = read(active.doc, mapping); active.mapping = mapping;
    $('#role').replaceChildren(new Option('All roles', ''));
    for (const role of new Set(normalized.events.map(e => e.role))) $('#role').add(new Option(role, role));
    render();
    if (normalized.metadata != null) { const metadata = node('details', ''); metadata.append(node('summary', 'Run metadata'), node('pre', text(normalized.metadata))); $('#timeline').prepend(metadata); }
  } catch (error) { normalized = undefined; $('#timeline').replaceChildren(); $('#status').textContent = error.message; }
}
function render() {
  if (!normalized) return;
  const query = $('#search').value.toLowerCase(); const role = $('#role').value;
  const events = normalized.events.filter(e => (!role || e.role === role) && text(e).toLowerCase().includes(query));
  $('#status').textContent = `${events.length} of ${normalized.events.length} events · ${active.name}`;
  $('#timeline').replaceChildren(...events.map(event => {
    const card = node('details', ''); card.className = 'event';
    card.append(node('summary', `${String(event.id).padStart(3, '0')}  ·  ${event.role}`), node('pre', event.content));
    const detail = (label, value) => {
      if (value === undefined || value === null) return;
      const section = node('details', ''); section.append(node('summary', label), node('pre', text(value))); card.append(section);
    };
    if (event.timestamp != null) card.append(node('p', text(event.timestamp)));
    detail('Recorded reasoning', event.reasoning);
    for (const call of event.toolCalls ?? []) {
      detail(`Tool · ${call.name ?? 'unknown'}`, call.arguments);
      detail('Tool result', call.result);
    }
    detail('Observation', event.observation);
    const raw = node('details', ''); raw.append(node('summary', 'All event fields'), node('pre', text(event.raw))); card.append(raw); return card;
  }));
}
function add(name, doc) {
  const run = { name, doc }; runs.push(run);
  const button = node('button', name); button.onclick = () => open(run); $('#runs').append(button); open(run);
}
$('#files').onchange = async event => {
  for (const file of event.target.files) {
    try { add(file.name, JSON.parse(await file.text())); }
    catch (error) { $('#status').textContent = `${file.name}: ${error.message}`; }
  }
  event.target.value = '';
};
$('#mapping').onsubmit = event => { event.preventDefault(); if (active) apply(Object.fromEntries(new FormData(event.target))); };
$('#search').oninput = render; $('#role').onchange = render;
$('#expand').onclick = () => document.querySelectorAll('.event').forEach(n => n.open = true);
$('#collapse').onclick = () => document.querySelectorAll('.event').forEach(n => n.open = false);
$('#demo').onclick = () => add('Example run', { messages: [{ role: 'user', content: 'Find the source of the regression.' }, { role: 'assistant', content: 'I will inspect the failing run and compare its tool results.', tool_calls: [{ name: 'read_log', arguments: { run: 42 } }] }, { role: 'tool', content: { status: 'ok', finding: 'A changed response field.' } }] });
