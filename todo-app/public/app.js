const tabButtons = document.querySelectorAll('.tab-btn');
const tabPanels = {
  presets: document.getElementById('tab-presets'),
  tasks: document.getElementById('tab-tasks'),
};

const presetList = document.getElementById('preset-list');
const presetForm = document.getElementById('preset-form');
const presetTitleInput = document.getElementById('preset-title-input');
const presetError = document.getElementById('preset-error');

const openAddModalBtn = document.getElementById('open-add-modal-btn');
const taskModal = document.getElementById('task-modal');
const modalCloseBtn = document.getElementById('modal-close-btn');

const formHeading = document.getElementById('form-heading');
const taskForm = document.getElementById('task-form');
const taskTitleInput = document.getElementById('task-title');
const taskDueDateInput = document.getElementById('task-due-date');
const taskDescriptionInput = document.getElementById('task-description');
const tagCheckboxes = document.getElementById('tag-checkboxes');
const newTagNameInput = document.getElementById('new-tag-name');
const colorChips = document.querySelectorAll('#new-tag-color-chips .color-chip');
const newTagBtn = document.getElementById('new-tag-btn');
let selectedTagColor = colorChips[0] ? colorChips[0].dataset.color : null;
const taskSubmitBtn = document.getElementById('task-submit-btn');
const taskCancelBtn = document.getElementById('task-cancel-btn');
const taskError = document.getElementById('task-error');

const searchInput = document.getElementById('search-input');
const statusChips = document.querySelectorAll('#status-filter .status-chip');
const tagFilter = document.getElementById('tag-filter');
const todayFilter = document.getElementById('today-filter');
const sortSelect = document.getElementById('sort-select');
let currentStatus = '';

const taskListEl = document.getElementById('task-list');
const emptyState = document.getElementById('empty-state');

let tags = [];
let templates = [];
let editingTaskId = null;
let editingPresetId = null;
let selectedTagIds = new Set();

const presetEditModal = document.getElementById('preset-edit-modal');
const presetEditForm = document.getElementById('preset-edit-form');
const presetEditTitle = document.getElementById('preset-edit-title');
const presetEditError = document.getElementById('preset-edit-error');
const presetEditCloseBtn = document.getElementById('preset-edit-close-btn');
const presetEditCancelBtn = document.getElementById('preset-edit-cancel-btn');

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

async function request(method, url, body) {
  const opts = { method };
  if (body !== undefined) {
    opts.headers = { 'Content-Type': 'application/json' };
    opts.body = JSON.stringify(body);
  }
  const res = await fetch(url, opts);
  if (res.status === 204) return null;
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error((data && data.error) || '오류가 발생했습니다');
  return data;
}

function resetForm() {
  taskForm.reset();
  selectedTagIds = new Set();
  editingTaskId = null;
  formHeading.textContent = '할 일 추가';
  taskSubmitBtn.textContent = '추가';
  taskError.textContent = '';
  renderTagCheckboxes();
}

function openAddModal() {
  resetForm();
  taskDueDateInput.value = todayStr();
  taskModal.showModal();
}

function startEdit(task) {
  editingTaskId = task.id;
  taskTitleInput.value = task.title;
  taskDescriptionInput.value = task.description || '';
  taskDueDateInput.value = task.due_date || '';
  selectedTagIds = new Set(task.tags.map((t) => t.id));
  formHeading.textContent = '할 일 수정';
  taskSubmitBtn.textContent = '저장';
  taskError.textContent = '';
  renderTagCheckboxes();
  taskModal.showModal();
}

function renderTagCheckboxes() {
  tagCheckboxes.innerHTML = '';
  if (!tags.length) {
    const span = document.createElement('span');
    span.className = 'preset-empty';
    span.textContent = '아직 태그가 없습니다. 아래에서 만들어보세요.';
    tagCheckboxes.appendChild(span);
    return;
  }
  for (const tag of tags) {
    const label = document.createElement('label');
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.value = tag.id;
    checkbox.checked = selectedTagIds.has(tag.id);
    checkbox.addEventListener('change', () => {
      if (checkbox.checked) selectedTagIds.add(tag.id);
      else selectedTagIds.delete(tag.id);
    });
    label.appendChild(checkbox);
    label.appendChild(document.createTextNode(tag.name));
    tagCheckboxes.appendChild(label);
  }
}

function renderTagFilterOptions() {
  const current = tagFilter.value;
  tagFilter.innerHTML = '<option value="">전체 태그</option>';
  for (const tag of tags) {
    const opt = document.createElement('option');
    opt.value = tag.id;
    opt.textContent = tag.name;
    tagFilter.appendChild(opt);
  }
  if ([...tagFilter.options].some((o) => o.value === current)) {
    tagFilter.value = current;
  }
}

function renderPresets() {
  presetList.innerHTML = '';
  if (!templates.length) {
    const p = document.createElement('span');
    p.className = 'preset-empty';
    p.textContent = '아직 저장된 프리셋이 없습니다.';
    presetList.appendChild(p);
    return;
  }
  for (const tpl of templates) {
    const chip = document.createElement('div');
    chip.className = 'preset-chip';

    const label = document.createElement('span');
    label.className = 'preset-chip-name';
    label.textContent = tpl.title;

    const actions = document.createElement('span');
    actions.className = 'preset-chip-actions';

    const useBtn = document.createElement('button');
    useBtn.type = 'button';
    useBtn.className = 'btn-icon';
    useBtn.title = '이 프리셋으로 할 일 추가';
    useBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14"/><path d="M5 12h14"/></svg>';
    useBtn.addEventListener('click', () => usePreset(tpl.id));

    const editBtn = document.createElement('button');
    editBtn.type = 'button';
    editBtn.className = 'btn-icon';
    editBtn.title = '수정';
    editBtn.setAttribute('aria-label', '수정');
    editBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path></svg>';
    editBtn.addEventListener('click', () => startEditPreset(tpl));

    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.className = 'btn-icon danger';
    deleteBtn.title = '삭제';
    deleteBtn.setAttribute('aria-label', '삭제');
    deleteBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>';
    deleteBtn.addEventListener('click', () => deletePreset(tpl.id));

    actions.appendChild(useBtn);
    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);

    chip.appendChild(label);
    chip.appendChild(actions);
    presetList.appendChild(chip);
  }
}

function ddayBadge(task) {
  if (task.d_day_label === null) return null;
  const badge = document.createElement('span');
  badge.className = 'dday-badge';
  if (task.d_day < 0) badge.classList.add('overdue');
  else if (task.d_day === 0) badge.classList.add('today');
  badge.textContent = task.d_day_label;
  return badge;
}

function renderTasks(taskArr) {
  taskListEl.innerHTML = '';
  emptyState.hidden = taskArr.length > 0;

  for (const task of taskArr) {
    const li = document.createElement('li');
    li.className = 'task-item' + (task.status === 'done' ? ' is-done' : '');

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'task-checkbox';
    checkbox.checked = task.status === 'done';
    checkbox.addEventListener('change', () => toggleComplete(task));

    const main = document.createElement('div');
    main.className = 'task-main';

    const titleRow = document.createElement('div');
    titleRow.className = 'task-title-row';
    const title = document.createElement('span');
    title.className = 'task-title';
    title.textContent = task.title;
    titleRow.appendChild(title);
    const badge = ddayBadge(task);
    if (badge) titleRow.appendChild(badge);
    main.appendChild(titleRow);

    if (task.due_date) {
      const dueDateEl = document.createElement('p');
      dueDateEl.className = 'task-due-date';
      dueDateEl.textContent = task.due_date.replaceAll('-', '.');
      main.appendChild(dueDateEl);
    }

    if (task.description) {
      const desc = document.createElement('p');
      desc.className = 'task-description';
      desc.textContent = task.description;
      main.appendChild(desc);
    }

    if (task.tags.length) {
      const tagsRow = document.createElement('div');
      tagsRow.className = 'task-tags';
      for (const tag of task.tags) {
        const chip = document.createElement('span');
        chip.className = 'tag-chip';
        if (tag.color) chip.style.background = tag.color;
        chip.textContent = tag.name;
        tagsRow.appendChild(chip);
      }
      main.appendChild(tagsRow);
    }

    const actions = document.createElement('div');
    actions.className = 'task-actions';
    const savePresetBtn = document.createElement('button');
    savePresetBtn.type = 'button';
    savePresetBtn.className = 'btn-icon';
    savePresetBtn.title = '이 할 일을 자주 하는 일로 등록';
    savePresetBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14"/><path d="M5 12h14"/></svg>';
    savePresetBtn.addEventListener('click', () => saveAsPreset(task));
    const editBtn = document.createElement('button');
    editBtn.type = 'button';
    editBtn.className = 'btn-icon';
    editBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path></svg>';
    editBtn.title = '수정';
    editBtn.setAttribute('aria-label', '수정');
    editBtn.addEventListener('click', () => startEdit(task));
    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.className = 'btn-icon danger';
    deleteBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>';
    deleteBtn.title = '삭제';
    deleteBtn.setAttribute('aria-label', '삭제');
    deleteBtn.addEventListener('click', () => deleteTask(task.id));
    actions.appendChild(savePresetBtn);
    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);

    li.appendChild(checkbox);
    li.appendChild(main);
    li.appendChild(actions);
    taskListEl.appendChild(li);
  }
}

async function loadTags() {
  tags = await request('GET', '/api/tags');
  renderTagCheckboxes();
  renderTagFilterOptions();
}

async function loadTemplates() {
  templates = await request('GET', '/api/templates');
  renderPresets();
}

async function loadTasks() {
  const params = new URLSearchParams();
  const q = searchInput.value.trim();
  if (q) params.set('q', q);
  if (currentStatus) params.set('status', currentStatus);
  if (tagFilter.value) params.set('tag', tagFilter.value);
  if (todayFilter.checked) params.set('today', 'true');
  params.set('sort', sortSelect.value);
  const list = await request('GET', '/api/tasks?' + params.toString());
  renderTasks(list);
}

async function usePreset(id) {
  try {
    await request('POST', `/api/templates/${id}/use`);
    await Promise.all([loadTemplates(), loadTasks()]);
  } catch (err) {
    alert(err.message);
  }
}

async function saveAsPreset(task) {
  try {
    await request('POST', '/api/templates', {
      title: task.title,
      description: task.description,
    });
    await loadTemplates();
    setActiveTab('presets');
  } catch (err) {
    alert(err.message);
  }
}

function startEditPreset(tpl) {
  editingPresetId = tpl.id;
  presetEditTitle.value = tpl.title;
  presetEditError.textContent = '';
  presetEditModal.showModal();
}

async function submitEditPreset(e) {
  e.preventDefault();
  const title = presetEditTitle.value.trim();
  if (!title) {
    presetEditError.textContent = '제목은 필수입니다';
    return;
  }
  try {
    await request('PATCH', `/api/templates/${editingPresetId}`, { title });
    presetEditModal.close();
    await loadTemplates();
  } catch (err) {
    presetEditError.textContent = err.message;
  }
}

function resetPresetEditForm() {
  editingPresetId = null;
  presetEditTitle.value = '';
  presetEditError.textContent = '';
}

async function deletePreset(id) {
  if (!confirm('이 프리셋을 삭제할까요?')) return;
  try {
    await request('DELETE', `/api/templates/${id}`);
    await loadTemplates();
  } catch (err) {
    alert(err.message);
  }
}

async function toggleComplete(task) {
  try {
    if (task.status === 'done') {
      await request('PATCH', `/api/tasks/${task.id}`, { status: 'todo' });
    } else {
      await request('PATCH', `/api/tasks/${task.id}/complete`);
    }
    await loadTasks();
  } catch (err) {
    alert(err.message);
  }
}

async function deleteTask(id) {
  if (!confirm('이 할 일을 삭제할까요?')) return;
  try {
    await request('DELETE', `/api/tasks/${id}`);
    if (editingTaskId === id) taskModal.close();
    await loadTasks();
  } catch (err) {
    alert(err.message);
  }
}

presetForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const title = presetTitleInput.value.trim();
  if (!title) return;
  try {
    await request('POST', '/api/templates', { title });
    presetTitleInput.value = '';
    presetError.textContent = '';
    await loadTemplates();
  } catch (err) {
    presetError.textContent = err.message;
  }
});

for (const chip of colorChips) {
  chip.addEventListener('click', () => {
    selectedTagColor = chip.dataset.color;
    for (const c of colorChips) c.classList.toggle('selected', c === chip);
  });
}

newTagBtn.addEventListener('click', async () => {
  const name = newTagNameInput.value.trim();
  if (!name) return;
  try {
    const tag = await request('POST', '/api/tags', { name, color: selectedTagColor });
    newTagNameInput.value = '';
    await loadTags();
    selectedTagIds.add(tag.id);
    renderTagCheckboxes();
    taskError.textContent = '';
  } catch (err) {
    taskError.textContent = err.message;
  }
});

taskForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const title = taskTitleInput.value.trim();
  if (!title) {
    taskError.textContent = '제목은 필수입니다';
    return;
  }
  const payload = {
    title,
    description: taskDescriptionInput.value.trim() || null,
    due_date: taskDueDateInput.value || null,
    tag_ids: Array.from(selectedTagIds),
  };
  try {
    if (editingTaskId) {
      await request('PATCH', `/api/tasks/${editingTaskId}`, payload);
    } else {
      await request('POST', '/api/tasks', payload);
    }
    taskModal.close();
    await loadTasks();
  } catch (err) {
    taskError.textContent = err.message;
  }
});

taskCancelBtn.addEventListener('click', () => taskModal.close());
modalCloseBtn.addEventListener('click', () => taskModal.close());
taskModal.addEventListener('close', resetForm);
taskModal.addEventListener('click', (e) => {
  const rect = taskModal.getBoundingClientRect();
  const inDialog = rect.top <= e.clientY && e.clientY <= rect.top + rect.height
    && rect.left <= e.clientX && e.clientX <= rect.left + rect.width;
  if (!inDialog) taskModal.close();
});
openAddModalBtn.addEventListener('click', openAddModal);

presetEditForm.addEventListener('submit', submitEditPreset);
presetEditCloseBtn.addEventListener('click', () => presetEditModal.close());
presetEditCancelBtn.addEventListener('click', () => presetEditModal.close());
presetEditModal.addEventListener('close', resetPresetEditForm);
presetEditModal.addEventListener('click', (e) => {
  const rect = presetEditModal.getBoundingClientRect();
  const inDialog = rect.top <= e.clientY && e.clientY <= rect.top + rect.height
    && rect.left <= e.clientX && e.clientX <= rect.left + rect.width;
  if (!inDialog) presetEditModal.close();
});

function setActiveTab(tabName) {
  for (const btn of tabButtons) {
    const isActive = btn.dataset.tab === tabName;
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-selected', String(isActive));
  }
  tabPanels.presets.hidden = tabName !== 'presets';
  tabPanels.tasks.hidden = tabName !== 'tasks';
}
for (const btn of tabButtons) {
  btn.addEventListener('click', () => setActiveTab(btn.dataset.tab));
}

let searchDebounce;
searchInput.addEventListener('input', () => {
  clearTimeout(searchDebounce);
  searchDebounce = setTimeout(loadTasks, 250);
});
for (const chip of statusChips) {
  chip.addEventListener('click', () => {
    currentStatus = chip.dataset.status;
    for (const c of statusChips) c.classList.toggle('active', c === chip);
    loadTasks();
  });
}
tagFilter.addEventListener('change', loadTasks);
todayFilter.addEventListener('change', loadTasks);
sortSelect.addEventListener('change', loadTasks);

(async function init() {
  await Promise.all([loadTags(), loadTemplates()]);
  await loadTasks();
})();
