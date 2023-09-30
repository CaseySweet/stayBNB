const router = require('express').Router();
const { restoreUser } = require('../../utils/auth.js');
router.use(restoreUser);

const sessionRouter = require('./session.js');
const usersRouter = require('./users.js');
const spotsRouter = require('./spots.js')
const reviewsRouter = require('./reviews.js')
const bookingsRouter = require('./bookings.js')

router.use('/', sessionRouter);
router.use('/', usersRouter);
router.use('/', spotsRouter);
router.use('/', reviewsRouter);
router.use('/', bookingsRouter);

router.post('/test', function (req, res) {
    res.json({ requestBody: req.body });
});

router.get("/csrf/restore", (req, res) => {
    const csrfToken = req.csrfToken();
    res.cookie("XSRF-TOKEN", csrfToken);
    res.status(200).json({
        'XSRF-Token': csrfToken
    });
});

module.exports = router;
