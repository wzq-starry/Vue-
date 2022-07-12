let express = require('express')
let router = express.Router()
let userDB = require('../../db/user')
let visitorDB = require('../../db/visitor')

router.post('/', async (req, res) => {
    let { user, pass } = req.body

    // 检测用户密码是否符合规范
    let userR = /^[^\s]{2,6}$/,
        passR = /[\w,.?;<>/|\\:'"!@#$%^&*()+-]{6,16}/;

    // 检查用户名是否满足规范
    if (!userR.test(user)) {
        // 用户名不满足规范
        return res.send({
            code: 1,
            msg: '数据格式错误'
        })
    }

    // 检查密码是否满足规范
    if (!passR.test(pass)) {
        return res.send({
            code: 2,
            msg: '密码错误'
        })
    }

    // 在数据库查找用户的用户名和密码
    let doc = await userDB.findOne({ user })

    // 如果用户名不存在
    if (!doc) {
        return res.send({
            code: 3,
            msg: '用户名不存在'
        })
    }


    // 如果密码错误
    if (doc.pass !== pass) {
        return res.send({
            code: 4,
            msg: '密码错误'
        })
    }

    // 登录成功记录一下session
    req.session.userInfo = {
        _id: doc._id,
        user: doc.user,
        photo: doc.photo
    }

    //添加当前用户到访问表
    let visitorDOC = await visitorDB.findOne({ visitor: doc._id })
    if (visitorDOC) {
        await visitorDB.updateOne({ visitor: doc._id }, { date: Date.now() })
    } else {
        await visitorDB.create({ visitor: doc._id })
    }

    // 登录成功
    return res.send({
        code: 0,
        msg: "登录成功",
        data: {
            user: doc.user,
            photo: doc.photo
        }
    })
})

// 检查是否登录过
router.post('/check', async (req, res) => {
    if (req.session.userInfo) {
        //添加当前用户到访问表
        let visitorDOC = await visitorDB.findOne({ visitor: req.session.userInfo._id })
        if (visitorDOC) {
            await visitorDB.updateOne({ visitor: req.session.userInfo._id }, { date: Date.now() })
        } else {
            await visitorDB.create({ visitor: req.session.userInfo._id })
        }
        return res.send({
            code: 0,
            msg: '已登录',
            data: req.session.userInfo
        })
    } else {
        return res.send({
            code: 1,
            msg: '未登录',
            data: {}
        })
    }
})

// 退出登录
router.post('/logout', (req, res) => {
    req.session.destroy()//session销毁
    res.send({
        code: 0,
        msg: '退出登入成功'
    })
})
module.exports = router