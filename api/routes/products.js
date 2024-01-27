const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const multer = require("multer");

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

const Product = require("../models/product");

router.get("/", (req, res, next) => {
  Product.find()
    .select("name price _id productImage") //allows me to select the fields I want in the response(lets me eliminate the unnecessary fields like _v)
    .exec()
    .then((result) => {
      const response = {
        count: result.length,
        products: result.map((product) => {
            return {
                name: product.name,
                price: product.price,
                _id: product._id,
                productImage: product.productImage,
                request: {
                    type: "GET",
                    url: "http://localhost:3000/products/" + product._id
                }
            }
        })
      }
      res.status(200).json(response);
    })
    .catch((error) => {
      console.log(error);
      res.status(500).json({
        error: error,
      });
    });
});

//add the checkAuth middleware as a parameter to the POST route after upload.single() so that it gets parsed as form-data and not JSON using the upload middleware - this is because our app uses a JSON body parser and our POST request to create a new product has a type of form-data, which is only being taken care of by the uploads middleware
//I won't execute it like (), I'll just pass it normally and Express will automatically pass the request into it 
router.post("/", checkAuth, upload.single('productImage'), (req, res, next) => { 
  console.log(req.file);
  const product = new Product({
    _id: new mongoose.Types.ObjectId(), 
    name: req.body.name,
    price: req.body.price,
    productImage: req.file.path
  });

  product
    .save()
    .then((result) => {
      //saves the new product in the DB
      console.log(result);
      res.status(201).json({
        message: "Created product successfully!",
        createdProduct: {
            name: result.name,
            price: result.price,
            _id: result._id,
            request: {
                type: "GET",
                url: "http://localhost:3000/products/" + result._id 
            }
        },
      });
    })
    .catch((error) => {
      console.log(error);
      res.status(500).json({
        error: error,
      });
    });
});

router.get("/:productId", (req, res, next) => {
  const id = req.params.productId;
  Product.findById(id)
    .select("name price _id productImage")
    .exec()
    .then((result) => {
      //the then-catch block is an asynchronous method to execute promises in JavaScript, which means that the code that comes after the then-catch block doesn't wait for the promise to fulfil before getting executed
      console.log(result);
      if (result) {
        res.status(200).json({
            product: result,
            request: {
                type: "GET",
                description: "Get all products",
                url: "http://localhost:3000/products" //url to get all products
            }
        });
      } else {
        res.status(404).json({
          message: "No valid entry found for the provided ID!",
        });
      }
    })
    .catch((error) => {
      console.log(error);
      res.status(500).json({
        error: error,
      });
    });
});

router.patch('/:productId', checkAuth, (req, res, next) => { 
    const id = req.params.productId;
    const updateOps = {}; //this is a dynamic approach that allows us to update all kinds of data
    for(const ops of req.body) {
        updateOps[ops.propName] = ops.value; 
    }
    Product.updateOne({
        _id: id
    }, {
        $set: updateOps
    }).exec().then((result) => {
        res.status(200).json({
            message: "Product updated successfully!",
            request: {
                type: "GET",
                url: "http://localhost:3000/products/" + id
            }
        });
    }).catch((error) => {
        console.log(error);
        res.status(500).json({
            error: error
        });
    }); 
});

router.delete("/:productId", checkAuth, (req, res, next) => {
  const id = req.params.productId;
  Product.deleteOne({
    _id: id, //this essentially acts as a filter and removes any product object whose ID matches with the ID in the request parameters
  })
    .exec()
    .then((result) => {
      res.status(200).json({
        message: "Product deleted successfully!",
        request: {
            type: "POST", //recommends a POST request to create another product with the required JSON Body format
            url: "http://localhost:3000/products",
            body: {
                name: "String",
                price: "Number"
            }
        }
      });
    })
    .catch((error) => {
      console.log(error);
      res.status(500).json({
        error: error,
      });
    });
});

module.exports = router;
