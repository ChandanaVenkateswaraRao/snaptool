const Item = require('../models/Item');
const cloudinary = require('cloudinary').v2;
const User = require('../models/User');

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
    // We now accept 'city' as a query parameter
    const { listingType, category, city, limit } = req.query;

    const filter = { status: 'available' };
    if (listingType) filter.listingType = listingType;
    if (category) filter.category = { $regex: category, $options: 'i' };


    if (city) {
      const usersInCity = await User.find({ city: { $regex: new RegExp(`^${city}$`, 'i') } }).select('_id');
      const userIds = usersInCity.map(user => user._id);
      filter.owner = { $in: userIds };
    }
    let query = Item.find(filter)
      .populate('owner', 'username')
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
// In backend/controllers/itemController.js

exports.getItemById = async (req, res) => {
  try {
    const itemId = req.params.id;
    const item = await Item.findById(req.params.id)
      // --- THIS NESTED POPULATE IS THE KEY CHANGE ---
      .populate({
          path: 'owner',
          select: 'username vendorProfile', // Select username and vendorProfile ref
          populate: { // Now populate the vendorProfile from the owner
              path: 'vendorProfile',
              select: 'businessName' // Select the businessName
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


exports.getItemsNearMe = async (req, res) => {
    try {
        const { longitude, latitude, maxDistance = 20000 } = req.query; // 20km default

        if (!longitude || !latitude) {
            return res.status(400).json({ message: 'User location is required to find nearby items.' });
        }

        const nearbyUsers = await User.find({
            location: {
                $near: {
                    $geometry: { type: "Point", coordinates: [parseFloat(longitude), parseFloat(latitude)] },
                    $maxDistance: parseInt(maxDistance)
                }
            }
        }).select('_id');

        const userIds = nearbyUsers.map(user => user._id);
        
        // Find all available items from the list of nearby users
        const items = await Item.find({ owner: { $in: userIds }, status: 'available' })
            .populate('owner', 'username');

        res.json(items);
    } catch (error) {
        res.status(500).json({ message: 'Server Error: ' + error.message });
    }
};


// Add this new function
exports.toggleItemStatus = async (req, res) => {
    try {
        const item = await Item.findById(req.params.id);
        if (!item) return res.status(404).json({ message: "Item not found." });

        // Security check: Only the owner can change the status
        if (item.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized." });
        }

        // Toggle logic
        if (item.status === 'available') {
            item.status = 'unavailable';
        } else if (item.status === 'unavailable') {
            item.status = 'available';
        } else {
            // Don't allow toggling if it's sold or rented out via a transaction
            return res.status(400).json({ message: `Cannot manually change status while item is ${item.status}.` });
        }

        await item.save();
        res.json({ status: item.status });

    } catch (error) {
        res.status(500).json({ message: "Server error." });
    }
};