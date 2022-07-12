let express = require('express')
let router = express.Router()
let linkDB = require('../../db/link')

// 获取友链
router.get('/', async (req, res) => {
    let data = await linkDB.find({})
    res.send({
        code: 0,
        msg: '获取成功',
        data
    })
})
module.exports = router