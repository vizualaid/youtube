import multer from 'multer';

const storage = multer.diskStorage({
  destination: function (req, file, cb) { 
    //req means request object jo express ke through aata hai from client 
   // file means jo file upload ho rahi hai 
    //cb callback means jab yeh kaam ho jaye toh yeh function call kar dena
    cb(null, './public/my-uploads') 

  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix)
  }
})

export const upload = multer({ storage: storage })