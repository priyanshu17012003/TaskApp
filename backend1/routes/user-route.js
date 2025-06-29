const express=require('express');
const router=express.Router();
const userController=require('../controllers/user-controller');

router.post('/signup',userController.signUp);
router.post('/login',userController.login);
router.post('/logout',userController.logOut);

module.exports=router;