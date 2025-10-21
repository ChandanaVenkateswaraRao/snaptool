const Item = require('../models/Item');
const User = require('../models/User');
const cloudinary = require('cloudinary').v2;

// Handles creating a new item. (Note: 'location' from req.body is not used, as we use owner's city)
exports.createItem = async (req, res) => {
  try {
    // 1. Cleaned up destructuring: 'location' is removed as it's no longer in the schema.
    const { title, description, category, listingType, price } = req.body;

    // Check for required fields manually for clearer error messages
    if (!title || !description || !category || !listingType) {
        return res.status(400).json({ message: 'Please provide all required fields: title, description, category, and listing type.' });
    }
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: 'Please upload at least one image.' });
    }

    const images = req.files.map(file => ({
      public_id: file.filename,
      url: file.path,
    }));

    const newItem = new Item({
      owner: req.user._id,
      title,
      description,
      category,
      listingType,
      price: price || 0,
      images,
      // 'location' is no longer saved on the item itself.
    });

    const createdItem = await newItem.save();
    res.status(201).json(createdItem);

  } catch (error) {
    // 2. This is the crucial new error handling.
    // It provides specific feedback for different types of errors.
    console.error("CRITICAL ERROR in createItem:", error); // Log the full error to the terminal

    if (error.name === 'ValidationError') {
      // This is for schema validation errors (e.g., a required field is missing)
      return res.status(400).json({ message: `Validation Error: ${error.message}` });
    }
    
    // For any other unexpected crash, send a generic 500 error.
    res.status(500).json({ message: "An internal server error occurred while creating the item." });
  }
};
// Main function for getting lists of items with filters.
exports.getItems = async (req, res) => {
  try {
    const { listingType, category, city, limit } = req.query;

    const filter = { status: 'available' };
    if (listingType) filter.listingType = listingType;
    if (category) filter.category = { $regex: `^${category}$`, $options: 'i' };

    if (city) {
      const usersInCity = await User.find({ city: { $regex: new RegExp(`^${city}$`, 'i') } }).select('_id');
      const userIds = usersInCity.map(user => user._id);
      filter.owner = { $in: userIds };
    }

    let query = Item.find(filter)
      .populate('owner', 'username city') // *** CRITICAL: Always populate owner's city ***
      .sort({ createdAt: -1 });

    if (limit) {
      query = query.limit(parseInt(limit, 10));
    }

    const items = await query;
    res.json(items);
  } catch (error) {
    console.error("ERROR FETCHING ITEMS:", error);
    res.status(500).json({ message: "Server Error: Could not fetch items." });
  }
};

// Gets a single item by its ID with detailed owner info.
exports.getItemById = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id)
      .populate({
          path: 'owner',
          select: 'username email phoneNumber city vendorProfile', // Get all needed owner details
          populate: {
              path: 'vendorProfile',
              select: 'businessName'
          }
      });
    
    if (item) {
      res.json(item);
    } else {
      res.status(404).json({ message: 'Item not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Updates an item's details.
exports.updateItem = async (req, res) => {
  try {
    const { title, description, category, listingType, price } = req.body;
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    if (item.owner.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'User not authorized to update this item' });
    }

    item.title = title || item.title;
    item.description = description || item.description;
    item.category = category || item.category;
    item.listingType = listingType || item.listingType;
    item.price = price === undefined ? item.price : price;

    const updatedItem = await item.save();
    res.json(updatedItem);
  } catch (error) {
    res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};

// Deletes an item.
exports.deleteItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    
    if (item.owner.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    for (const image of item.images) {
      await cloudinary.uploader.destroy(image.public_id);
    }
    
    // Mongoose > 6.x, .remove() is deprecated, use deleteOne()
    await item.deleteOne(); 
    res.json({ message: 'Item removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Toggles an item's availability manually.
exports.toggleItemStatus = async (req, res) => {
    try {
        const item = await Item.findById(req.params.id);
        if (!item) return res.status(404).json({ message: "Item not found." });

        if (item.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized." });
        }

        if (item.status === 'available') {
            item.status = 'unavailable';
        } else if (item.status === 'unavailable') {
            item.status = 'available';
        } else {
            return res.status(400).json({ message: `Cannot manually change status while item is ${item.status}.` });
        }

        await item.save();
        res.json({ status: item.status });
    } catch (error) {
        res.status(500).json({ message: "Server error." });
    }
};

