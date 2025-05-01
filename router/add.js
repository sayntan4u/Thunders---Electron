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


router.get('/', requireAuth, async function (req, res) {
    res.render('add', { userName: req.session.userId, page: 'add' });
});

router.post("/addUser", requireAuth, async (req, res) => {
    const name = req.body.name;
    const group = req.body.group;

    await dbm.addUser(name, group);
    res.send("success");

});

router.post("/getNames", requireAuth, async (req, res) => {

    const docArray = await dbm.getUserNames();

    res.send(docArray);
});

router.post("/getNamesSapphire", requireAuth, async (req, res) => {

    const docArray = await dbm.getUserNamesSapphire();
    res.send(docArray);
});

router.post("/updateNamelist", requireAuth, async (req, res) => {
    const name = req.body.name;
    const link = req.body.link;

    dbm.updateNamelist(name, link);

    res.redirect("/add");
});

router.post("/delete", requireAuth, async (req, res) => {
    const name = req.body.name;
    const group = req.body.group;

    await dbm.delete(name, group);

});




module.exports = router;