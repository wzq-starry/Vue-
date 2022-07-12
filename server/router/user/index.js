let express = require('express')
let userDB = require('../../db/user')
let multer = require('multer')
let path = require('path')
let fs = require('fs')
let router = express.Router()
let upload = multer({
    storage: multer.diskStorage({
        // 存储的目录
        destination(req, file, cb) {
            cb(null, path.join(__dirname, '../../public/img/photo'))
        },
        // 存储的文件名
        filename(req, file, cb) {
            // 取到上传文件的后缀名
            let ext = /png/.test(file.mimetype) ? ".png" : ".jpg"
            // 给上传文件一个唯一的名字
            let fileName = req.session.userInfo._id + Date.now().toString(36) + ext
            req.fileName = fileName
            cb(null, fileName)
        }
    })
}).single('avatar')
// 鉴权 登录才能进入这个页面
router.use('/', (req, res, next) => {
    if (!req.session.userInfo) {
        return res.send({
            code: 4,
            msg: "用户未登录"
        })
    }
    next()
})


// 用户名修改
router.post('/name', async (req, res) => {
    let userObj = req.body
    // 验证用户是否符合标准
    let userR = /^[^\s]{2,6}$/;
    if (!userR.test(userObj.user)) {
        // 不符合标准
        return res.send({
            code: 1,
            msg: '用户名不符合规范'
        })
    }
    let data = await userDB.findOne({ user: userObj.user })
    // 查到了数据库里面已经有了这个用户名
    if (data) {
        // 有了用户名就不能更改
        return res.send({
            code: 4,
            msg: '用户名已存在'
        })
    }
    // 如果没有查找用户名，又符合规范则更改数据
    // 改数据库里面的数据
    await userDB.updateOne({ user: req.session.userInfo.user }, { user: userObj.user })
    // 改session记录的数据
    req.session.userInfo.user = userObj.user
    res.send({
        code: 0,
        msg: '修改完成'
    })
})

// 密码修改
router.post('/pass', async (req, res) => {
    // 接收到前端传过来的数据 
    let passObj = req.body
    // 判断这些数据符不符合规范
    let passR = /[\w,.?;<>/|\\:'"!@#$%^&*()+-]{6,16}/;
    // 判断密码是否符合规范
    if (!passR.test(passObj.oldPass) || !passR.test(passObj.pass)) {
        return res.send({
            code: 1,
            msg: '密码不符合规范'
        })
    }
    // 确认密码是否一致
    if (!(passObj.pass == passObj.pass2)) {
        return res.send({
            code: 1,
            msg: '两次密码不一致'
        })
    }

    // 通过session来找到对应的用户信息
    let userInfo = await userDB.findOne({ user: req.session.userInfo.user })
    // 判断密码是否是正确的
    if (!(passObj.oldPass == userInfo.pass)) {
        // 密码不相等
        return res.send({
            code: 3,
            msg: '原密码输入错误'
        })
    }
    // 修改的密码和原来的密码是否一致
    if (userInfo.pass == passObj.pass) {
        return res.send({
            code: 1,
            msg: '不能和原密码重复'
        })
    }
    // 修改密码
    await userDB.updateOne({ user: req.session.userInfo.user }, { pass: passObj.pass })
    // 销毁session
    req.session.destroy()
    // 返回前端 
    res.send({
        code: 0,
        msg: '密码修改成功'
    })
})

// 头像修改

router.post('/avatar', async (req, res) => {
    upload(req, res, async function (err) {
        if (err instanceof multer.MulterError) {
            // 发生错误
            res.send({
                code: 1,
                msg: "A Multer error occurred when uploading."
            })
        } else if (err) {
            // 发生错误
            res.send({
                code: 2,
                msg: 'An unknown error occurred when uploading.'
            })
        }
        // 代表成功
        //没有错误
        let user = req.session.userInfo.user
        let doc = await userDB.findOne({ user })
        let oldPhoto = doc.photo
        // 如果图片不是默认的图片的话，那就把先前的图片给删除
        if (!/default\.jpg/.test(oldPhoto)) {
            fs.unlink(path.join(__dirname, "../../public" + oldPhoto), () => { })
        }
        //更新数据库头像字段
        let newPath = "/img/photo/" + req.fileName
        await userDB.updateOne({ user }, { photo: newPath })
        // 更新session字段 
        req.session.userInfo.photo = newPath
        res.send({
            code: 0,
            msg: "头像上传完成",
            data: req.session.userInfo
        })
    })
})

module.exports = router