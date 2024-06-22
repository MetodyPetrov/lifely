const router = require('express').Router();

const accountController = require('./controllers/accountController');
const postsController = require('./controllers/postsController');

router.use('/accounts', accountController);
router.use('/posts', postsController);

module.exports = router;