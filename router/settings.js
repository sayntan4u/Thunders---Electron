const express = require('express');
const router = express.Router();
var formidable = require('formidable');
const fs = require("fs");
const dbm = require("../lib/dbmanager");

const requireAuth = (req, res, next) => {
    if (req.session.userId) {
        next(); // User is authenticated, continue to next middleware
    } else {
        res.redirect('/login'); // User is not authenticated, redirect to login page
    }
}

router.get('/', requireAuth, function (req, res) {
    res.render('settings', { userName: req.session.userId, page: 'settings' });
});


router.get("/getStatus", requireAuth, async (req, res) => {
    res.send(dbm.statusJson);
});

router.post("/getSettings", requireAuth, async (req, res) => {
    // try {
    //     fs.readFile('./settings.conf', 'utf8', (err, data) => {
    //         if (err) {
    //             console.error(err);
    //             return;
    //         }
    //         // const json = JSON.parse(data);
    //         res.send(data);
    //     });

    // } catch (err) {
    //     res.send(err);
    // }

    const data = await dbm.getSettings();
    res.send(data);
});

router.post("/saveSettings", requireAuth, async (req, res) => {
    const config = req.body.config;

    await dbm.saveSettings(config);

    res.send("success");
});

router.post("/updateShowProfit", requireAuth, async (req, res) => {
    const config = req.body.config;
    await dbm.updateShowProfit(config);
    res.send("success");
});

router.post("/export", requireAuth, async (req, res) => {
    const group = req.body.group;
    const field = req.body.field;

    dbm.statusJson.procName = "Export";

    const data = await dbm.getFullCollectionData(group, field);

    // const dt = new Date();

    // try {
    //     fs.writeFile(
    //         './backup/' + group + '_' + field + '_' + dt.toString().replace(/:/g, "") + '.db',
    //         JSON.stringify(data, null, 2),
    //         function (err) {
    //             if (err) throw err;
    //             // console.log('Saved!');
    //             res.send("Saved");
    //         });

    // } catch (err) {
    //     res.send(err);
    // }
    // res.writeHead(200, {
    //     'Content-Type': 'text/plain',
    //     'Content-disposition': 'attachment;filename=backup.db',
    //     'Content-Length': data.length
    // });
    // res.end(JSON.stringify(data, null, 2));
    res.send(data);
});

router.post("/upload", requireAuth, async (req, res) => {
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        // console.log(files.file[0].filepath);
        var oldpath = files.file[0].filepath;
        // var newpath = './uploads/' + files.file[0].originalFilename;
        // fs.copyFileSync(oldpath, newpath);

        dbm.uploadFullCollectionData(oldpath);
    });
});



module.exports = router;