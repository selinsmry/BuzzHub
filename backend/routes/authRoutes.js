const express = require("express");
const router = express.Router();
const { register, login, refresh, logout, changeUserRole } = require("../controllers/authController");
const verifyAdmin = require("../middleware/verifyAdmin");

router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refresh);
router.post("/logout", logout);
router.post("/change-role", verifyAdmin, changeUserRole);

module.exports = router;
