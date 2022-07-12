let mongoose = require('mongoose');
let Schema = mongoose.Schema

let msgSchema = new Schema({
    // 留言
    msg: {
        type: String,
        required: true
    },
    // 时间
    date: {
        type: Number,
        default: Date.now
    },
    // 用户
    user: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    //点赞
    likes: [Schema.Types.ObjectId],

    //子留言
    children: [{
        // 内容
        msg: { type: String, required: true },
        // 时间
        date: { type: Number, default: Date.now },
        // 用户信息
        user: { type: Schema.Types.ObjectId, ref: "user", required: true },
        // 点赞
        likes: [Schema.Types.ObjectId],
        //回复的是谁
        replyUser: { type: Schema.Types.ObjectId, ref: "user", required: true }
    }]
}, { versionKey: false })

module.exports = mongoose.model('msg', msgSchema)