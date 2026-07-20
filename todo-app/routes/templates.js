const express = require('express');
const router = express.Router();
const supabase = require('../db');

// GET /api/templates
router.get('/', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('task_templates')
      .select('*')
      .order('use_count', { ascending: false })
      .order('title', { ascending: true });
    if (error) throw error;
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// POST /api/templates
router.post('/', async (req, res, next) => {
  try {
    const { title, description } = req.body || {};
    if (!title || !title.trim()) {
      return res.status(400).json({ error: '프리셋 제목은 필수입니다' });
    }
    const { data, error } = await supabase
      .from('task_templates')
      .insert({ title: title.trim(), description: description || null })
      .select()
      .single();
    if (error) {
      if (error.code === '23505') {
        return res.status(409).json({ error: '이미 같은 이름의 프리셋이 있습니다' });
      }
      throw error;
    }
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/templates/:id
router.patch('/:id', async (req, res, next) => {
  try {
    const { title, description } = req.body || {};
    if (!title || !title.trim()) {
      return res.status(400).json({ error: '프리셋 제목은 필수입니다' });
    }
    const { data, error } = await supabase
      .from('task_templates')
      .update({ title: title.trim(), description: description || null })
      .eq('id', req.params.id)
      .select()
      .single();
    if (error) {
      if (error.code === '23505') {
        return res.status(409).json({ error: '이미 같은 이름의 프리셋이 있습니다' });
      }
      throw error;
    }
    if (!data) return res.status(404).json({ error: '프리셋을 찾을 수 없습니다' });
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/templates/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const { data, error } = await supabase.from('task_templates').delete().eq('id', req.params.id).select().maybeSingle();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: '프리셋을 찾을 수 없습니다' });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

// POST /api/templates/:id/use — 프리셋으로 새 할 일 생성(마감일은 오늘로) + 사용 횟수 증가 (원자적)
router.post('/:id/use', async (req, res, next) => {
  try {
    const { data, error } = await supabase.rpc('use_template', { p_template_id: Number(req.params.id) });
    if (error) {
      if (/template not found/i.test(error.message || '')) {
        return res.status(404).json({ error: '프리셋을 찾을 수 없습니다' });
      }
      throw error;
    }
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
