const express = require('express');
const router = express.Router();
const postsController = require('../controllers/postsController');
const upload = require('../config/multer');
const auth = require('../middleware/auth');

router.route('/')
    .get(postsController.getPosts)
    .post(auth, upload.single('selectedFile'), postsController.createPost)
;

router.route('/:id')
    .patch(auth, postsController.updatePost)
    .delete(auth, postsController.deletePost)
;

router.patch('/:id/likePost', auth, postsController.likePost)

module.exports = router;