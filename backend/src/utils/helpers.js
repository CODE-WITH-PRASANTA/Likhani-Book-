const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");

/**
 * Escapes special regex characters in user input to prevent ReDoS / RegExp syntax crashes
 */
const escapeRegex = (text) => {
  if (!text || typeof text !== "string") return "";
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

/**
 * Validates whether a given string is a valid MongoDB 24-character hexadecimal ObjectId
 */
const isValidObjectId = (id) => {
  return mongoose.isValidObjectId(id);
};

/**
 * Basic email regex validator
 */
const isValidEmail = (email) => {
  if (!email || typeof email !== "string") return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
};

/**
 * Safely removes a file inside the uploads directory with strict path containment
 */
const safeDeleteUploadFile = (relativePath) => {
  if (!relativePath || typeof relativePath !== "string") return;
  if (relativePath.startsWith("http://") || relativePath.startsWith("https://")) return;

  const uploadDir = path.resolve(__dirname, "../../uploads");
  const normalized = relativePath.replace(/^[/\\]+/, "").replace(/^uploads[/\\]+/, "");
  const absolutePath = path.resolve(uploadDir, normalized);

  // Security boundary check: ensure resolved path is strictly inside uploadDir
  if (!absolutePath.startsWith(uploadDir)) {
    console.warn(`[Security Alert] Attempted path traversal: ${relativePath}`);
    return;
  }

  if (fs.existsSync(absolutePath)) {
    fs.unlink(absolutePath, (err) => {
      if (err) console.error(`Error deleting file ${absolutePath}:`, err.message);
    });
  }
};

const sharp = require("sharp");

/**
 * Saves a base64 data URL string to disk in the uploads folder, converted to WebP format.
 * Returns the relative path /uploads/<filename>.webp
 */
const saveBase64Image = async (dataString) => {
  if (!dataString || typeof dataString !== "string") return dataString;
  const matches = dataString.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
  if (!matches || matches.length !== 3) {
    return dataString; // Return unchanged if not a base64 data string
  }

  const base64Data = matches[2];
  const uploadDir = path.resolve(__dirname, "../../uploads");
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}.webp`;
  const filePath = path.resolve(uploadDir, filename);

  try {
    const buffer = Buffer.from(base64Data, "base64");
    await sharp(buffer).webp({ quality: 80 }).toFile(filePath);
    return `/uploads/${filename}`;
  } catch (err) {
    console.error("Failed to convert base64 image to webp:", err.message);
    try {
      const fallbackFile = `${Date.now()}-${Math.round(Math.random() * 1e9)}.jpg`;
      const fallbackPath = path.resolve(uploadDir, fallbackFile);
      fs.writeFileSync(fallbackPath, Buffer.from(base64Data, "base64"));
      return `/uploads/${fallbackFile}`;
    } catch (e) {
      return dataString;
    }
  }
};

/**
 * Converts a disk file to WebP format and deletes the original if different.
 * Returns /uploads/<filename>.webp
 */
const convertFileToWebp = async (fileOrRelativePath) => {
  if (!fileOrRelativePath) return "";

  const uploadDir = path.resolve(__dirname, "../../uploads");
  let inputPath = "";
  let originalFilename = "";

  if (typeof fileOrRelativePath === "object" && fileOrRelativePath.path) {
    inputPath = fileOrRelativePath.path;
    originalFilename = fileOrRelativePath.filename || path.basename(inputPath);
  } else if (typeof fileOrRelativePath === "string") {
    if (fileOrRelativePath.startsWith("http://") || fileOrRelativePath.startsWith("https://")) {
      return fileOrRelativePath;
    }
    const cleanRel = fileOrRelativePath.replace(/^[/\\]+/, "").replace(/^uploads[/\\]+/, "");
    inputPath = path.resolve(uploadDir, cleanRel);
    originalFilename = path.basename(inputPath);
  }

  if (!fs.existsSync(inputPath)) {
    return typeof fileOrRelativePath === "string" ? fileOrRelativePath : "";
  }

  if (path.extname(inputPath).toLowerCase() === ".webp") {
    return `/uploads/${path.basename(inputPath)}`;
  }

  const webpFilename = `${Date.now()}-${Math.round(Math.random() * 1e9)}.webp`;
  const webpPath = path.resolve(uploadDir, webpFilename);

  try {
    await sharp(inputPath).webp({ quality: 80 }).toFile(webpPath);
    fs.unlink(inputPath, () => {});
    return `/uploads/${webpFilename}`;
  } catch (err) {
    console.error("Failed to convert file to webp:", err.message);
    return `/uploads/${originalFilename}`;
  }
};

module.exports = {
  escapeRegex,
  isValidObjectId,
  isValidEmail,
  safeDeleteUploadFile,
  saveBase64Image,
  convertFileToWebp,
};
