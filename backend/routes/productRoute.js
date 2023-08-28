const express = require('express');
const expressAsync = require('express-async-handler');
const { isAuth, isAdmin } = require('../util');
const Product = require('../models/productModel');

const ProductRoute = express.Router();
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
ProductRoute.post('/createdproducts', isAuth, isAdmin, expressAsync(async(req, res)=>{
    const product = new Product({
        name:  req.body.name,
        price:  req.body.price,
        image:  req.body.image,
        brand:  req.body.brand,
        category:  req.body.category,
        countInStock:  req.body.countInStock,
        description:  req.body.description,
    });
    const createProduct = await product.save();
    if(createProduct){
        res.status(201).send({ message: 'Product created', product: createProduct });

    }else{
        res.status(500).send({ message: 'Error in creating Product'});
    }
}));
ProductRoute.put('/:id', isAuth, isAdmin, expressAsync(async(req, res)=>{
    const productId = req.params.id;
    const product = await Product.findById(productId);
    if(product){
        product.name =  req.body.name;
        product.price =  req.body.price;
        product.image =  req.body.image;
        product.brand =  req.body.brand;
        product.category =  req.body.category;
        product.countInStock =  req.body.countInStock;
        product.description =  req.body.description;
        const updateProduct = await product.save();
        if(updateProduct){
            res.send({ message: 'Product Updated', product: updateProduct});
        }else{
            res.status(500).send({ message: 'Error in updating Product'});
        }
    }else{
        res.status(404).send({ message: 'Product Not Found' });
    }
}));
ProductRoute.delete('/:id', isAuth, isAdmin, expressAsync(async(req, res)=>{
    const product = await Product.findById(req.params.id);
    if(product){
        const deleteProduct = await product.remove();
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
