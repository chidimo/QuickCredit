import express from 'express';

import AuthController from '../controllers/AuthController';
import UsersController from '../controllers/UsersController';
import LoansController from '../controllers/LoansController';
import AppController from '../controllers/AppController';

import AuthenticationMiddleware from '../middleware/authentication';

const router = express.Router();

/* GET home page. */
router.get('/', AppController.index);
router.get('/about', AppController.about);

router.post('/auth/signup',
    AuthenticationMiddleware.generateToken,
    AuthController.signup
);
router.get('/auth/signup', AuthController.signup);
router.post('/auth/signin',
    AuthenticationMiddleware.verifyToken,
    AuthController.signin
);
router.get('/auth/signin', AuthController.signin);


router.get('/users/dashboard', UsersController.dashboard);

router.patch('/users/:email/verify', UsersController.verify_user);
router.get('/users', UsersController.get_users);
router.get('/users/:id', UsersController.get_user);
router.get('/users?status=verified', UsersController.get_users);
router.patch('/users/:id/update', UsersController.update_user);

router.get('/loans', LoansController.get_all_loans);
router.get('/loans/:id', LoansController.get_loan);
router.get(
    '/loans?status=approved&repaid=false', LoansController.get_all_loans);
router.get(
    '/loans?status=approved&repaid=true', LoansController.get_all_loans);
router.post('/loans', LoansController.create_loan);
router.patch('/loans/:id/approve', LoansController.approve_loan);
router.patch('/loans/:id/reject', LoansController.reject_loan);
router.get(
    '/loans/:id/repayments', LoansController.loan_repayment_history
);
router.post('/loans/:id/repayment', LoansController.post_repayment);

export default router;
