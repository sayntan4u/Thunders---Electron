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

router.post('/getRoster', requireAuth, async function (req, res) {
    const data = await dbm.getRosterData();
    res.send(data);
});

router.post('/updateRoster', requireAuth, function (req, res) {
    const { day, time, irName } = req.body;
    // console.log(day, time, irName);
    dbm.updateRoster(day, time, irName);
});

router.post('/clearRoster', requireAuth, function (req, res) {
    dbm.clearRoster();
});

module.exports = router;