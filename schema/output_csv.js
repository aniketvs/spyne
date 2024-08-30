const mongoose=require('mongoose');
const MongooseSchema=mongoose.Schema;
const schema=new MongooseSchema({
    serial_number:{
        type:Number,
        required: true,
    },
    product_name:{
        type:String,
        required: true,
    },
    input_image_urls:{
        type:String,
        required: true,
    },
    output_image_urls:{
        type:String,
        required: true,
    },
    request_id:{
        type:String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
      },
});
module.exports=mongoose.model('outputcsv',schema);