const User = require("../models/User");
const { isValidObjectId, escapeRegex } = require("../utils/helpers");

// Helper to format joined date
const formatJoinedDate = (date) => {
  if (!date) return "Recently";
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

// =========================================================
// GET ALL USERS (FOR ADMIN PANEL)
// =========================================================
exports.getUsers = async (req, res) => {
  try {
    const {
      search = "",
      role = "",
      status = "",
      sort = "Latest",
      page = 1,
      limit = 100,
    } = req.query;

    const query = {};

    // Search filter
    if (search && search.trim()) {
      const escaped = escapeRegex(search.trim());
      query.$or = [
        { name: { $regex: escaped, $options: "i" } },
        { firstName: { $regex: escaped, $options: "i" } },
        { lastName: { $regex: escaped, $options: "i" } },
        { email: { $regex: escaped, $options: "i" } },
        { phone: { $regex: escaped, $options: "i" } },
      ];
    }

    // Role filter
    if (role && role.trim() && role !== "All Roles" && role !== "All") {
      query.role = role.trim();
    }

    // Status filter
    if (status && status.trim() && status !== "All Status" && status !== "All") {
      query.status = status.trim();
    }

    // Sorting
    let sortOptions = { createdAt: -1 };
    const normalizedSort = sort.toLowerCase();
    if (normalizedSort.includes("a-z")) {
      sortOptions = { name: 1 };
    } else if (normalizedSort.includes("z-a")) {
      sortOptions = { name: -1 };
    } else if (normalizedSort.includes("orders")) {
      sortOptions = { orders: -1 };
    } else if (normalizedSort.includes("oldest")) {
      sortOptions = { createdAt: 1 };
    } else {
      sortOptions = { createdAt: -1 };
    }

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 100, 1), 500);
    const skip = (pageNum - 1) * limitNum;

    const [total, users, allUsers] = await Promise.all([
      User.countDocuments(query),
      User.find(query).sort(sortOptions).skip(skip).limit(limitNum).lean(),
      User.find({}, "status createdAt").lean(),
    ]);

    // Format user records for the Admin panel
    const formattedData = users.map((u) => {
      const idStr = u._id.toString();
      const displayName =
        u.name || `${u.firstName || ""} ${u.lastName || ""}`.trim() || "Unnamed User";
      const defaultAvatar =
        u.avatar ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(
          displayName
        )}&background=eaf3ff&color=1474e8&bold=true`;

      return {
        id: idStr,
        _id: idStr,
        name: displayName,
        firstName: u.firstName || "",
        lastName: u.lastName || "",
        email: u.email,
        phone: u.phone || "",
        role: u.role || "User",
        status: u.status || "Active",
        avatar: defaultAvatar,
        address: u.address || "",
        orders: u.orders || 0,
        joinedDate: formatJoinedDate(u.createdAt),
        createdAt: u.createdAt,
        authProvider: u.authProvider || "local",
      };
    });

    // Calculate dynamic stats
    const totalCount = allUsers.length;
    const activeCount = allUsers.filter((u) => u.status === "Active").length;
    const inactiveCount = allUsers.filter((u) => u.status === "Inactive" || u.status === "Blocked").length;

    res.status(200).json({
      success: true,
      count: formattedData.length,
      data: formattedData,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
      stats: {
        totalUsers: totalCount,
        activeUsers: activeCount,
        inactiveUsers: inactiveCount,
        newUsers: totalCount,
      },
    });
  } catch (error) {
    console.error("GET USERS ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// =========================================================
// GET SINGLE USER BY ID
// =========================================================
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid user ID format" });
    }

    const user = await User.findById(id).lean();
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      data: {
        ...user,
        id: user._id.toString(),
        joinedDate: formatJoinedDate(user.createdAt),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// =========================================================
// CREATE USER (ADMIN)
// =========================================================
exports.createUser = async (req, res) => {
  try {
    const { name, email, phone, role = "User", status = "Active", address, avatar, password } =
      req.body || {};

    if (!name?.trim()) {
      return res.status(400).json({ success: false, message: "Name is required" });
    }

    if (!email?.trim()) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "A user with this email address already exists",
      });
    }

    const nameParts = name.trim().split(" ");
    const firstName = nameParts[0] || "User";
    const lastName = nameParts.slice(1).join(" ") || "Member";

    const user = await User.create({
      firstName,
      lastName,
      name: name.trim(),
      email: normalizedEmail,
      phone: phone?.trim() || "",
      role: role || "User",
      status: status || "Active",
      address: address?.trim() || "",
      avatar:
        avatar ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(
          name.trim()
        )}&background=eaf3ff&color=1474e8&bold=true`,
      password: password || "123456", // Default initial password if created by admin
      authProvider: "local",
    });

    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
        avatar: user.avatar,
        address: user.address,
        orders: user.orders,
        joinedDate: formatJoinedDate(user.createdAt),
      },
    });
  } catch (error) {
    console.error("CREATE USER ERROR:", error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// =========================================================
// UPDATE USER
// =========================================================
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid user ID format" });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const { name, email, phone, role, status, address, avatar, orders } = req.body || {};

    if (name) {
      user.name = name.trim();
      const parts = name.trim().split(" ");
      user.firstName = parts[0];
      user.lastName = parts.slice(1).join(" ");
    }

    if (email && email.trim().toLowerCase() !== user.email) {
      const existing = await User.findOne({
        email: email.trim().toLowerCase(),
        _id: { $ne: id },
      });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: "Another user with this email address already exists",
        });
      }
      user.email = email.trim().toLowerCase();
    }

    if (phone !== undefined) user.phone = phone.trim();
    if (role !== undefined) user.role = role;
    if (status !== undefined) user.status = status;
    if (address !== undefined) user.address = address.trim();
    if (avatar !== undefined) user.avatar = avatar;
    if (orders !== undefined) user.orders = Number(orders) || 0;

    await user.save();

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
        avatar: user.avatar,
        address: user.address,
        orders: user.orders,
        joinedDate: formatJoinedDate(user.createdAt),
      },
    });
  } catch (error) {
    console.error("UPDATE USER ERROR:", error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// =========================================================
// DELETE USER
// =========================================================
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid user ID format" });
    }

    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, message: "User deleted successfully", id });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// =========================================================
// BULK DELETE USERS
// =========================================================
exports.bulkDeleteUsers = async (req, res) => {
  try {
    const { ids } = req.body || {};

    if (!Array.isArray(ids) || !ids.length) {
      return res.status(400).json({ success: false, message: "Please provide user IDs as an array" });
    }

    const validIds = ids.filter((id) => isValidObjectId(id));
    if (!validIds.length) {
      return res.status(400).json({ success: false, message: "No valid ObjectIds provided" });
    }

    const result = await User.deleteMany({ _id: { $in: validIds } });

    res.status(200).json({
      success: true,
      message: `${result.deletedCount} users deleted successfully`,
      deletedCount: result.deletedCount,
      deletedIds: validIds,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
