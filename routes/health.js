const express = require("express")
const router = express.Router()

router.get("/health", (req, res) =>{
    res.status(200).send("Hello la team")
})

module.exports = router;