const form = document.getElementById('form');
const history = document.getElementById('history');
const fields = ['date','time','type','cause','precursor','symptoms','treatment','result','notes'];

const load = () => JSON.parse(localStorage.getItem('migraines') || '[]');
const save = (entries) => localStorage.setItem('migraines', JSON.stringify(entries));

function getFormData() {
  const formData = new FormData(form);
  const data = {};
  fields.forEach(f => {
    const values = formData.getAll(f);
    data[f] = values.length > 1 ? values.join(', ') : values[0] || '';
  });
  return data;
}

function render() {
  history.innerHTML = load().slice(0, 10).map(e => 
    `<tr><td>${e.date}</td><td>${e.type}</td><td>${e.cause || '-'}</td><td>${e.treatment || '-'}</td><td>${e.result}</td></tr>`
  ).join('');
}

form.onsubmit = (e) => {
  e.preventDefault();
  const data = getFormData();
  save([data, ...load()]);
  render();
  form.reset();
  form.date.value = new Date().toISOString().split('T')[0];
};

document.getElementById('export-btn').onclick = () => {
  const entries = load();
  if (!entries.length) return alert('No entries');
  const csv = [fields.join(','), ...entries.map(e => fields.map(f => `"${e[f] || ''}"`).join(','))].join('\n');
  Object.assign(document.createElement('a'), { href: URL.createObjectURL(new Blob([csv])), download: 'migraines.csv' }).click();
};

form.date.value = new Date().toISOString().split('T')[0];
render();