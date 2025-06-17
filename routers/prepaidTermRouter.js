import express from 'express';
import { getPrepaidTerm, postPrepaidTerm } from '../controller/prepaidController.js';

const router = express.Router();

router.get('/prepaidterm', getPrepaidTerm);
router.post('/prepaidterm', postPrepaidTerm);

export default router;
