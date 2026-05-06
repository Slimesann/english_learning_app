import express from "express";
import User from "../models/user.js";
const router = express.Router();

router.post("/make-admin", async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ msg: "Không tìm thấy user" });
    user.role = "admin";
    await user.save();
    res.json({ msg: `Đã gán quyền admin cho ${email}` });
});

export default router;
