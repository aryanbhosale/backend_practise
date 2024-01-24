const mongoose = require('mongoose'); 

const orderSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId, //to maintain simplicity, an order is connected to a product that's ordered
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true }, //type will also be an id because I'm storing the product id of the product that I'm ordering --> This means that I'm actually creating a relation, when in fact mongodb is a non-relational database, but we can kind of rebuild these relations as we're about to do which is OK to some degree. 
    // ref is an important keyword and is used to configure the type. ref should contain a String with the name of the model I want to connect this model to.
    quantity: { type: Number, default: 1 } //here, the required: true keyword isn't necessary, we can also keep default: 1, implying that if I'm not passing any quantity to it, it would be 1 by default
});

module.exports = mongoose.model('Order', orderSchema); 