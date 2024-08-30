const mongoose=require('mongoose')
const db="mongodb://127.0.0.1:27017/spyne";
mongoose.connect(db).then(()=>{
console.log("db is connected");
}).catch((err)=>{
    console.log("db is not connected err:",err);
})