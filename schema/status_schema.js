const mongoose=require('mongoose');
const MongooseSchema=mongoose.Schema;
const schema=new MongooseSchema(
    {
        status:{
            type:String
        },
        requestId:{
            type:String
        },
        createdAt:{
            type:Date,
            default:Date.now
        }
    }
);
module.exports = mongoose.model('upload_status',schema);