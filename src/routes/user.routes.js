import { Router } from 'express';
import { loginUser, logoutUser, refreshAcessToken, registerUser } from '../controllers/user.controller.js';
import { upload } from '../middlewares/multer.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();

// all of this is like suffix to the url
router.route('/register').post(
  upload.fields([ // middleware multer bolte
    {
      name: 'avatar',
      maxCount: 1
    },
    {
      name: 'coverImage',
      maxCount: 1
    }
  ]),
  registerUser
)

router.route('/login').post(loginUser)


// secured routes matlab via our auth middleware
router.route('/logout').post( verifyJWT, logoutUser)
router.route('/refresh-token').post(refreshAcessToken) 

export default router;
