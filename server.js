if (process.env.NODE_ENV !== 'production'){

    require('dotenv').config()
}

const express = require('express')
const app = express()
const expressLayouts = require('express-ejs-layouts')
const indexRouter = require('./routes/index')
const authorRouter = require('./routes/author')
const bookRouter = require('./routes/books')
const path = require('path');
const methodOverride = require('method-override')



app.set('view engine','ejs')
app.set('views',__dirname+'/views')

app.set('layout','layouts/layout') // inside the "layouts" folder and in inside the "layout" file->(used for gets the repetaive HTML header and footer)

app.use(expressLayouts)

app.use(express.static(path.join(__dirname, 'public'))); //this is for specifying where our static files(HTML,CSS,JS) are go, in here it will go on to "public" folder  

app.use(express.urlencoded({limit : '10mb',extended:false}));

app.use(methodOverride('_method'))

app.use('/',indexRouter)
app.use('/authors',authorRouter)
app.use('/books',bookRouter)





// Databse Connection

const mongoose = require('mongoose')

mongoose.connect(process.env.DATABASE_URL)

//connection

const db = mongoose.connection

db.on('error',error => {console.error(error)})
db.once('open',()=>{
    console.log("Connection to MongoDB Success")
})




app.listen(process.env.PORT || 3000)
 