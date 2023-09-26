const Post = require('../models/Post');
const mongoose = require('mongoose');
const cloudinary = require('../config/cloudinary');
const User = require('../models/User');

const getPosts = async (req, res) => {
    const { page } = req.query;

    try {
        const LIMIT = 8;
        const startIndex = (Number(page) - 1) * LIMIT; // get the start index of every page
        const total = await Post.countDocuments({});

        const posts = await Post.find().sort({ createdAt: -1 }).limit(LIMIT).skip(startIndex);

        res.status(200).json({ 
            data: posts, currentPage: Number(page), numberOfPages: Math.ceil(total / LIMIT)
        });
    } catch (error) {
        res.status(404).json({ message: error });
    }
}

const getPost = async (req, res) => {
    const { id } = req.params;

    try {
        const post = await Post.findById(id);

        res.status(200).json(post);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

const getPostBySearch = async (req, res) => {
    const { searchQuery, tags } = req.query;

    try {
        const title = new RegExp(searchQuery, 'i');

        const posts = await Post.find(
            { $or: [ { title }, { tags: { $in: tags?.split(',') } }] }
        );

        res.json({ data: posts });
        
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

const createPost = async (req, res) => {
    const {title, message, tags, likes} = req.body;
    const data = { selectedFile: req.file.path };

    
    try {
        const result = await cloudinary.uploader.upload(data.selectedFile, 
            {folder: 'pindro-social'}
        );

        const creator = await User.findById(req.userId);
        const newPost = new Post({
            title, message, tags, creator: creator.name, creator_id: req.userId, likes,
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
    const postUpdate = req.body;

    if (!mongoose.Types.ObjectId.isValid(_id)) {
        return res.status(404).send('No post with that id');
    }    

    try {      
        const updatedPost = await Post.findByIdAndUpdate(_id, 
            { ...postUpdate, _id}, { new: true }
        );
    
        res.json(updatedPost);
    } catch (error) {
        res.status(500).json({ message: error.message })
    }

}

const deletePost = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).send('No post with that id');
    }

    try {
        const post = await Post.findById(id);

        await cloudinary.uploader.destroy(post.selectedFile_id);

        post.deleteOne();

        res.json({ message: 'Post deleted successfully!'});
    } catch (error) {
        res.status(500).json({ message: error.message});
    }
}

const likePost = async (req, res) => {
    const { id } = req.params;

    if(!req.userId) {
        return res.status(403).json({ message: 'Unauthenticated' });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).send('No post with that id');
    }
    try {
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
    } catch (error) {
        res.status(500).json({ message: error.message})
    }
}

const postComment = async (req, res) => {
    const { id } = req.params;
    const { value } = req.body;

    try {
        const post = await Post.findById(id);

        post.comments.push(value);

        const updatedPost = await Post.findByIdAndUpdate(id, post, {new: true});
        res.status(201).json(updatedPost);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports = { 
    getPosts, getPost, getPostBySearch, createPost, updatePost, deletePost, likePost,
    postComment
}