const express=require('express');
const multer = require('multer');
const router=express.Router();
const upload = multer({
    storage:multer.memoryStorage()
});
const CsvFile=require('../schema/upload_csv');
router.post('/webhook',upload.single('file'),async(req,res)=>{
    try {
        const fileId = req.body.requestId; 
        const fileName = req.file.originalname; 
        const fileData = req.file.buffer; 
    
        const newCsvFile = new CsvFile({
          fileId: fileId,
          fileName: fileName,
          fileData: fileData,
        });
    
        // Save the document to MongoDB
        await newCsvFile.save();
    
        res.status(200).json({ message: 'File uploaded and saved successfully.' });
      } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to upload and save the file.' });
      }
});

module.exports=router;