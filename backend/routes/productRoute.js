const express = require('express');
const expressAsync = require('express-async-handler');
const { isAuth, isAdmin } = require('../util');
const logActivity = require('../util/activityLogger');
const Product = require('../models/productModel');

const ProductRoute = express.Router();

const getMongoErrorMessage = (error) => {
    if (!error) return 'An unknown database error occurred.';
    if (error.name === 'MongoServerError' && error.code === 11000) {
        const key = error.keyValue && Object.keys(error.keyValue)[0];
        if (key === 'sku') {
            return `The SKU '${error.keyValue.sku}' is already in use. Please choose a different SKU.`;
        }
        return `Duplicate value detected for ${key || 'field'}. Please choose a different value.`;
    }
    return error.message || 'An unknown database error occurred.';
};

ProductRoute.get('/', expressAsync(async(req, res)=>{
    const searchKeyword = req.query.searchKeyword ? {
        name: {
            $regex: req.query.searchKeyword,
            $options: 'i',
        },
    } : {};
    const products = await Product.find({ ...searchKeyword });
    res.send(products);
}));
ProductRoute.get('/:id',expressAsync(async(req, res)=>{
    const product = await Product.findById(req.params.id);
    res.send(product);
}));
ProductRoute.post('/', isAuth, isAdmin, expressAsync(async (req, res)=>{
    try {
        const sku = req.body.sku && String(req.body.sku).trim();
        const product = new Product({
            name:  req.body.name,
            price:  req.body.price,
            image: req.body.image,
            brand:  req.body.brand,
            category:  req.body.category,
            countInStock:  req.body.countInStock,
            reorderPoint: req.body.reorderPoint,
            description:  req.body.description,
            ...(sku ? { sku } : {}),
        });
        const createProduct = await product.save();
        await logActivity(req.user._id, 'PRODUCT_CREATED', `Created product ${createProduct.name} (${createProduct._id})`);
        res.status(201).send({
            _id: createProduct._id,
            name: createProduct.name,
            sku: createProduct.sku,
            price: createProduct.price,
            image: createProduct.image,
            brand: createProduct.brand,
            category: createProduct.category,
            countInStock: createProduct.countInStock,
            reorderPoint: createProduct.reorderPoint,
            description: createProduct.description,
        });
    } catch (error) {
        res.status(400).send({ message: getMongoErrorMessage(error) });
    }
}));
ProductRoute.put('/:id', isAuth, isAdmin, expressAsync(async(req, res)=>{
    const productId = req.params.id;
    const product = await Product.findById(productId);
    if(product){
        if (typeof req.body.name !== 'undefined') product.name = req.body.name;
        if (typeof req.body.price !== 'undefined') product.price = req.body.price;
        if (typeof req.body.image !== 'undefined') product.image = req.body.image;
        if (typeof req.body.brand !== 'undefined') product.brand = req.body.brand;
        if (typeof req.body.category !== 'undefined') product.category = req.body.category;
        if (typeof req.body.countInStock !== 'undefined') product.countInStock = req.body.countInStock;
        if (typeof req.body.reorderPoint !== 'undefined') product.reorderPoint = req.body.reorderPoint;
        if (typeof req.body.description !== 'undefined') product.description = req.body.description;
        try {
            const updateProduct = await product.save();
            await logActivity(req.user._id, 'PRODUCT_UPDATED', `Updated product ${updateProduct.name} (${updateProduct._id})`);
            res.send({ message: 'Product Updated', product: updateProduct});
        } catch (error) {
            res.status(400).send({ message: getMongoErrorMessage(error) });
        }
    }else{
        res.status(404).send({ message: 'Product Not Found' });
    }
}));
ProductRoute.delete('/:id', isAuth, isAdmin, expressAsync(async(req, res)=>{
    const product = await Product.findById(req.params.id);
    if(product){
        const deleteProduct = await product.remove();
        await logActivity(req.user._id, 'PRODUCT_DELETED', `Deleted product ${product.name} (${product._id})`);
        res.send({ message: 'product Deleted', product: deleteProduct});
    }else{
        res.status(404).send({ message:' product Not Found' });
    }
}));
ProductRoute.post('/:id/reviews', isAuth, expressAsync(async(req, res)=>{
    const product = await Product.findById(req.params.id);
    if(product){
        const review = {
            rating: req.body.rating,
            comment: req.body.comment,
            user: req.user._id,
            name: req.user.name,
        };
        product.reviews.push(review);
        product.rating = product.reviews.reduce((a,c)=> c.rating + a, 0) / product.reviews.length;
        product.numReviews = product.reviews.length;
        const updateProduct = await product.save();
        res.status(201).send({
            message: 'Comment Created.',
            data: updateProduct.reviews[updateProduct.reviews.length - 1],
        });
    }else{
        throw Error('Product does Not exist');
    }
}))
module.exports = ProductRoute;
