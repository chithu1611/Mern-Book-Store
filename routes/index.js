const express = require('express')
const Books = require('../models/books')
const router = express.Router()

router.get('/', async (req, res) => {
    let books
    try {
        books = await Books.find().sort({
            createdAt: 'desc'
        }).limit(10).exec()
    } catch {
        books = []
    }
    res.render('index', {
        book: books
    })

})


module.exports = router