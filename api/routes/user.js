const express = require('express');
const router = express.Router(); 
const UserController = require("../controllers/user"); 
const checkAuth = require('../middleware/check-auth');

router.post('/login', UserController.user_login)
router.post('/signup', UserController.user_signup);
router.delete('/:userId', checkAuth, UserController.user_delete);

module.exports = router;