const Order = require("../models/order");
const Product = require("../models/product");
const mongoose = require('mongoose'); //import mongoose


exports.orders_get_all = (req, res, next) => {
    Order.find().select("product quantity _id").populate('product', 'name').exec().then((result) => {
        res.status(200).json({
            count: result.length,
            orders: result.map((order) => {
                return {
                    _id: order._id,
                    product: order.product,
                    quantity: order.quantity,
                    request: {
                        type: "GET",
                        url: "http://localhost:3000/orders/" + order._id
                    }
                }
            })
        });
    }).catch((error) => {
        res.status(500).json({
            error: error
        });
    });
}

exports.orders_create_order = async (req, res, next) => {
    try {
        const product = await Product.findById(req.body.productId); //checking whether we do have a product

        if (!product) { //if true --> all subsequent code after the if block won't be executed since it's returned
            return res.status(404).json({ message: "Product not found!" }); //preventing it from sending a success response since in we only checked the success case till now but in case of failure it returned null instead of an error, this if block takes care of that
        }

        const order = new Order({
            _id: new mongoose.Types.ObjectId(),
            quantity: req.body.quantity,
            product: req.body.productId
        });

        const result = await order.save();

        res.status(201).json({
            message: "Order stored successfully!",
            createdOrder: {
                _id: result._id,
                product: result.product,
                quantity: result.quantity
            },
            request: {
                type: "GET",
                url: "http://localhost:3000/orders/" + result._id
            }
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
}

exports.orders_get_order = (req, res, next) => {
    Order.findById(req.params.orderId).select("product quantity _id").populate('product', "name price").exec().then((result) => {
        if(!result) {
            res.status(404).json({
                message: "Order not found!"
            });
        }
        res.status(200).json({
            order: result,
            request: {
                type: "GET",
                url: "http://localhost:3000/orders"
            }
        });
    }).catch((error) => {
        res.status(500).json({
            error: error
        });
    });
}

exports.orders_delete_order = (req, res, next) => {
    Order.deleteOne({ _id: req.params.orderId }).exec().then((result) => {
        res.status(200).json({
            message: "Order deleted successfully",
            request: {
                type: "POST",
                url: "http://localhost:3000/orders",
                body: {
                    productId: 'ID',
                    quantity: 'Number'
                }
            }
        });
    }).catch((error) => {
        res.status(500).json({
            error: error
        });
    });
}