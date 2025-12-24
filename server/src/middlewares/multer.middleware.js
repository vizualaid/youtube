import multer from 'multer';
import path from 'path';
import fs from 'fs';

const uploadDir = path.join('public', 'my-uploads');

// Ensure the directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
const storage = multer.diskStorage({
  destination: function (req, file, cb) { 
    //req means request object jo express ke through aata hai from client 
   // file means jo file upload ho rahi hai 
    //cb callback means jab yeh kaam ho jaye toh yeh function call kar dena
    cb(null, uploadDir) //directory jaha file store hogi

  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix)
  }
})

export const upload = multer({ storage: storage })