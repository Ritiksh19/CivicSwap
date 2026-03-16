const Item = require("../models/Item");

// ─────────────────────────────────────────
// @route   POST /api/items
// @access  Private
// ─────────────────────────────────────────
const createItem = async (req, res) => {
  try {
    const { title, description, category, longitude, latitude } = req.body;

    const item = await Item.create({
      owner: req.user._id,
      title,
      description,
      category,
      location: {
        type: "Point",
        coordinates: [longitude, latitude],
      },
    });

    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─────────────────────────────────────────
// @route   GET /api/items
// @access  Private
// ─────────────────────────────────────────
const getItems = async (req, res) => {
  try {
    const { longitude, latitude, radius = 5, category, search } = req.query;

    let query = { status: "AVAILABLE" };

    // Category filter
    if (category) query.category = category;

    // Search filter
    if (search) query.title = { $regex: search, $options: "i" };

    // Geo filter - nearby items
    if (longitude && latitude) {
      const items = await Item.find({
        ...query,
        location: {
          $nearSphere: {
            $geometry: {
              type: "Point",
              coordinates: [parseFloat(longitude), parseFloat(latitude)],
            },
            $maxDistance: radius * 1000, // km to meters
          },
        },
      }).populate("owner", "name reputationScore avatar");

      return res.json(items);
    }

    const items = await Item.find(query)
      .populate("owner", "name reputationScore avatar")
      .sort({ createdAt: -1 });

    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─────────────────────────────────────────
// @route   GET /api/items/:id
// @access  Private
// ─────────────────────────────────────────
const getItemById = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id).populate(
      "owner",
      "name reputationScore avatar bio",
    );

    if (!item) {
      return res.status(404).json({ message: "Item nahi mila" });
    }

    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─────────────────────────────────────────
// @route   PUT /api/items/:id
// @access  Private
// ─────────────────────────────────────────
const updateItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: "Item nahi mila" });
    }

    // Sirf owner update kar sakta hai
    if (item.owner.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Permission nahi hai" });
    }

    const updatedItem = await Item.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    res.json(updatedItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─────────────────────────────────────────
// @route   DELETE /api/items/:id
// @access  Private
// ─────────────────────────────────────────
const deleteItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: "Item nahi mila" });
    }

    // Sirf owner delete kar sakta hai
    if (item.owner.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Permission nahi hai" });
    }

    await item.deleteOne();
    res.json({ message: "Item delete ho gaya" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createItem, getItems, getItemById, updateItem, deleteItem };
