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
    image: { data:Buffer, type: String},
    sku: { type: String, unique: true, index: true, sparse: true },
    price: { type: Number,default: 0.0, required: true },
    rating: { type: Number, default: 0.0 },
    countInStock: {type: Number, default: 0 },
    reorderPoint: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
    reviews: [reviewSchema],
}, {timestamps: true});

// generate SKU from ObjectId if not present: PD-<last8 of id>
productSchema.pre('save', function(next){
    try{
        if(!this.sku && this._id){
            const idStr = this._id.toString();
            this.sku = `PD-${idStr.slice(-8).toUpperCase()}`;
        }
    }catch(e){/* ignore */}
    next();
});

const Product = mongoose.model('Product', productSchema);
module.exports = Product;