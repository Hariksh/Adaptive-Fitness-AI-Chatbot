const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) return res.status(400).json({ error: "All fields are required" });

        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ error: "User already exists" });

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({ name, email, password: hashedPassword });

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || "default_secret", { expiresIn: "7d" });

        res.json({ token, user: { name: user.name, email: user.email } });
    } catch (error) {
        console.error("Register Error:", error);
        res.status(500).json({ error: "Registration failed" });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ error: "All fields are required" });

        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ error: "Invalid credentials" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || "default_secret", { expiresIn: "7d" });

        res.json({ token, user: { name: user.name, email: user.email } });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ error: error.message });
    }
};

exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select("-password");
        if (!user) return res.status(404).json({ error: "User not found" });
        res.json(user);
    } catch (error) {
        console.error("Get Profile Error:", error);
        res.status(500).json({ error: "Failed to fetch profile" });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const { name, email, password, age, gender, height, weight, fitnessGoal, fitnessLevel } = req.body;

        const updates = { name, email, age, gender, height, weight, fitnessGoal, fitnessLevel };

        // Remove undefined/empty fields
        Object.keys(updates).forEach(key => updates[key] === undefined && delete updates[key]);

        if (password && password.trim() !== "") {
            const hashedPassword = await bcrypt.hash(password, 10);
            updates.password = hashedPassword;
        }

        const user = await User.findByIdAndUpdate(
            req.user.userId,
            updates,
            { new: true, runValidators: true }
        ).select("-password");

        if (!user) return res.status(404).json({ error: "User not found" });

        res.json(user);
    } catch (error) {
        console.error("Update Profile Error:", error);
        res.status(500).json({ error: "Failed to update profile" });
    }
};
