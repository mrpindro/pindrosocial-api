const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    title: String,
    message: String,
    name: String,
    creator: String,
    tags: [String],
    selectedFile: String,
    selectedFile_id: String,
    likes: {
        type: [String],
        default: []
    }
},
{ 
    timestamps: true 
});

module.exports = mongoose.model('Post', postSchema);