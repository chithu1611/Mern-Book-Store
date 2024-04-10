const express = require('express')
const router = express.Router()
const Authors = require('../models/author')
const Books = require('../models/books')


// All Authors page
router.get('/', async(req,res) => {
    let searchOptions = {};
    if (req.query.name != null && req.query.name !== ""){
        searchOptions.name = new RegExp(req.query.name,'i')
    }

    try{
        const authors = await Authors.find(searchOptions);
        res.render('author/author',{
            author:authors ,
            searchOptions: req.query
        })
    }
    catch(err){ 
        res.redirect('/')
    }
    
})

// New Author page
router.get('/new',(req,res) => {
    res.render('author/new',{author : new Authors()})
})

// Create one
router.post('/', async (req, res) => {
    const author = new Authors({
        name: req.body.Name
    });

    try {
        const newAuthor = await author.save();
        res.redirect(`/authors/${newAuthor.id}`);
    } catch (err) {
        res.render('author/new', {
            author: author,
            errorMessage: "Error creating author"
        });
    }
});


router.get('/:id',async (req,res)=>{
    try{
        const author = await Authors.findById(req.params.id)
        const book = await Books.find({author: author.id}).limit(6).exec()

        res.render('author/show',{
            author: author,
            booksByAuthor: book,
        })

    }catch{
        res.redirect('/')
    }
})

router.get('/:id/edit',async (req,res)=>{
    try{
        const authorobj = await Authors.findById(req.params.id)
        res.render('author/edit',{author : authorobj})
    }
    catch(err){
        res.redirect('/authors')
    }
})


// In order to make the browser to accept 'put' and 'delete' request we need to install library "method-override"
router.put('/:id',async (req,res)=>{
    // res.send('UPdate Author' + req.params.id)
    let author
    try {
        author = await Authors.findById(req.params.id)
        author.name = req.body.Name
        await author.save()
        res.redirect(`/authors/${author.name}`)
    } catch (err) {
        if (author == null){
            res.redirect('/')
        }
        else{
            res.render('author/edit', {
                author: author,
                errorMessage: "Error Updating author"
            });
        }
    }
})

router.delete('/:id', async (req, res) => {
    try {
        const author = await Authors.findById(req.params.id);
        
        if (!author) {
            return res.redirect('/');
        }

        const books = await Books.find({ author: req.params.id });

        if (books.length > 0) {
            return res.redirect(`/authors/${author.id}`);
        }

        await author.deleteOne();
        return res.redirect('/authors');

    } catch (err) {
        console.error(err);
        return res.status(500).send('Internal Server Error');
    }
});


module.exports = router