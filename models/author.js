const mongoose = require('mongoose')
const Book = require('./books')

const authorSchema = new mongoose.Schema({
    name : {
        type:String,
        required:true
    }
})

module.exports = mongoose.model('Authors',authorSchema)