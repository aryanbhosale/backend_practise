const Product = require("../models/product"); //import the Product model at the top
const mongoose = require("mongoose"); //import mongoose

exports.products_get_all = (req, res, next) => {
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
  }

exports.products_create_product = (req, res, next) => { 
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
  }

exports.products_get_product = (req, res, next) => {
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
  }

  exports.products_update_product = (req, res, next) => { 
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
}

exports.products_delete_product = (req, res, next) => {
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
  }