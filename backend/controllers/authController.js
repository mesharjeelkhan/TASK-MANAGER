const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Generate JWT Token
const generateToken = (userID) => {
    return jwt.sign({ id: userID }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// REGISTER USER
const registerUser = async (req, res) => {
    try {
        const { name, email, password, profileImageUrl, adminInviteToken } = req.body;

        // Check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({
                message: "User already exists"
            });
        }

        // Determine role
        let role = "member";
        if (
            adminInviteToken &&
            adminInviteToken === process.env.ADMIN_INVITE_TOKEN
        ) {
            role = "admin";
        }

        // Hash Password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create User
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            profileImageUrl,
            role,
        });

        // Send Response with JWT Token
        return res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            profileImageUrl: user.profileImageUrl,
            token: generateToken(user._id),
        });

    } catch (error) {
        return res.status(500).json({
            message: "Server Error",
            error: error.message
        });
    }
};

// LOGIN USER
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const user = await User.findOne ({ email });
        if (!user) {
            return res.status(401).json ({ message: "Invalid email or password" });
        }
            
        // Compare Password

        const isMatch = await bcrypt.compare(password, user.password);
            if(!isMatch) {
                return res.status(401).json({ message: "Invalid Email or Password" });
            }
            res.json ({
                id:user._id,
                name: user.name,
                email: user.email,
                role:user.role,
                profileImageUrl: user.profileImageUrl,
                token: generateToken (user._id),
            })

    } catch (error) {
        return res.status(500).json({
            message: "Server Error",
            error: error.message
        });
    }
};

// GET USER PROFILE
const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
            if(!user) {
                return res.status(404).json ({ message:"User not Found" });
            }
            res.json(user);
    } catch (error) {
        return res.status(500).json({
            message: "Server Error",
            error: error.message
        });
    }
};

// UPDATE USER PROFILE
const updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if(!user) {
            return res.status(404).json({ message: " User Not Found " });
        }
        
        user.name = req.body.name || user.name;
        user.email = await bcrypt.hash(req.body.password, salt);

        if (req.body.password) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(req.body.password, salt);
        }
        
        const updateUser = await user.save();
        
        res.json({
            _id: updateUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            token: generateToken(updateUser._id),
        });

    } catch (error) {
        return res.status(500).json({
            message: "Server Error",
            error: error.message
        });
    }
};

module.exports = { registerUser, loginUser, getUserProfile, updateUserProfile };
