import express from 'express';
import { runRecurringTransactions } from '../controllers/cronController.js';

const router = express.Router();

router.get('/run-recurring', runRecurringTransactions);

export default router;
