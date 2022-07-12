let express = require('express')
let linkDB = require('../../db/link')
let multer = require('multer')
let path = require('path')
let articleDB = require('../../db/article')
let fs = require('fs')
let upload = multer({
    storage: multer.diskStorage({
        // 存储的目录
        destination(req, file, cb) {
            cb(null, path.join(__dirname, '../../public/md'))
        },
        // 存储的文件名
        filename(req, file, cb) {
            let fileName = Date.now().toString(36) + ((Math.random() * 100000) | 0) + ".md"
            req.fileName = fileName
            cb(null, fileName)
        }
    })
}).array('file')
let router = express.Router()
// 鉴权
router.use((req, res, next) => {
    // 验证有没有登录
    if (!req.session.userInfo) {
        return res.send({
            code: 1,
            msg: "请先登录"
        })
    }
    // 判断是不是管理员
    // if (!req.session.userInfo.admin) {
    //     return res.send({
    //         code: 1,
    //         msg: "你不是管理员"
    //     })
    // }
    next()
})

// 添加友链
router.post("/linkAdd", async (req, res) => {
    let { name, home, logo, des } = req.body
    // 验证数据
    if (!name || !home || !logo || !des) {
        return res.send({
            code: 1,
            msg: '内容不能为空'
        })
    }
    // 检查有没有相同域名
    let doc = await linkDB.findOne({ home })
    // 如果有 则更新
    if (doc) {
        await linkDB.updateOne({ home }, req.body)
        return res.send({
            code: 0,
            msg: "更新完成"
        })
    }
    // 不存在添加新的
    await linkDB.create(req.body)
    res.send({
        code: 0,
        msg: "添加完成"
    })
})

// 删除友链
router.delete("/linkDelete", async (req, res) => {
    let { _id } = req.body
    // 通过id来删除
    await linkDB.findOneAndDelete(_id)
    // 返回前端
    res.send({
        code: 0,
        msg: "删除完成"
    })
})

// md上传
router.post("/upload", (req, res) => {
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

        res.send({
            code: 0,
            msg: "md上传成功",
            data: {
                fileName: req.fileName
            }
        })
    })
})

// 文章添加
router.post('/articleAdd', async (req, res) => {
    let { title, des, md } = req.body
    //判断
    if (!title.trim() || !des.trim() || !md.trim()) {
        return res.send({
            code: 1,
            msg: "数据格式错误"
        })
    }
    // 存储
    await articleDB.create({
        title,
        des,
        author: req.session.userInfo._id,
        md: '/md/' + md
    })
    // 返回前端 
    res.send({
        code: 0,
        msg: "上传完成"
    })
})

// 文章删除
router.delete('/articleDelete', async (req, res) => {
    let { _id, md } = req.body
    // 判断_id,md是不是空
    if (!_id || !md) {
        return res.send({
            code: 1,
            msg: "删除内容不能为空"
        })
    }
    // 删除文章数据 
    await articleDB.findByIdAndDelete(_id)
    //删除文件
    try {
        fs.unlinkSync(path.join(__dirname, "../../public" + md))
    } catch (e) { }
    res.send({
        code: 0,
        msg: '删除成功'
    })
})
module.exports = router