const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose'); //include mongoose
const bodyParser = require('body-parser'); 

const productRoutes = require('./api/routes/products'); 
const orderRoutes = require('./api/routes/orders'); 
const userRoutes = require('./api/routes/user'); //import the user routes

mongoose.connect('mongodb+srv://node-shop:' + process.env.MONGO_ATLAS_PW + '@node-rest-shop.fv4it.mongodb.net/?retryWrites=true&w=majority');
mongoose.Promise = global.Promise;

const app = express(); 
app.use(morgan('dev')); 
app.use('/uploads', express.static('uploads')); //add the uploads folder to your express app to be used as a static folder (publicly available) and allow us to send request to /uploads endpoint
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json()); 

app.use((req, res, next) => { 
    res.header("Access-Control-Allow-Origin", '*') 
    res.header("Access-Control-Allow-Headers", 'Origin, X-Requested-With, Content-Type, Accept, Authorization') 
    if(req.method === "OPTIONS") { 
        res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
        return res.status(200).json({})
    }
    next(); 
});

//Routes which should handle requests
app.use('/products', productRoutes);
app.use('/orders', orderRoutes);
app.use('/user', userRoutes); //add the route to the express app

app.use((req, res, next) => {
    const error = new Error('Not found');
    error.status = 404;
    next(error);
});

app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message
        }
    });
});

module.exports = app; 