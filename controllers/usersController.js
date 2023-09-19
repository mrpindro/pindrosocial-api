const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cloudinary = require('../config/cloudinary');

const signUpUser = async (req, res) => {
    const {first_name, last_name, email, password, confirm_password } = req.body;

    try {
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({ message: "User already exist" });
        }

        if (password !== confirm_password) {
            return res.status(400).json({ message: "Password don't match" });
        }

        const hashedPwd = await bcrypt.hash(password, 10);

        const result = await cloudinary.uploader.upload(req.file.path, {folder: 'pindro-social'});

        const newUser = await User.create(
            { email, password: hashedPwd, name: `${first_name} ${last_name}`, 
                imageUrl: result.secure_url, imageUrl_id: result.public_id
            }
        );

        const token = jwt.sign(
            { email: newUser.email, id: newUser._id }, 
            process.env.ACCESS_TOKEN,
            { expiresIn: '1h' }
        );

        res.status(201).json({ result: newUser, token })
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const loginUser = async (req, res) => {
    const { email, password } = req.body;
    
    try {
        const existingUser = await User.findOne({ email });

        if (!existingUser) {
            return res.status(404).json({ message: "User doesn't exist.." });
        }

        const isPassword = await bcrypt.compare(password, existingUser.password);

        if(!isPassword) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign(
            { email: existingUser.email, id: existingUser._id }, 
            process.env.ACCESS_TOKEN, 
            { expiresIn: '1h' }
        );

        res.status(200).json({ result: existingUser, token })
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports = {signUpUser, loginUser}