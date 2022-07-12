let express = require('express')
let router = express.Router()
let articleDB = require('../../db/article')

// 获取文章
router.get('/all', async (req, res) => {
    let data = await articleDB
        .find({}, {}, { sort: { pv: -1 } })
        .populate("author", { pass: 0 })
    res.send({
        code: 0,
        msg: '获取成功',
        data
    })
})

// 返回文章地址，并添加pv
router.post('/address', async (req, res) => {
    let { _id } = req.body
    // 找到该文章并添加pv浏览数
    let doc = await articleDB.findByIdAndUpdate(_id, { $inc: { pv: 1 } })
    if (!doc) {
        return res.send({
            code: 1,
            msg: 'id错误'
        })
    }
    // 返回前端
    res.send({
        code: 0,
        msg: '查找完成',
        data: doc.md
    })
})

// 返回三条热门文章
router.get('/hot', async (req, res) => {
    let data = await articleDB.find({}, {}, { skip: 0, limit: 3, sort: { pv: -1 } })
    res.send({
        code: 0,
        msg: "获取成功",
        data
    })
})

module.exports = router