const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    orderItems: [
        {
            name: {type: String, required: true},
            image: {type: String},
            price: { type: Number, required: true },
            qty: { type: Number, required: true },
            product:{
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
                requred: true,
            },
        },
    ],
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    shipping: {
        address: String,
        city: String,
        postalCode: String,
        country: String,
    },
    payment: {
        paymentMenthod: String,
        paymentResult: {
            orderID: String,
            payerID: String,
            paymentID: String,
        },
    },
    itemsPrice: Number,
    taxPrice: Number,
    shippingPrice: Number,
    totalPrice: Number,
    isPaid: { type: Boolean},
    paidAt: Date,
    isDelivered: { type: Boolean},
    deliveredAt: Date,

}, {timestamps: true});

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
