const mongoose = require('mongoose'); 

const productSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId, 
    name: { type: String, required: true}, 
    price: { type: Number, required: true}, 
    productImage: { type: String, required: true } //update the schema to incorporate productImage
});

module.exports = mongoose.model('Product', productSchema); 