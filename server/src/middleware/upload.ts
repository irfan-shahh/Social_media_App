const multer=require('multer')
const path=require('path')
import type express =require('express') 
import type multerTypes =require('multer')


const storage:multerTypes.StorageEngine=multer.diskStorage({
    destination:(
        req:express.Request,
        file:Express.Multer.File,
        cb:(error:Error |null,destination:string)=>void
    )=>{
        cb(null,'uploads/')
    },
  filename:(
    req:express.Request,
    file:Express.Multer.File,
    cb:(error:Error|null,filename:string)=>void
  )=>{
    const uniqueSuffix=Date.now()+'-'+Math.round(Math.random()*1e9)
    cb(null,uniqueSuffix+path.extname(file.originalname))
  }
    

})

const upload:multerTypes.Multer=multer({
   storage,
   limits:{fileSize:5*1024*1024},

   fileFilter:(
    req:express.Request,
    file:Express.Multer.File,
    cb:multerTypes.FileFilterCallback
   )=>{
    if(file.mimetype==='image/jpeg'|| file.mimetype==='image/jpg' || file.mimetype==='image/png'){
        cb(null,true)
    }else{
        cb(new Error('only jpg/jpeg/png images are allowed'))
    }
   }

})
module.exports=upload; 