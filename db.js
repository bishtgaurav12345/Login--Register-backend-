const mongoose = require('mongoose')

const {MONGO_URI} = process.env
mongoose.connect(MONGO_URI).then(()=>{
    console.log("db connected")
}).catch((err)=>{
    console.log(err,"error connecting db")
})