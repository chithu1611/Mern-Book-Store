const express = require('express')
const router = express.Router()
const Books = require('../models/books')
const Authors = require('../models/author')


const imageMimeTypes = ['image/jpeg','image/jpg','image/png','image/gif']


// All Books Route
router.get('/',async(req,res) => {
    let query = Books.find()

    if(req.query.title != null && req.query.title != ''){
        query = query.regex('title',new RegExp(req.query.title,'i'))
    }

    if(req.query.publishedAfter != null && req.query.publishedAfter != ''){
        query = query.gte('publishDate',req.query.publishedAfter)
    }

    if(req.query.publishedBefore != null && req.query.publishedBefore != ''){
        query = query.lte('publishDate',req.query.publishedBefore)
    }

    try{
        const books = await query.exec()

        res.render('books/book',{
            book : books,
            searchOptions : req.query
        })
    }catch{
        res.redirect('/')
    }

})

// New Book Route
router.get('/new',async (req,res) => {
    renderNewPage(res,new Books());
})

// Create Book Route
router.post('/', async (req, res) => { 
    const book = new Books({
        title:req.body.title,
        author:req.body.author,
        publishDate:new Date(req.body.date),
        pageCount:req.body.pageCount,
        description:req.body.description

    })
    saveCover(book,req.body.cover)

    try {
        const newBook = await book.save();
        res.redirect(`/books/${newBook.id}`);

    } catch (err) {
        renderNewPage(res,book,true)
    }
});

// Show Book Route

router.get('/:id',async (req,res)=>{
    try{
        const book = await Books.findById(req.params.id).populate('author').exec()

        res.render('books/show',{
            bkelem : book,
        })
    }
    catch{
        res.redirect('/')
    }
})

// Edit Book Route

router.get('/:id/edit',async (req,res) => {
    try{
        const book = await Books.findById(req.params.id)
        renderEditPage(res,book);
    }catch{

        res.redirect('/')
    }
    
})

// delete the book

router.delete('/:id',async(req,res)=>{
    let book
    try{
        book = await Books.findById(req.params.id)
        await book.deleteOne()
        res.redirect('/books')
    }catch{

        if(book != null){
            res.render('books/show',{
                bkelem: book,
                errorMessage: "Could not remove the book",
            })
        }
        else{
            res.redirect('/')
        }

    }
})





async function renderEditPage(res,book,hasError = false){
    try{
        const author = await Authors.find({});
        const params = { 
            authors:author,
            book:book,
        }
        if (hasError) params.errorMessage = 'Error in Updating Book'
        res.render('books/edit',params)// this is the file path not the URL path

    }catch{ 
        res.redirect('/books') // this is the URL path
    }
}


function saveCover(book,coverEncoded){
    if (coverEncoded == null) return
    const cover = JSON.parse(coverEncoded)
    if (cover != null && imageMimeTypes.includes(cover.type)){
        book.coverImage = new Buffer.from(cover.data,'base64')
        book.coverImageType = cover.type
    }
}


async function renderNewPage(res,book,hasError = false){
    try{
        const author = await Authors.find({});
        const params = { 
            authors:author,
            book:book,
        }
        if (hasError) params.errorMessage = 'Error in Creating Book'
        res.render('books/new',params)// this is the file path not the URL path

    }catch{ 
        res.redirect('/books') // this is the URL path
    }
}

//Update Book Route
router.put('/:id', async (req, res) => { 
    let book

    try {
        book = await Books.findById(req.params.id)
        book.title = req.body.title
        book.author = req.body.author
        book.publishDate = new Date(req.body.date)
        book.pageCount = req.body.pageCount
        book.description = req.body.description
        if(req.body.cover != null && req.body.cover != ""){
            saveCover(book,req.body.cover)
        }
        await book.save()
        res.redirect(`/books/${book.id}`)

    } catch (err) {
        if (book != null){
            renderEditPage(res,book,true)    
        }else{
            re.redirect('/')
        }
    }
});


module.exports = router