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
    res.render('agenda', { userName: req.session.userId, page: 'agenda' });
});

router.post('/getAgendas', requireAuth, async function (req, res) {
    const date = req.body.date;
    const data = await dbm.getAgendas(date);
    res.send(data);
});

router.post('/addAgenda', requireAuth, async function (req, res) {
    const task = req.body.task;
    const id = req.body.id;
    const date = req.body.date;
    dbm.addAgenda(date, task, id);
});

router.post('/updateAgenda', requireAuth, async function (req, res) {
    const task = req.body.task;
    const id = req.body.id;
    const date = req.body.date;
    dbm.updateAgenda(date,task, id);
});

router.post('/updateConfirmAgenda', requireAuth, async function (req, res) {
    const time = req.body.time;
    const id = req.body.id;
    const isCompleted = req.body.isCompleted;
    const date = req.body.date;
    dbm.updateAgenda(date, "", id, isCompleted, time);
});

router.post('/deleteAgenda', requireAuth, async function (req, res) {
    const id = req.body.id;
    const date = req.body.date;
    dbm.deleteAgenda(date, id);
});

module.exports = router;