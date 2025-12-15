const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { User } = require("../models");

function generateAccessToken(user){
    return jwt.sign(
        { id: user._id, username: user.username, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "15m"}
    );
}

function generateRefreshToken(user){
    return jwt.sign(
        { id: user._id, username: user.username, role: user.role },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: "5h"}
    );
}

// REGISTER
exports.register = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Şifre en az 6 karakter olmalı
        if (!password || password.length < 6) {
            return res.status(400).json({ error: "Şifre en az 6 karakter olmalıdır" });
        }

        const hashed = await bcrypt.hash(password, 6);

        const newUser = await User.create({
            username,
            email,
            password: hashed
        });

        res.json({ message: "User created successfully." });

    } catch(error) {
        res.status(500).json({ error: "Registration failed." });

    }
};

// LOGIN
exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Şifre en az 6 karakter olmalı
        if (!password || password.length < 6) {
            return res.status(400).json({ error: "Şifre en az 6 karakter olmalıdır" });
        }

        const user = await User.findOne({ username });
        if(!user) return res.status(404).json({ error: "User not found" });

        const match = await bcrypt.compare(password, user.password);
        if(!match) return res.status(401).json({ error: "Incorrect password" });

        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        res.json({
            accessToken,
            refreshToken,
            user: { id: user._id, username: user.username, role: user.role }
        });

    } catch (error) {
        res.status(500).json({ error: "Login failed." });
    }
};

// REFRESH
exports.refresh = (req, res) => {
    const { token } = req.body;

    if (!token) return res.status(401).json({ error: "No token" });

    try {
        const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);

        const accessToken = jwt.sign(
            { id: decoded.id, username: decoded.username, role: decoded.role },
            process.env.JWT_SECRET,
            { expiresIn: "15m" }
        );

        res.json({ accessToken });

    } catch (error) {
        res.status(403).json({ error: "Invalid refresh token" });
    }

};

// LOGOUT
exports.logout = (req, res) => {
  res.json({ message: "Logout successful" });
};

// CHANGE USER ROLE
exports.changeUserRole = async (req, res) => {
  try {
    const { userId, role } = req.body;

    if (!userId || !role) {
      return res.status(400).json({ error: "User ID and role are required" });
    }

    const validRoles = ['user', 'moderator', 'admin'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: "Invalid role" });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ message: "User role updated successfully", user });
  } catch (error) {
    res.status(500).json({ error: "Failed to change user role" });
  }
};


