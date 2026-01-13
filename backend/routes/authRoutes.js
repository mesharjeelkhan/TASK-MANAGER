const express =require("express");
const { registerUser, loginUser, getUserProfile, updateUserProfile } = require ("../controllers/authController")
const { protect } = require("../middleware/authMiddleware")
const upload = require("../middleware/uploadMiddleware");


const router = express.Router();

//Auth Routes

router.post("/register", registerUser); // RU
router.post("/login", loginUser); // LU
router.get("/profile", protect, getUserProfile); //GUD
router.put("/profile", protect, updateUserProfile); // UUP

router.post("/upload-image", upload.single("image"), (req, res) => { 
    if(!req.file){
        return res.status(400).json({ message: "No File Uploaded" });
    }
    const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${
        req.file.filename
    }`;
    res.status(200).json ({ imageUrl });
});

module.exports = router;


