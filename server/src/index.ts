
const express=require('express')
const cors=require('cors')
require('dotenv').config()
const cookieParser = require('cookie-parser')
const appRouter=require('./routes/route')
const app=express()

app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(cookieParser())
app.use(cors({
    origin:'http://localhost:3000',
    credentials:true
}))
app.use('/',appRouter)

const port = process.env.PORT ||8000;

const start= async():Promise<void>=>{
    try{
    app.listen(port,()=>{
     console.log(`server is running on port ${port}`)
    })
    
    }
     catch (error) {
    console.error('Error connecting to the database:', error);
     }
}

start()