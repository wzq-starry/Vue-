let express = require('express')

let router = express.Router()
// 登录接口
router.use('/login', require('./login/index'))
// 注册接口
router.use('/reg', require('./reg/index'))
//用户信息修改接口
router.use('/user', require('./user/index'))
// 留言接口
router.use('/msg', require('./msg/index'))
// admin相关接口
router.use('/admin', require('./admin/index'))
// 获取友链接口
router.use('/linkServer', require('./linkServer/index'))
// 获取文章接口
router.use('/art', require('./art/index'))
// 获取访客的接口
router.use('/visitor', require('./visitor/index'))
module.exports = router