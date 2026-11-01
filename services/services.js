'use strict';
const state = document.querySelector('#app-state');
const demoStatus = document.querySelector('#demo-status');
const rollback = document.querySelector('#rollback');
let current = {version: 'v1', status: 'ok'};
function render() { state.textContent = JSON.stringify(current); rollback.disabled = current.version !== 'v2'; }
document.querySelector('#check').addEventListener('click', () => {
  const version = document.querySelector('#candidate').value;
  const candidate = {version, status: version === 'broken' ? 'unhealthy' : 'ok'};
  const checks = [candidate.status === 'ok', ['v1', 'v2'].includes(candidate.version)];
  if (!checks.every(Boolean)) {
    demoStatus.textContent = 'FAIL — health/version contract rejected. Running version stays ' + current.version + '. No release.';
  } else {
    current = candidate;
    demoStatus.textContent = 'PASS — health/version contract verified. Simulated release to v2.';
  }
  render();
});
rollback.addEventListener('click', () => { current = {version: 'v1', status: 'ok'}; render(); demoStatus.textContent = 'ROLLBACK — restored v1; simulated health check passed.'; });
document.querySelector('#reset').addEventListener('click', () => { current = {version: 'v1', status: 'ok'}; render(); document.querySelector('#candidate').value = 'v2'; demoStatus.textContent = 'Ready. v1 is the last known good version.'; });
const form = document.querySelector('#enquiry-form');
const status = document.querySelector('#form-status');
const preview = document.querySelector('#brief-preview');
const fields = [['name','Name'],['email','Business email'],['business','Business / organisation'],['url','Project URL'],['problem','Problem'],['stack','Current stack'],['outcome','Desired outcome'],['date','Preferred date'],['budget','Budget context']];
function prepare() {
  for (const element of form.querySelectorAll('[required]')) {
    element.setCustomValidity(element.value.trim() ? '' : 'Please complete this field.');
  }
  if (!form.reportValidity()) { status.textContent = 'Please complete the required fields and check your email / URL. Nothing has been sent.'; return null; }
  const data = new FormData(form);
  const text = 'Project enquiry — One-app release setup\n\n' + fields.map(([key,label]) => label + ': ' + (String(data.get(key)).trim() || 'Not specified')).join('\n\n') + '\n\nI would like to discuss scope and availability for the independent service pilot.';
  preview.value = text;
  return text;
}
form.addEventListener('input', event => { if (event.target.setCustomValidity) event.target.setCustomValidity(''); preview.value = ''; status.textContent = 'Brief changed. Prepare it again before sending. Nothing has been sent.'; });
form.addEventListener('submit', event => event.preventDefault());
document.querySelectorAll('#enquiry-form button').forEach(button => {button.disabled = false;});
document.querySelector('#email-draft').addEventListener('click', () => {
  const body = prepare(); if (!body) return;
  const href = 'mailto:oluwatoyinbalogun583@gmail.com?subject=' + encodeURIComponent('Project enquiry — One-app release setup') + '&body=' + encodeURIComponent(body);
  status.textContent = 'Email draft requested — not sent. Review and send in your email app. If it does not open, copy or download the brief below.';
  const link = document.createElement('a'); link.href = href; document.body.append(link); link.click(); link.remove();
});
document.querySelector('#copy-brief').addEventListener('click', async () => {
  const body = prepare(); if (!body) return;
  try { await navigator.clipboard.writeText(body); status.textContent = 'Brief copied — not sent. Paste it into your own message and review before sending.'; }
  catch { preview.focus(); preview.select(); status.textContent = 'Clipboard unavailable. Your brief is selected: copy it manually. Nothing has been sent.'; }
});
document.querySelector('#download-brief').addEventListener('click', () => {
  const body = prepare(); if (!body) return;
  const url = URL.createObjectURL(new Blob([body], {type: 'text/plain;charset=utf-8'}));
  const link = document.createElement('a'); link.href = url; link.download = 'project-enquiry.txt'; document.body.append(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  status.textContent = 'Brief download prepared — not sent. Review it before sharing.';
});
