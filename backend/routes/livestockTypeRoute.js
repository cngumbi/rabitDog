const express = require('express');
const expressAsync = require('express-async-handler');
const { isAuth, isAdmin } = require('../util');
const logActivity = require('../util/activityLogger');
const LivestockType = require('../models/livestockTypeModel');

const LivestockTypeRoute = express.Router();

// GET all livestock types
LivestockTypeRoute.get('/', expressAsync(async (req, res) => {
  const { category, isActive } = req.query;
  const filter = {};
  
  if (category) filter.category = category;
  if (isActive !== undefined) filter.isActive = isActive === 'true';
  
  const types = await LivestockType.find(filter).sort({ name: 1 });
  res.send(types);
}));

// GET single livestock type
LivestockTypeRoute.get('/:id', expressAsync(async (req, res) => {
  const type = await LivestockType.findById(req.params.id).populate('owner');
  if (!type) {
    return res.status(404).send({ message: 'Livestock type not found' });
  }
  res.send(type);
}));

// CREATE new livestock type
LivestockTypeRoute.post('/', isAuth, expressAsync(async (req, res) => {
  try {
    console.log('Creating livestock type with body:', req.body);
    console.log('User ID:', req.user?._id);

    if (!req.user) {
      return res.status(401).send({ message: 'User not authenticated' });
    }

    if (!req.body.name || !req.body.category) {
      return res.status(400).send({ message: 'Name and category are required' });
    }

    const type = new LivestockType({
      name: req.body.name,
      description: req.body.description,
      category: req.body.category,
      avgGestation: req.body.avgGestation,
      avgProductiveLife: req.body.avgProductiveLife,
      avgDailyFeed: req.body.avgDailyFeed,
      avgWaterIntake: req.body.avgWaterIntake,
      productionType: req.body.productionType,
      temperatureRange: req.body.temperatureRange,
      humidityRange: req.body.humidityRange,
      owner: req.user._id
    });

    console.log('Saving type:', type);
    const createdType = await type.save();
    console.log('Type saved successfully:', createdType);

    await logActivity(req.user._id, 'LIVESTOCK_TYPE_CREATED', `Created livestock type: ${createdType.name}`);
    res.status(201).send(createdType);
  } catch (error) {
    console.error('Error creating livestock type:', error);
    
    // Handle MongoDB duplicate key error
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      const value = error.keyValue[field];
      return res.status(400).send({ 
        message: `A livestock type with this ${field} (${value}) already exists in this category. Please use a different name.`
      });
    }

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).send({ message: 'Validation error: ' + messages.join(', ') });
    }

    res.status(400).send({ message: error.message || 'Error creating livestock type' });
  }
}));

// UPDATE livestock type
LivestockTypeRoute.put('/:id', isAuth, expressAsync(async (req, res) => {
  try {
    const type = await LivestockType.findById(req.params.id);
    if (!type) {
      return res.status(404).send({ message: 'Livestock type not found' });
    }
    
    // Check authorization
    if (type.owner.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).send({ message: 'Not authorized to update' });
    }
    
    Object.assign(type, req.body);
    const updatedType = await type.save();
    await logActivity(req.user._id, 'LIVESTOCK_TYPE_UPDATED', `Updated livestock type: ${updatedType.name}`);
    res.send(updatedType);
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
}));

// DELETE livestock type
LivestockTypeRoute.delete('/:id', isAuth, expressAsync(async (req, res) => {
  try {
    const type = await LivestockType.findById(req.params.id);
    if (!type) {
      return res.status(404).send({ message: 'Livestock type not found' });
    }
    
    // Check authorization
    if (type.owner.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).send({ message: 'Not authorized to delete' });
    }
    
    const deletedType = await LivestockType.findByIdAndDelete(req.params.id);
    await logActivity(req.user._id, 'LIVESTOCK_TYPE_DELETED', `Deleted livestock type: ${deletedType.name}`);
    res.send({ message: 'Livestock type deleted', deletedType });
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
}));

module.exports = LivestockTypeRoute;
