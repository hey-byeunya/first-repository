const express = require('express');
const router = express.Router();
const supabase = require('../db');

// GET /api/tags
router.get('/', async (req, res, next) => {
  try {
    const { data, error } = await supabase.from('tags').select('*').order('name', { ascending: true });
    if (error) throw error;
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// POST /api/tags
router.post('/', async (req, res, next) => {
  try {
    const { name, color } = req.body || {};
    if (!name || !name.trim()) {
      return res.status(400).json({ error: '태그 이름은 필수입니다' });
    }
    const { data, error } = await supabase
      .from('tags')
      .insert({ name: name.trim(), color: color || null })
      .select()
      .single();
    if (error) {
      if (error.code === '23505') {
        return res.status(409).json({ error: '이미 같은 이름의 태그가 있습니다' });
      }
      throw error;
    }
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/tags/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const { data, error } = await supabase.from('tags').delete().eq('id', req.params.id).select().maybeSingle();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: '태그를 찾을 수 없습니다' });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
