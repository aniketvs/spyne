const express = require("express");
require("dotenv").config();

const cloudinary = require("cloudinary").v2;
require('./config/config');
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_secret: process.env.API_SECRET,
  api_key: process.env.API_KEY,
});

const app = express();

app.use(express.json());

const uploadFile=require('./routers/upload_file');
app.use(uploadFile);
const webhook=require('./routers/webhook');
app.use(webhook);

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log("App is listening on port:", port);
});
