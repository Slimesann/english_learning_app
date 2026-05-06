import multer from "multer";
import fs from "fs";
import path from "path";

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dest = path.join(process.cwd(), "uploads", file.fieldname);
        fs.mkdirSync(dest, { recursive: true });
        cb(null, dest);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const name = `${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`;
        cb(null, name);
    },
});

export const uploadSingle = (fieldName) => multer({ storage }).single(fieldName);
export const uploadFields = (arr) => multer({ storage }).fields(arr);
export default multer({ storage });
