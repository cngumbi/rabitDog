// migration script: populate reorderPoint for existing products
//how to run: node backend/scripts/migrateAddReorderPoint.js
const mongooseConnector = require('../config/mongoosDB');
const Product = require('../models/productModel');

async function run(){
  try{
    const products = await Product.find({});
    console.log(`Found ${products.length} products`);
    let updated = 0;
    for(const p of products){
      if(typeof p.reorderPoint === 'undefined' || p.reorderPoint === null || p.reorderPoint === 0){
        const suggested = Math.max(5, Math.ceil((p.countInStock || 0) * 0.1));
        p.reorderPoint = suggested;
        await p.save();
        updated++;
      }
    }
    console.log(`Updated ${updated} products with reorderPoint`);
    process.exit(0);
  }catch(err){
    console.error(err);
    process.exit(1);
  }
}

run();
