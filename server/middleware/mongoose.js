let mongoose = require('mongoose')

mongoose.connect('mongodb://localhost:3335/blog').then(() => {
    console.log('数据库连接成功')
}).catch(e => {
    console.log('数据库连接失败', e)
})