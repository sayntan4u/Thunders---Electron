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


router.post('/', requireAuth, async function (req, res) {
    const group = req.body.group;
    // console.log(group);
    var docArray = [];

    if (group == "SKB") {
        docArray = await dbm.getUserNames();
    } else {
        docArray = await dbm.getUserNamesSapphire();
    }

    res.send(docArray);
});

router.post('/onlyNames', requireAuth, async function (req, res) {
    const group = req.body.group;
    // console.log(group);
    var docArray = [];
    docArray = await dbm.getOnlyUserNames(group);
    res.send(docArray);
});

module.exports = router;