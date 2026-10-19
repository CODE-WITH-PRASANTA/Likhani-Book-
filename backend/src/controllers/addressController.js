const User = require("../models/User");

/**
 * Get all saved addresses for authenticated user
 * Route: GET /api/users/addresses or /api/auth/addresses
 */
exports.getAddresses = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("addresses");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    return res.status(200).json({
      success: true,
      addresses: user.addresses || [],
    });
  } catch (error) {
    console.error("Error fetching addresses:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load addresses",
      error: error.message,
    });
  }
};

/**
 * Add a new delivery address
 * Route: POST /api/users/addresses or /api/auth/addresses
 */
exports.addAddress = async (req, res) => {
  try {
    const {
      name,
      phone,
      pincode,
      locality,
      street,
      city,
      state,
      landmark,
      alternatePhone,
      addressType,
      isDefault,
    } = req.body;

    if (!name || !phone || !pincode || !street || !city) {
      return res.status(400).json({
        success: false,
        message: "Name, phone, pincode, street address and city are required.",
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (!user.addresses) {
      user.addresses = [];
    }

    const shouldBeDefault = isDefault || user.addresses.length === 0;

    if (shouldBeDefault) {
      user.addresses.forEach((addr) => {
        addr.isDefault = false;
      });
    }

    const newAddress = {
      name: name.trim(),
      phone: phone.trim(),
      pincode: pincode.trim(),
      locality: (locality || "").trim(),
      street: street.trim(),
      city: city.trim(),
      state: (state || "Odisha").trim(),
      landmark: (landmark || "").trim(),
      alternatePhone: (alternatePhone || "").trim(),
      addressType: addressType === "Work" ? "Work" : "Home",
      isDefault: shouldBeDefault,
    };

    user.addresses.push(newAddress);

    // Also update main user quick fields
    if (shouldBeDefault) {
      user.address = `${newAddress.street}, ${newAddress.city}`;
      if (!user.phone) user.phone = newAddress.phone;
    }

    await user.save();

    return res.status(201).json({
      success: true,
      message: "Address added successfully",
      addresses: user.addresses,
    });
  } catch (error) {
    console.error("Error adding address:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to add address",
      error: error.message,
    });
  }
};

/**
 * Update an existing delivery address
 * Route: PUT /api/users/addresses/:id
 */
exports.updateAddress = async (req, res) => {
  try {
    const {
      name,
      phone,
      pincode,
      locality,
      street,
      city,
      state,
      landmark,
      alternatePhone,
      addressType,
      isDefault,
    } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const address = user.addresses.id(req.params.id);
    if (!address) {
      return res.status(404).json({ success: false, message: "Address not found" });
    }

    if (isDefault) {
      user.addresses.forEach((addr) => {
        addr.isDefault = false;
      });
      address.isDefault = true;
    }

    if (name) address.name = name.trim();
    if (phone) address.phone = phone.trim();
    if (pincode) address.pincode = pincode.trim();
    if (locality !== undefined) address.locality = locality.trim();
    if (street) address.street = street.trim();
    if (city) address.city = city.trim();
    if (state) address.state = state.trim();
    if (landmark !== undefined) address.landmark = landmark.trim();
    if (alternatePhone !== undefined) address.alternatePhone = alternatePhone.trim();
    if (addressType) address.addressType = addressType === "Work" ? "Work" : "Home";

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Address updated successfully",
      addresses: user.addresses,
    });
  } catch (error) {
    console.error("Error updating address:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update address",
      error: error.message,
    });
  }
};

/**
 * Delete a delivery address
 * Route: DELETE /api/users/addresses/:id
 */
exports.deleteAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const address = user.addresses.id(req.params.id);
    if (!address) {
      return res.status(404).json({ success: false, message: "Address not found" });
    }

    const wasDefault = address.isDefault;
    user.addresses.pull(req.params.id);

    // If default was deleted, assign first remaining address as default
    if (wasDefault && user.addresses.length > 0) {
      user.addresses[0].isDefault = true;
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Address deleted successfully",
      addresses: user.addresses,
    });
  } catch (error) {
    console.error("Error deleting address:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete address",
      error: error.message,
    });
  }
};

/**
 * Set an address as default
 * Route: PUT /api/users/addresses/:id/default
 */
exports.setDefaultAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const targetAddress = user.addresses.id(req.params.id);
    if (!targetAddress) {
      return res.status(404).json({ success: false, message: "Address not found" });
    }

    user.addresses.forEach((addr) => {
      addr.isDefault = addr._id.toString() === req.params.id;
    });

    user.address = `${targetAddress.street}, ${targetAddress.city}`;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Default address updated",
      addresses: user.addresses,
    });
  } catch (error) {
    console.error("Error setting default address:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to set default address",
      error: error.message,
    });
  }
};
