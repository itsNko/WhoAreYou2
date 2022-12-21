var express = require('express');
var router = express.Router();

router.get('/', (req, res, next) => {
    req.session.destroy();
    res.redirect('index.html');
})

module.exports = router;