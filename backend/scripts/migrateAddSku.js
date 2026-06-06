// migration script: populate sku for existing products
//how to run: node backend/scripts/migrateAddSku.js   
const mongoose = require('mongoose');
const config = require('../config/config');
const Product = require('../models/productModel');

mongoose.set('strictQuery', true);

async function run(){
  try{
    await mongoose.connect(config.MONGODB_URL);
    const products = await Product.find({});
    console.log(`Found ${products.length} products`);
    let updated = 0;
    for(const p of products){
      if(!p.sku){
        const idStr = p._id.toString();
        p.sku = `PD-${idStr.slice(-8).toUpperCase()}`;
        await p.save();
        updated++;
      }
    }
    console.log(`Updated ${updated} products with sku`);
    process.exit(0);
  }catch(err){
    console.error(err);
    process.exit(1);
  }
}

run();
