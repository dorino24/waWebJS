const express = require("express");
const router = express.Router();
const {api,qr,cek} = require('../controllers/WhatsappWebSession')

router.post("/api",api);
router.get("/qr",qr);
router.get("/cek",cek);

module.exports = router;