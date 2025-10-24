import fs from "fs";
import path from "path";
import { config } from "../config/env";

let useCloudinary = false;
let cloudinary: any = null;

if (config.CLOUDINARY_API_KEY && config.CLOUDINARY_API_SECRET && config.CLOUDINARY_CLOUD_NAME) {
  useCloudinary = true;
  // npm i cloudinary
  cloudinary = require("cloudinary").v2;
  cloudinary.config({
    cloud_name: config.CLOUDINARY_CLOUD_NAME,
    api_key: config.CLOUDINARY_API_KEY,
    api_secret: config.CLOUDINARY_API_SECRET
  });
}

/**
 * Save buffer to cloudinary or local folder.
 * returns { url, filename }
 */
export async function saveFile(buffer: Buffer, originalName: string, mimetype: string) {
  const ext = path.extname(originalName) || "";
  const baseName = `${Date.now()}_${Math.random().toString(36).slice(2, 9)}${ext}`;

  if (useCloudinary) {
    return new Promise<{ url: string; filename: string }>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { resource_type: "auto", public_id: baseName.replace(ext, "") },
        (err: any, result: any) => {
          if (err) return reject(err);
          resolve({ url: result.secure_url, filename: result.original_filename || baseName });
        }
      );
      stream.end(buffer);
    });
  } else {
    // local fallback: store in /uploads
    const uploadsDir = path.resolve(process.cwd(), "uploads");
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);
    const filePath = path.join(uploadsDir, baseName);
    await fs.promises.writeFile(filePath, buffer);
    const url = `/uploads/${baseName}`; // serve statically if needed
    return { url, filename: baseName };
  }
}
