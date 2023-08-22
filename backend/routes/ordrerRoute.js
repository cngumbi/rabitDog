const express = require('express');
const expressAsync = require('express-async-handler');
const { generateToken, isAuth, isAdmin } = require('../util');
const Order = require('../models/orderModel');
const User = require('../models/userModel');
const Product = require('../models/productModel');

const orderRoute = express.Router();

orderRoute.get('/summary', isAuth, isAdmin, expressAsync(async(req, res) =>{
    const orders = await Order.aggregate([
        {
            $group: {
                _id: null,
                numOrders: { $sum: 1},
                totalSales: { $sum: '$totalPrice' },
            },
        },
    ]);
    const users = await User.aggregate([
        {
            $group: {
                _id: null,
                numUsers: { $sum: 1 },
            }
        },
    ]);
    const dailyOrders = await Order.aggregate([
        {
            $group: {
                _id: { $dateToString: {format: '%Y-%m-%d', date: '$createdAt'}},
                orders: { $sum: 1 },
                sales: { $sum: '$totalPrice' },
            },
        },
    ]);
    const productCategories = await Product.aggregate([
        {
            $group: {
                _id: '$category',
                count: { $sum: 1 },
            },
        },
    ]);
    res.send({
        users,
        orders: orders.length === 0 ? [{ numOrders: 0, totalSales: 0 }] : orders,
        dailyOrders,
        productCategories,
    });
}));
orderRoute.get('/', isAuth, isAdmin, expressAsync(async(req, res) => {
    const orders = await Order.find({}).populate('user');
    res.send(orders);
}));
orderRoute.get('/mine', isAuth, expressAsync(async(req, res) => {
    const orders = await Order.find({ user: req.user_id });
    res.send(orders);
}));
orderRoute.get('/:id', isAuth, expressAsync(async(req, res) => {
    const order = await Order.findById(req.params.id);
    if(order){
        res.send(order);
    }else{
        res.status(404).send({ message: 'Order Not Found' });
    }
    
}));
orderRoute.post('/', isAuth, expressAsync(async(req, res) => {
    const order = new Order({
        orderItems: req.body.orderItems,
        user: req.user._id,
        shipping: req.body.shipping,
        payment: req.body.payment,
        itemsPrice: req.body.itemsPrice,
        taxPrice: req.body.taxPrice,
        shippingPrice: req.body.shippingPrice,
        totalPrice: req.body.totalPrice,
    });
    const createOrder = await order.save();
    if (!createdUser) {
        res.status(201).send({
            message: 'New Order Created', order: createOrder
        });
    }
}));
orderRoute.delete('/:id', isAuth, isAdmin, expressAsync(async(req, res)=>{
    const order = await Order.findById(req.params.id);
    if(order){
        const deleteOrder = await order.remove();
        res.send({ message: 'Order Deleted', product: deleteOrder});
    }else{
        res.status(404).send({ message:' Order Not Found' });
    }
}));
orderRoute.put('/:id/pay', isAuth, expressAsync(async(req, res) => {
    const order = await Order.findById(req.params.id);
    if (order){
        order.isPaid = true;
        order.paidAt = Date.now();
        order.payment.paymentResult = {
            payerID: req.body.payerID,
            paymentID: req.body.paymentID,
            orderID: req.body.orderID,
        };
        const updateOrder = await order.save();
        res.send({ message: 'Order Paid', order: updateOrder });
    }else{
        res.status(404).send({ message:' Order Not Found' });
    }
}));
orderRoute.put('/:id/deliver', isAuth, expressAsync(async(req, res)=>{
    const order = await Order.findById(req.params.id);
    if(order){
        order.isDelivered = true;
        order.deliveredAt = Date.now();
        const updateOrder = await order.save();
        res.send({message: 'Order dDeliverd', order: updateOrder});
    }else{
        res.status(404).send({ message:' Order Not Found' });
    }
}));

module.exports = orderRoute;