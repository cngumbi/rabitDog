const express = require('express');
const expressAsync = require('express-async-handler');
const { isAuth, isAdmin } = require('../util');
const logActivity = require('../util/activityLogger');
const Order = require('../models/orderModel');
const User = require('../models/userModel');
const Product = require('../models/productModel');

const OrderRoute = express.Router();

const validateOrderOwnership = (order, user) => {
    if (!order || !user) return false;
    const ownerId = order.user && order.user._id ? order.user._id.toString() : order.user?.toString();
    return ownerId === user._id || user.isAdmin;
};

OrderRoute.get('/summary', isAuth, isAdmin, expressAsync(async(req, res) =>{
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
OrderRoute.get('/', isAuth, isAdmin, expressAsync(async(req, res) => {
    const orders = await Order.find({}).populate('user');
    res.send(orders);
}));
OrderRoute.get('/mine', isAuth, expressAsync(async(req, res) => {
    const orders = await Order.find({ user: req.user._id });
    res.send(orders);
}));
OrderRoute.get('/:id', isAuth, expressAsync(async(req, res) => {
    const order = await Order.findById(req.params.id).populate('user', '_id email');
    if(order){
        if (!validateOrderOwnership(order, req.user)) {
            return res.status(403).send({ message: 'Access denied: order access restricted' });
        }
        res.send(order);
    }else{
        res.status(404).send({ message: 'Order Not Found' });
    }
    
}));
OrderRoute.post('/', isAuth, expressAsync(async(req, res) => {
    const order = new Order({
        orderItems: req.body.orderItems,
        user: req.user._id,
        shipping: req.body.shipping,
        payment: {
            paymentMethod: req.body.payment?.paymentMethod,
            paymentResult: req.body.payment?.paymentResult || {},
        },
        itemsPrice: req.body.itemsPrice,
        taxPrice: req.body.taxPrice,
        shippingPrice: req.body.shippingPrice,
        totalPrice: req.body.totalPrice,
    });
    const createOrder = await order.save();
    if (createOrder) {
        await logActivity(req.user._id, 'ORDER_CREATED', `Created order ${createOrder._id}`);
        res.status(201).send({
            message: 'New Order Created', order: createOrder
        });
    } else {
        res.status(500).send({ message: 'Order Not Created' });
    }
}));
OrderRoute.delete('/:id', isAuth, isAdmin, expressAsync(async(req, res)=>{
    const order = await Order.findById(req.params.id);
    if(order){
        const deleteOrder = await order.remove();
        await logActivity(req.user._id, 'ORDER_DELETED', `Deleted order ${order._id}`);
        res.send({ message: 'Order Deleted', order: deleteOrder});
    }else{
        res.status(404).send({ message:' Order Not Found' });
    }
}));
OrderRoute.put('/:id/pay', isAuth, expressAsync(async(req, res) => {
    const order = await Order.findById(req.params.id).populate('user', '_id');
    if (order){
        if (!validateOrderOwnership(order, req.user)) {
            return res.status(403).send({ message: 'Access denied: cannot pay for this order' });
        }
        order.isPaid = true;
        order.paidAt = Date.now();
        order.payment.paymentResult = {
            payerID: req.body.payerID,
            paymentID: req.body.paymentID,
            orderID: req.body.orderID,
        };
        const updateOrder = await order.save();
        await logActivity(req.user._id, 'ORDER_PAID', `Paid order ${order._id}`);
        res.send({ message: 'Order Paid', order: updateOrder });
    }else{
        res.status(404).send({ message:' Order Not Found' });
    }
}));
OrderRoute.put('/:id/deliver', isAuth, isAdmin, expressAsync(async(req, res)=>{
    const order = await Order.findById(req.params.id);
    if(order){
        order.isDelivered = true;
        order.deliveredAt = Date.now();
        const updateOrder = await order.save();
        await logActivity(req.user._id, 'ORDER_DELIVERED', `Delivered order ${order._id}`);
        res.send({message: 'Order Delivered', order: updateOrder});
    }else{
        res.status(404).send({ message:' Order Not Found' });
    }
}));

module.exports = OrderRoute;
