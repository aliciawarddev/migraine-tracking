const form = document.getElementById('form');
const history = document.getElementById('history');
const cancelBtn = document.getElementById('cancel-btn');
const fields = ['date','time','type','cause','precursor','symptoms','treatment','result','notes'];

let editIndex = null;

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

function populateForm(entry) {
  form.reset();
  form.date.value = entry.date;
  form.time.value = entry.time;
  form.type.value = entry.type;
  form.result.value = entry.result;
  form.notes.value = entry.notes || '';
  
  ['cause', 'precursor', 'symptoms', 'treatment'].forEach(field => {
    const values = (entry[field] || '').split(', ').filter(Boolean);
    form.querySelectorAll(`[name="${field}"]`).forEach(cb => {
      cb.checked = values.includes(cb.value);
    });
  });
}

function render() {
  const entries = load();
  history.innerHTML = entries.slice(0, 10).map((e, i) => 
    `<tr data-index="${i}" class="${i === editIndex ? 'editing' : ''}">
      <td class="row-actions">
        <button type="button" class="btn-icon" onclick="editRow(${i})">✎</button>
        <button type="button" class="btn-icon btn-delete" onclick="deleteRow(${i})">✕</button>
      </td>
      <td>${e.date}</td><td>${e.type}</td><td>${e.cause || '-'}</td><td>${e.treatment || '-'}</td><td>${e.result}</td>
    </tr>`
  ).join('');
}

function clearEdit() {
  editIndex = null;
  cancelBtn.style.display = 'none';
  form.reset();
  form.date.value = new Date().toISOString().split('T')[0];
  populateTimeDropdown();
}

cancelBtn.onclick = clearEdit;

form.onsubmit = (e) => {
  e.preventDefault();
  const data = getFormData();
  const entries = load();
  
  if (editIndex !== null) {
    entries[editIndex] = data;
  } else {
    entries.unshift(data);
  }
  
  save(entries);
  clearEdit();
};

document.getElementById('export-btn').onclick = () => {
  const entries = load();
  if (!entries.length) return alert('No entries');
  const csv = [fields.join(','), ...entries.map(e => fields.map(f => `"${e[f] || ''}"`).join(','))].join('\n');
  Object.assign(document.createElement('a'), { href: URL.createObjectURL(new Blob([csv])), download: 'migraines.csv' }).click();
};

form.date.value = new Date().toISOString().split('T')[0];
render();

function populateTimeDropdown() {
  const timeSelect = form.querySelector('[name="time"]');
  const now = new Date();
  const currentHour = now.getHours();
  const currentMin = Math.floor(now.getMinutes() / 15) * 15;
  
  timeSelect.innerHTML = '';
  
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 15) {
      const label = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
      const option = new Option(label, label);
      if (h === currentHour && m === currentMin) option.selected = true;
      timeSelect.add(option);
    }
  }
}

populateTimeDropdown();

function editRow(i) {
  editIndex = i;
  populateForm(load()[i]);
  cancelBtn.style.display = 'inline-block';
  render();
}

function deleteRow(i) {
  if (!confirm('Delete this entry?')) return;
  const entries = load();
  entries.splice(i, 1);
  save(entries);
  if (editIndex === i) clearEdit();
  else render();
}