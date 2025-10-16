const Item = require('../models/Item');
const cloudinary = require('cloudinary').v2;

exports.createItem = async (req, res) => {
  const { title, description, category, listingType, price, location } = req.body;
  
  if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'Please upload at least one image.' });
  }

  const images = req.files.map(file => ({
    public_id: file.filename,
    url: file.path,
  }));

  try {
    const item = new Item({
      owner: req.user._id,
      title,
      description,
      category,
      listingType,
      price,
      location,
      images
    });

    const createdItem = await item.save();
    res.status(201).json(createdItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// In backend/controllers/itemController.js

exports.getItems = async (req, res) => {
  try {
    const { listingType, category, location } = req.query;

    // Build a dynamic filter object
    const filter = {};

    // --- THIS IS THE KEY ADDITION ---
    // Always filter for available items on public feeds.
    filter.status = 'available';

    if (listingType) {
      filter.listingType = listingType;
    }
    if (category) {
      filter.category = { $regex: category, $options: 'i' };
    }
    if (location) {
      filter.location = { $regex: location, $options: 'i' };
    }

    const items = await Item.find(filter).populate('owner', 'username profilePicture');
    res.json(items);
    
  } catch (error) {
    console.error("ERROR FETCHING ITEMS:", error);
    res.status(500).json({ message: "Server Error: Could not fetch items." });
  }
};

exports.deleteItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    
    // Check if user is the owner
    if (item.owner.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Delete images from Cloudinary
    for (const image of item.images) {
      await cloudinary.uploader.destroy(image.public_id);
    }
    
    await item.deleteOne();
    res.json({ message: 'Item removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Add these two functions to your existing itemController.js
exports.getItemById = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id).populate('owner', 'username profilePicture');
    if (item) {
      res.json(item);
    } else {
      res.status(404).json({ message: 'Item not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add this function to backend/controllers/itemController.js

exports.updateItem = async (req, res) => {
  try {
    const { title, description, category, listingType, price, location } = req.body;
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Check if the logged-in user is the owner of the item
    if (item.owner.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'User not authorized to update this item' });
    }

    // Update the fields
    item.title = title || item.title;
    item.description = description || item.description;
    item.category = category || item.category;
    item.listingType = listingType || item.listingType;
    item.price = price === undefined ? item.price : price;
    item.location = location || item.location;

    const updatedItem = await item.save();
    res.json(updatedItem);

  } catch (error) {
    res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};