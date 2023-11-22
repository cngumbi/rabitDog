const mongoose = require('mongoose');
//reviews model
const reviewSchema = new mongoose.Schema({
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    name: {type: String, required: true},
    rating: {
        type: Number,
        required: true,
        default: 0,
        min: 0,
        max: 5,
    },
    comment: { type: String, required: true}
}, { timestamps: true});

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true  },
    category: { type: String, required: true },
    brand: { type: String, required: true },
    image: { type: String},
    price: { type: Number,default: 0.0, required: true },
    rating: { type: Number, default: 0.0 },
    countInStock: {type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
    reviews: [reviewSchema],
}, {timestamps: true});

const Product = mongoose.model('Product', productSchema);
module.exports = Product;