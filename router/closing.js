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

router.get('/', requireAuth, function (req, res) {
    res.render('closing', { userName: req.session.userId, page: 'closing' });
});

router.post('/getClosings', requireAuth, async function (req, res) {
    var docArray = [];
    docArray = await dbm.getClosings();
    // console.log(docArray);
    res.send(docArray);
});

router.post('/addClosing', requireAuth, async function (req, res) {
    await dbm.addClosing(req.body);
    res.send("added closing");
});

router.post('/updateClosingStatus', requireAuth, async function (req, res) {
    const id = req.body.id;
    const status = req.body.status;

    await dbm.updateClosingStatus(id, status);
    // console.log("updated");
});

router.post('/updateClosingUV', requireAuth, async function (req, res) {
    const id = req.body.id;
    const uv = req.body.uv;

    await dbm.updateClosingUV(id, uv);

    // console.log("updated");
});

router.post('/deleteClosing', requireAuth, async function (req, res) {
    const id = req.body.id;
    await dbm.deleteClosing(id);
    res.send("deleted !");
});




module.exports = router;