const express = require('express');
const router = express.Router();

const {nonEndProject} = require("../controllers/projectController");
router.post("/", async(req,res)=>{
    res.sendStatus(404);
});
router.get("/latest",nonEndProject);
// router.get("/:project_id",getProject);
// router.get("/", getProjects);

module.exports = router;