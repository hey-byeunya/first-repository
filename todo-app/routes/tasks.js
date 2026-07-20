const express = require('express');
const router = express.Router();
const supabase = require('../db');

const VALID_STATUSES = ['todo', 'done'];

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function dDay(dueDate, today) {
  if (!dueDate) return null;
  return Math.round((new Date(dueDate) - new Date(today)) / 86400000);
}

function formatDDay(n) {
  if (n === null) return null;
  if (n === 0) return 'D-day';
  return n > 0 ? `D-${n}` : `D+${Math.abs(n)}`;
}

async function getTags(taskId) {
  const { data, error } = await supabase
    .from('task_tags')
    .select('tags(id, name, color)')
    .eq('task_id', taskId)
    .order('name', { foreignTable: 'tags' });
  if (error) throw error;
  return data.map((row) => row.tags);
}

async function serializeTask(task, today) {
  const diff = dDay(task.due_date, today);
  return {
    ...task,
    tags: await getTags(task.id),
    d_day: diff,
    d_day_label: formatDDay(diff),
  };
}

function compareTasks(a, b, sort) {
  const aDone = a.status === 'done' ? 1 : 0;
  const bDone = b.status === 'done' ? 1 : 0;
  if (aDone !== bDone) return aDone - bDone;

  if (sort === 'newest') return new Date(b.created_at) - new Date(a.created_at);
  if (sort === 'oldest') return new Date(a.created_at) - new Date(b.created_at);

  const aNull = a.due_date ? 0 : 1;
  const bNull = b.due_date ? 0 : 1;
  if (aNull !== bNull) return aNull - bNull;
  if (a.due_date !== b.due_date) return a.due_date < b.due_date ? -1 : 1;
  return new Date(b.created_at) - new Date(a.created_at);
}

// GET /api/tasks?q=&status=&tag=&today=true&sort=due|newest|oldest
router.get('/', async (req, res, next) => {
  try {
    const { q, status, tag, today, sort } = req.query;
    const today_ = todayStr();

    let taskIds = null;
    if (tag) {
      const { data, error } = await supabase.from('task_tags').select('task_id').eq('tag_id', tag);
      if (error) throw error;
      taskIds = data.map((r) => r.task_id);
      if (!taskIds.length) return res.json([]);
    }

    let query = supabase.from('tasks').select('*');
    if (status) query = query.eq('status', status);
    if (today === 'true') query = query.eq('due_date', today_);
    if (taskIds) query = query.in('id', taskIds);

    const { data, error } = await query;
    if (error) throw error;

    let rows = data;
    if (q) {
      const needle = q.toLowerCase();
      rows = rows.filter(
        (t) => (t.title || '').toLowerCase().includes(needle) || (t.description || '').toLowerCase().includes(needle)
      );
    }
    rows.sort((a, b) => compareTasks(a, b, sort));

    const serialized = await Promise.all(rows.map((r) => serializeTask(r, today_)));
    res.json(serialized);
  } catch (err) {
    next(err);
  }
});

// GET /api/tasks/:id
router.get('/:id', async (req, res, next) => {
  try {
    const { data, error } = await supabase.from('tasks').select('*').eq('id', req.params.id).maybeSingle();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: '할 일을 찾을 수 없습니다' });
    res.json(await serializeTask(data, todayStr()));
  } catch (err) {
    next(err);
  }
});

// POST /api/tasks
router.post('/', async (req, res, next) => {
  try {
    const { title, description, due_date, template_id, tag_ids } = req.body || {};
    if (!title || !title.trim()) {
      return res.status(400).json({ error: '제목은 필수입니다' });
    }

    const { data, error } = await supabase.rpc('create_task_with_tags', {
      p_title: title.trim(),
      p_description: description || null,
      p_due_date: due_date || null,
      p_template_id: template_id || null,
      p_tag_ids: Array.isArray(tag_ids) && tag_ids.length ? tag_ids : null,
    });
    if (error) throw error;

    res.status(201).json(await serializeTask(data, todayStr()));
  } catch (err) {
    next(err);
  }
});

// PATCH /api/tasks/:id/complete
router.patch('/:id/complete', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .update({ status: 'done', completed_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .select()
      .maybeSingle();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: '할 일을 찾을 수 없습니다' });
    res.json(await serializeTask(data, todayStr()));
  } catch (err) {
    next(err);
  }
});

// PATCH /api/tasks/:id
router.patch('/:id', async (req, res, next) => {
  try {
    const id = req.params.id;
    const { data: existing, error: fetchErr } = await supabase.from('tasks').select('*').eq('id', id).maybeSingle();
    if (fetchErr) throw fetchErr;
    if (!existing) return res.status(404).json({ error: '할 일을 찾을 수 없습니다' });

    const body = req.body || {};
    const title = body.title !== undefined ? body.title.trim() : existing.title;
    const description = body.description !== undefined ? body.description : existing.description;
    const due_date = body.due_date !== undefined ? body.due_date : existing.due_date;
    const status = body.status !== undefined ? body.status : existing.status;
    const tag_ids = body.tag_ids;

    if (!title) return res.status(400).json({ error: '제목은 필수입니다' });
    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({ error: "status는 'todo' 또는 'done'이어야 합니다" });
    }

    let completed_at = existing.completed_at;
    if (status === 'done' && existing.status !== 'done') completed_at = new Date().toISOString();
    if (status === 'todo') completed_at = null;

    const { data, error } = await supabase
      .from('tasks')
      .update({ title, description, due_date, status, completed_at, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .maybeSingle();
    if (error) throw error;

    if (Array.isArray(tag_ids)) {
      const { error: tagErr } = await supabase.rpc('set_task_tags', { p_task_id: Number(id), p_tag_ids: tag_ids.length ? tag_ids : null });
      if (tagErr) throw tagErr;
    }

    res.json(await serializeTask(data, todayStr()));
  } catch (err) {
    next(err);
  }
});

// DELETE /api/tasks/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const { data, error } = await supabase.from('tasks').delete().eq('id', req.params.id).select().maybeSingle();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: '할 일을 찾을 수 없습니다' });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
