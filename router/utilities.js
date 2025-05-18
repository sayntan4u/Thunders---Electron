const express = require('express');
const router = express.Router();
const util = require("../lib/utilitiesmanager");

const requireAuth = (req, res, next) => {
  if (req.session.userId) {
    next(); // User is authenticated, continue to next middleware
  } else {
    res.redirect('/login'); // User is not authenticated, redirect to login page
  }
}


router.get('/', requireAuth, function (req, res) {
  res.render('utilities', { userName: req.session.userId, page: 'utilities' });
});

//method for generating legal doc for Utilities
router.post("/generateLegalDoc", requireAuth, async (req, res) => {
  try {

    const bufBoth = util.createLegalDocumentAndDeclaration(
      req.body.prospectName,
      req.body.prospectAddress,
      req.body.irID,
      req.body.amt,
      req.body.amtWords,
      req.body.bankName,
      req.body.bankAcc,
      req.body.irName,
      req.body.irAddress,
      req.body.product1,
      req.body.product2,
      req.body.product3,
      req.body.product4
    );
    // console.log(buf);
    res.writeHead(200, {
      'Content-Type': 'application/octet-stream; charset=utf-8',
      'Content-Disposition' : 'attachment; filename="declaration.docx"',
      'Content-Length': bufBoth.length
    });
    res.end(bufBoth);
    // res.send(outputFiles);
  } catch (err) {
    res.send(err);
  }
});



module.exports = router;