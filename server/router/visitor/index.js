let express = require('express')
let router = express.Router()
let visitorDB = require('../../db/visitor')
router.get('/', async (req, res) => {
    let data = await visitorDB
        .find({}, {}, { sort: { date: -1 } })
        .populate("visitor", { pass: 0 })
    res.send({
        code: 0,
        msg: '完成',
        data
    })
})

module.exports = router