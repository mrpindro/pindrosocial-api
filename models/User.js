const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    id: String,
    // confirm_password: { type: String, required: true },
    imageUrl: String,
    imageUrl_id: String,
}, {
    timestamps: true
})

module.exports = mongoose.model('User', userSchema);