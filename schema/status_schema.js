const mongoose=require('mongoose');
const MongooseSchema=mongoose.Schema;
const schema=new MongooseSchema(
    {
        status:{
            type:String
        },
        requestId:{
            type:String
        }
    }
);
module.exports = mongoose.model('upload_status',schema);