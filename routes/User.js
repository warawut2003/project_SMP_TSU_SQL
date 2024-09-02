const express = require('express');
const router = express.Router();

const {CreateUser} = require("../controllers/userController");

router.post("/", async(req,res)=>{
    res.sendStatus(404);
});

router.post("/CreateUser",CreateUser);
//router.post("/login",login);
//router.post("/refresh",refresh);

module.exports = router;