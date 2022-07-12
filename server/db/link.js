let mongoose = require('mongoose')
let Schema = mongoose.Schema
let linkSchema = new Schema({
    // 名称
    name: {
        type: String,
        required: true
    },
    // 主页
    home: {
        type: String,
        required: true
    },
    // 图标 
    logo: {
        type: String,
        required: true
    },
    // 描述
    des: {
        type: String,
        required: true
    }
}, { versionKey: false })

module.exports = mongoose.model('link', linkSchema)