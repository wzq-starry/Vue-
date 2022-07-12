let express = require('express')
let router = express.Router()
let userDB = require('../../db/user')

router.post('/', async (req, res) => {
    // 拿到前端给的用户和密码
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

    // 检测用户名是否已经存在
    let doc = await userDB.findOne({ user })
    if (doc) {
        return res.send({
            code: 2,
            msg: '用户名已经存在'
        })
    }

    // 创建文档
    await userDB.create({ user, pass })
    return res.send({
        code: 0,
        msg: '用户注册成功'
    })
})

module.exports = router