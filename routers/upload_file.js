const express=require('express');
const { Readable } = require("stream");
const csv = require("csv-parser");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const axios = require("axios");
const sharp = require("sharp");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const router=express.Router();
const upload = multer({ dest: "uploads/" });
const uploadCSVSchema=require('../schema/output_csv');
const statusSchema=require('../schema/status_schema');
router.post('/upload',upload.single('file'),async(req,res)=>{
    const filePath = req.file.path;
    const results = [];
    const requestId = uuidv4();
  let status="processing";
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", async (data) => {
        const { "S. No.": sNo, "Product Name": productName, "Input Image Urls": inputImageUrls } = data;
  
        if (!sNo || !productName || !inputImageUrls) {
          return res.status(400).json({ error: "Invalid CSV format" });
        }
  
        const urls = inputImageUrls.split(",").map((url) => url.trim());
      const ouptutUrl=[];
        for (const url of urls) {
          try {
            
            const imageData = await axios.get(url, { responseType: "arraybuffer" });
            const imageBuffer = Buffer.from(imageData.data, "binary");
            const compressedImageBuffer = await sharp(imageBuffer)
              .resize({ width: Math.round((await sharp(imageBuffer).metadata()).width * 0.5) })
              .toBuffer();
            const readableStream = new Readable({
              read() {
                this.push(compressedImageBuffer);
                this.push(null); 
              },
            });
            const cloudinaryUpload = await new Promise((resolve, reject) => {
              const uploadStream = cloudinary.uploader.upload_stream(
                { resource_type: "image" },
                (error, result) => {
                  if (error) return reject(error);
                  resolve(result.secure_url);
                }
              );
              readableStream.pipe(uploadStream);
            });
  
            console.log("Uploaded to Cloudinary: ", cloudinaryUpload);
             ouptutUrl.push(cloudinaryUpload);
          } catch (err) {
            console.error("Error processing image URL:", url, err.message);
          }
        }
  const product=new uploadCSVSchema({
    input_image_urls:inputImageUrls,
    output_image_urls:ouptutUrl.join(',').toString(),
    product_name:productName,
    serial_number:sNo
  });
  try{
   await product.save();
  }catch(err){
    console.log(err);
  }
        results.push({ sNo, productName, urls });
      })
      .on("end",async () => {
        fs.unlinkSync(filePath);
        console.log("CSV processing completed");
        await statusSchema.findOneAndUpdate({requestId:requestId},{status:"completed"},{new:true});
      })
      .on("error", (err) => {
        console.error("Error reading CSV file", err);
        fs.unlinkSync(filePath);
        return res.status(500).json({ error: "Failed to process CSV file" });
      });
    const statusData=new statusSchema({
        requestId:requestId,
        status:status
    })
    await statusData.save();
    res.json({ requestId, status: status });
});

router.get('/status/:id',async(req,res)=>{
try{
    const {id}=req.params;
const data=await statusSchema.findOne({requestId:id});
res.send(data);
}catch(err){
    console.log(err);
}
});
module.exports=router;
