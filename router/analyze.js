const express = require('express');
const router = express.Router();
const dbm = require("../lib/dbmanager");

const requireAuth = (req, res, next) => {
    if (req.session.userId) {
        next(); // User is authenticated, continue to next middleware
    } else {
        res.redirect('/login'); // User is not authenticated, redirect to login page
    }
}

//Analyze page

router.get('/', requireAuth, async function (req, res) {
    res.render('analyze', { userName: req.session.userId, page: 'analyze' });
});

router.post("/analyzeData", requireAuth, async (req, res) => {
    // console.log(req);
    try {
        const year = req.body.year;
        const weekFrom = req.body.weekFrom;
        const weekTo = req.body.weekTo;
        const name = req.body.name;
        const group = req.body.group;


        const data = await dbm.getAnalyzeData(year, weekFrom, weekTo, name, group);
        res.send(data);
    } catch (err) {
        res.send(err);
    }
});




module.exports = router;