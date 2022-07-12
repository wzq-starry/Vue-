let express = require("express")
let app = express()
let path = require('path')

// 监听
app.listen(3000)

// 跨域
app.use(require('./middleware/cors'))
// 启动数据库
require('./middleware/mongoose')
// 解析代码
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
// session
app.use(require('./middleware/session'))
// 静态资源库
app.use(express.static(path.join(__dirname, './public')))

// 路由入口
app.use('/', require('./router/index'))

//解决history模式 刷新/手动输入 无法访问
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "./public/index.html"))
})