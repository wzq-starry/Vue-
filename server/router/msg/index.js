let express = require('express')
let router = express.Router()
let msgDB = require('../../db/msg')
let mongoose = require('mongoose')

// 留言发表
router.post('/report', async (req, res) => {
    let msg = req.body.msg
    // 判断用户是否登录
    if (!req.session.userInfo.user) {
        return res.send({
            code: 1,
            msg: '请先登录！'
        })
    }
    // 判断留言内容是否为空
    if (!msg.trim()) {
        return res.send({
            code: 2,
            msg: "请输入留言内容。"
        })
    }
    // 储存到数据库
    await msgDB.create({
        msg,
        user: req.session.userInfo._id
    })

    res.send({
        code: 0,
        msg: "留言完成"
    })
})

// 留言获取 
router.get('/get', async (req, res) => {
    // 获取数据库留言
    let data = await msgDB.find({}, {}, { sort: { date: -1 } })
        .populate('user', { pass: 0 })
        .populate('children.user', { pass: 0 })
        .populate('children.replyUser', { pass: 0 })
    //返回前端
    res.send({
        code: 0,
        msg: "留言数据请求成功",
        data
    })
})

//子留言提交
router.post('/reply', async (req, res) => {
    // 判断用户是否登录
    if (!req.session.userInfo.user) {
        return res.send({
            code: 1,
            msg: '请先登录！'
        })
    }
    let data = req.body
    //验证数据
    if (!data.msg || !data._id || !data.replyUser) {
        return await res.send({
            code: 1,
            msg: "数据格式错误"
        })
    }
    // //存储
    try {
        await msgDB.findByIdAndUpdate({ _id: data._id }, {
            $push: {
                children: {
                    msg: data.msg,
                    user: req.session.userInfo._id,
                    replyUser: data.replyUser
                }
            }
        })
        res.send({
            code: 0,
            msg: "回复成功"
        })
    } catch (e) {
        res.send({
            code: 1,
            msg: e
        })
    }

})

// 点赞
router.post('/like', async (req, res) => {
    //验证用户是否登录
    if (!req.session.userInfo) {
        return res.send({
            code: 2,
            msg: "用户未登录"
        })
    }
    let { item, childItem } = req.body
    let replyUserId = req.session.userInfo._id
    // 子留言
    if (childItem) {
        let doc = (await msgDB.findById(item._id)).children.id(childItem._id)
        let likes = [...doc.likes].map(item => (mongoose.Types.ObjectId(item)).toString())
        let index = likes.indexOf(replyUserId)
        if (index !== -1) {
            // 删除
            likes.splice(index, 1)
        } else {
            // 添加
            likes.push(replyUserId)
        }
        // 添加到数据库
        await msgDB.updateOne({ _id: item._id, 'children._id': childItem._id }, { $set: { 'children.$.likes': likes } })
        return res.send({
            code: 0,
            msg: "点赞完成"
        })
    }
    // 父留言
    let doc = await msgDB.findById(item._id)
    let likes = [...doc.likes].map(item => (mongoose.Types.ObjectId(item)).toString())
    let index = likes.indexOf(replyUserId)
    if (index !== -1) {
        // 存在就删除
        likes.splice(index, 1)
    } else {
        // 不存在就添加
        likes.push(replyUserId)
    }
    await msgDB.updateOne({ _id: item._id }, {
        $set: { likes }
    })
    // 点赞成功
    return res.send({
        code: 0,
        msg: '点赞完成'
    })
})
module.exports = router