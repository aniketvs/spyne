const mongoose=require('mongoose');
const MongooseSchema=mongoose.Schema;
const schema=new MongooseSchema({
    serial_number:{
        type:Number
    },
    product_name:{
        type:String
    },
    input_image_urls:{
        type:String
    },
    output_image_urls:{
        type:String
    }
});
module.exports=mongoose.model('outputcsv',schema);