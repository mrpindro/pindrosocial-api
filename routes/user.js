const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');
const upload = require('../config/multer');

router.route('/signin')
    .post(usersController.loginUser)
;

router.route('/signup')
    .post(upload.single('imageUrl'), usersController.signUpUser)
;

module.exports = router;