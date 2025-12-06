import { Router } from 'express';
import { registerUser } from '../controllers/user.controller.js';

const router = Router();

// all of this is like suffix to the url
router.route('/register').post(registerUser)


export default router;