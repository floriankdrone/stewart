import express from 'express';

import Auth from './model.js';

const router = express.Router();

// middleware that is specific to this router
router.use((req, res, next) => {
  next();
});

// define the home page route
router.get('/', (req, res) => {
  res.send('Birds home page');
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const auth = await Auth.findById(id);
  res.status(200).json(auth.email);
});

/**
 * Create
 */
router.post('/', async (req, res) => {
  const { email, password } = req.body;
  const auth = new Auth(req.app.get('db'), email, password);
  await auth.save();
  return res.status(201).json();
});

/**
 * Update
 */
router.put('/:id', async (_, res) => res.status(405).json());

export default router;
