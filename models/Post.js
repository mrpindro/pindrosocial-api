const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    title: String,
    message: String,
    creator: String,
    creator_id: String,
    tags: [String],
    selectedFile: String,
    selectedFile_id: String,
    likes: { type: [String], default: [] },
    comments: { type: [String], default: [] }
},
{ 
    timestamps: true 
});

module.exports = mongoose.model('Post', postSchema);