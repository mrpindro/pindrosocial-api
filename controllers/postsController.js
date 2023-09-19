const Post = require('../models/Post');
const mongoose = require('mongoose');
const cloudinary = require('../config/cloudinary');

const getPosts = async (req, res) => {
    try {
        const posts = await Post.find();

        res.status(200).json(posts);
    } catch (error) {
        res.status(404).json({ message: error });
    }
}

const createPost = async (req, res) => {
    const {title, message, tags, likes} = req.body;
    const data = { selectedFile: req.file.path };

    
    try {
        const result = await cloudinary.uploader.upload(data.selectedFile, 
            {folder: 'pindro-social'}
        );

        const newPost = new Post({
            title, message, tags, creator: req.userId, likes,
            selectedFile: result.secure_url, selectedFile_id: result.public_id
        });

        await newPost.save();

        res.status(201).json(newPost)
    } catch (error) {
        res.status(409).json({ message: error.message });
    }
}

const updatePost = async (req, res) => {
    const { id: _id } = req.params;
    const post = req.body;

    if (!mongoose.Types.ObjectId.isValid(_id)) {
        return res.status(404).send('No post with that id');
    }

    const updatedPost = await Post.findByIdAndUpdate(_id, { ...post, _id}, { new: true });

    res.json(updatedPost);
}

const deletePost = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).send('No post with that id');
    }

    const post = await Post.findById(id);

    await cloudinary.uploader.destroy(post.selectedFile_id);

    post.deleteOne();

    res.json({ message: 'Post deleted successfully!'});
}

const likePost = async (req, res) => {
    const { id } = req.params;

    if(!req.userId) {
        return res.status(403).json({ message: 'Unauthenticated' });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).send('No post with that id');
    }

    const post = await Post.findById(id);

    const index = post.likes.findIndex((id) => id === String(req.userId));

    if (index === -1) {
        // like a post 
        post.likes.push(req.userId);
    } else {
        // dislike a post 
        post.likes = post.likes.filter((id) => id !== String(req.userId));
    }

    const updatedPost = await Post.findByIdAndUpdate(
        id, post, { new: true }
    );

    res.json(updatedPost);
}

module.exports = { getPosts, createPost, updatePost, deletePost, likePost }