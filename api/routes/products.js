const express = require("express");
const router = express.Router();
const multer = require("multer");

const ProductsController = require("../controllers/products"); //import the Products controller

const checkAuth = require("../middleware/check-auth"); //import the check-auth middleware for route protection

const storage = multer.diskStorage({ //pass 2 JS Objects to configure - multer will execute these 2 functions everytime a new file is received
  destination: function(req, res, cb) { //a function that defines where the incoming file is stored and we get access to the full request in this function to the file into a callback, so all of that is passed into that function automatically by multer
    cb(null, './uploads/'); //in the callback we pass any potential error, in our case it's null, followed by the destination(I'll go with uploads since I used it before)
  },
  filename: function(req, file, cb){ //we also have a filename function which defines how the file should be named
    cb(null, Date.now() + "_" + file.originalname); //naming the file with respect to the current time and the name of the file both concatenated
  },
});

const fileFilter = (req, file, cb) => { // in here we can accept or reject an incoming file
  //accept a file
  if(file.mimetype === "image/jpeg" || file.mimetype === "image/png" || file.mimetype === "image/jpg") {
    cb(null, true); //true implies the file is saved
  } else {
    //reject a file
      cb(null, false); //null implies no error is thrown, false implies the file isn't saved
  }
}

const upload = multer({ 
  storage: storage, 
  limits: {
  fileSize: 1024 * 1024 * 5 //accepts size in bytes, limit currently set to 5 Mega Bytes
  },
  fileFilter: fileFilter //add another multer config to filter out certain MIME types
}); 

router.get("/", ProductsController.products_get_all);
router.post("/", checkAuth, upload.single('productImage'), ProductsController.products_create_product);
router.get("/:productId", ProductsController.products_get_product);
router.patch('/:productId', checkAuth, ProductsController.products_update_product);
router.delete("/:productId", checkAuth, ProductsController.products_delete_product);

module.exports = router;
