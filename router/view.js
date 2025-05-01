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
  res.render('view', { userName: req.session.userId, page: 'view' });
});

router.post("/getData", requireAuth, async (req, res) => {
    // console.log(req);
    try {
        const year = req.body.year;
        const week = req.body.week;
        const group = req.body.group;

        var data = [];

        data = await dbm.getCollectionData(group, year, week);

        res.send(data);
    } catch (err) {
        res.send(err);
    }
});

router.post("/updateUser", requireAuth, async (req, res) => {
    // console.log(req);
    // console.log(req.body);
    try {
        const name = req.body.name;
        const week = req.body.week;
        const year = req.body.year;
        const fieldName = req.body.fieldName;
        const value = req.body.value;
        const group = req.body.group;


        // 
        dbm.updateUser(name, week, year, fieldName, value, group);

        // const response = db.collection("users").doc(name).collection("2025").doc(week).set(userJson);
        res.send("success");
    } catch (err) {
        res.send(err);
    }
});

router.post("/updateTotalToSapphire", requireAuth, async (req, res) => {
  // console.log(req);
  // console.log(req.body);
  try {
      const week = req.body.week;
      const year = req.body.year;
      const obj = req.body.obj;

      dbm.updateTotalToSapphire(week, year, obj);

      res.send("success");
  } catch (err) {
      res.send(err);
  }
});

module.exports= router;
