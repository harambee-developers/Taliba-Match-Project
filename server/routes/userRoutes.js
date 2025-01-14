const express = require("express");
const User = require("../model/User");
const router = express.Router();

router.get("/users", async (req, res) => {
    try {
      const user = await User.find({});
      res.json(user);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
router.get("/user/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const user = await User.findById(id);
      res.json(user);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

router.delete("/user/delete/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const user = await User.findByIdAndDelete(id);
  
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      res.json({ message: "User deleted successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal Server error" });
    }
  });

module.exports = router