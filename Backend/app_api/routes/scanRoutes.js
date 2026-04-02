const express = require("express");
const router = express.Router();
const scanController = require("../controllers/scanController");
const multer = require("multer");
const {protect} = require("../middleware/auth");
const storage = multer.memoryStorage();
const upload = multer({storage:storage});

router.post("/resim_tanitma", protect, upload.single("image"), scanController.resimTanıtma); 
router.get("/kayit_getir", protect, scanController.KayıtGetir); 
router.get('/gecmis', protect, scanController.KayıtGetir);
module.exports = router;