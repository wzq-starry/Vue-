let mongoose = require('mongoose')
let Schema = mongoose.Schema

let userSchema = new Schema({
    // 用户名
    user: {
        type: String,
        required: true
    },
    // 密码
    pass: {
        type: String,
        required: true
    },
    // 头像
    photo: {
        type: String,
        default: '/img/photo/default.jpg'
    }
}, { versionKey: false })

module.exports = mongoose.model('user', userSchema)