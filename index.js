const express = require("express");
const multer = require("multer");
const csv = require("csv-parser");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const axios = require("axios");
const sharp = require("sharp");
require("dotenv").config();
const app = express();
const upload = multer({ dest: "uploads/" });

app.use(express.json());

app.post("/upload", upload.single("file"), async (req, res) => {
  const filePath = req.file.path;
  const results = [];
  const requestId = uuidv4();

  await fs
    .createReadStream(filePath)
    .pipe(csv())
    .on("data", async (data) => {
      const {
        "S. No.": sNo,
        "Product Name": productName,
        "Input Image Urls": inputImageUrls,
      } = data;

      if (!sNo || !productName || !inputImageUrls) {
        return res.status(400).json({ error: "Invalid CSV format" });
      }
      const urls = inputImageUrls.split(",").map((url) => url.trim());
      urls.map(async (url) => {
        const imageData = await axios.get(url, {
          responseType: "arraybuffer",
        });
        const imageBuffer = Buffer.from(imageData.data, "binary");
        const metadata = await sharp(imageBuffer).metadata();

        if (!metadata.width) {
          throw new Error("Could not retrieve image width");
        }
        const outputFilePath = path.join(__dirname, "compressed_image.jpg");
        const compressedImage = await sharp(imageBuffer)
          .resize({ width: Math.round(metadata.width * 0.5) }) // Adjust size to 50%
          .toFile(outputFilePath);
        console.log("data", compressedImage);
      });

      console.log(`Row ${sNo}: ${urls.join(", ")}`);
      results.push({ sNo, productName, urls });
    })
    .on("end", () => {
      fs.unlinkSync(filePath);
    })
    .on("error", (err) => {
      console.error("Error reading CSV file", err);
      res.status(500).json({ error: "Failed to process CSV file" });

      fs.unlinkSync(filePath);
    });
  console.log("checking status");
  res.json({ requestId: requestId, status: true });
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log("app is listing on port :", port);
});
