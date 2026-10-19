const User = require("../models/User");

// Helper to decode Google JWT credential token payload
const parseGoogleCredential = (credential) => {
  if (!credential || typeof credential !== "string") return null;
  try {
    const parts = credential.split(".");
    if (parts.length !== 3) return null;
    const payloadBase64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const jsonString = Buffer.from(payloadBase64, "base64").toString("utf-8");
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Error parsing Google credential:", error);
    return null;
  }
};

// =========================================================
// REGISTER (SIGNUP)
// =========================================================
exports.register = async (req, res) => {
  try {
    const { firstName, lastName, email, phone = "", password } = req.body || {};

    // Validation
    if (!firstName?.trim()) {
      return res.status(400).json({ success: false, message: "First name is required." });
    }
    if (!lastName?.trim()) {
      return res.status(400).json({ success: false, message: "Last name is required." });
    }
    if (!email?.trim()) {
      return res.status(400).json({ success: false, message: "Email address is required." });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return res.status(400).json({ success: false, message: "Please provide a valid email address." });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password is required and must contain at least 6 characters.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check if email already exists
    const existingEmail = await User.findOne({ email: normalizedEmail });
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: "An account with this email address already exists. Please login instead.",
      });
    }

    // Check if phone already exists (if provided)
    if (phone && phone.trim()) {
      const existingPhone = await User.findOne({ phone: phone.trim() });
      if (existingPhone) {
        return res.status(400).json({
          success: false,
          message: "An account with this phone number already exists.",
        });
      }
    }

    const fullName = `${firstName.trim()} ${lastName.trim()}`;
    const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(
      fullName
    )}&background=eaf3ff&color=1474e8&bold=true`;

    const user = await User.create({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      name: fullName,
      email: normalizedEmail,
      phone: phone.trim(),
      password,
      role: "User", // Role is User per specification
      status: "Active",
      avatar: defaultAvatar,
      authProvider: "local",
    });

    // Generate JWT token
    const token = user.generateToken();

    res.status(201).json({
      success: true,
      message: "Account created successfully!",
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
        avatar: user.avatar,
        authProvider: user.authProvider,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("REGISTER ERROR:", error);
    res.status(500).json({ success: false, message: error.message || "Failed to create account." });
  }
};

// =========================================================
// LOGIN
// =========================================================
exports.login = async (req, res) => {
  try {
    const { identifier, email, phone, password } = req.body || {};
    const loginIdentifier = (identifier || email || phone || "").trim();

    if (!loginIdentifier) {
      return res.status(400).json({
        success: false,
        message: "Email address or phone number is required.",
      });
    }

    if (!password) {
      return res.status(400).json({
        success: false,
        message: "Password is required.",
      });
    }

    // Query by email (case-insensitive) or phone
    const query = loginIdentifier.includes("@")
      ? { email: loginIdentifier.toLowerCase() }
      : {
          $or: [
            { email: loginIdentifier.toLowerCase() },
            { phone: loginIdentifier },
          ],
        };

    const user = await User.findOne(query).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email/phone or password.",
      });
    }

    // If account was created with Google and doesn't have a password
    if (!user.password && user.authProvider === "google") {
      return res.status(400).json({
        success: false,
        message: "This account was registered using Google. Please click 'Continue with Google' to sign in.",
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email/phone or password.",
      });
    }

    if (user.status === "Blocked") {
      return res.status(403).json({
        success: false,
        message: "Your account has been suspended. Please contact support.",
      });
    }

    const token = user.generateToken();

    res.status(200).json({
      success: true,
      message: "Login successful!",
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
        avatar: user.avatar,
        authProvider: user.authProvider,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    res.status(500).json({ success: false, message: error.message || "Failed to log in." });
  }
};

// =========================================================
// GOOGLE AUTH (CONTINUE WITH GOOGLE)
// =========================================================
exports.googleAuth = async (req, res) => {
  try {
    const { credential, email, name, firstName, lastName, googleId, avatar } = req.body || {};

    let userEmail = email;
    let userName = name;
    let userFirstName = firstName;
    let userLastName = lastName;
    let userGoogleId = googleId;
    let userAvatar = avatar;

    // If Google ID token credential was passed, decode it
    if (credential) {
      const decodedGoogle = parseGoogleCredential(credential);
      if (decodedGoogle) {
        userEmail = decodedGoogle.email;
        userName = decodedGoogle.name;
        userFirstName = decodedGoogle.given_name || userFirstName;
        userLastName = decodedGoogle.family_name || userLastName;
        userGoogleId = decodedGoogle.sub || userGoogleId;
        userAvatar = decodedGoogle.picture || userAvatar;
      }
    }

    if (!userEmail || !userEmail.trim()) {
      return res.status(400).json({
        success: false,
        message: "Google authentication failed: Email not provided.",
      });
    }

    const normalizedEmail = userEmail.trim().toLowerCase();

    // Check if user already exists
    let user = await User.findOne({ email: normalizedEmail });

    if (user) {
      if (user.status === "Blocked") {
        return res.status(403).json({
          success: false,
          message: "Your account has been suspended. Please contact support.",
        });
      }

      // Update googleId and avatar if not present
      if (!user.googleId && userGoogleId) {
        user.googleId = userGoogleId;
      }
      if (!user.avatar && userAvatar) {
        user.avatar = userAvatar;
      }
      await user.save();
    } else {
      // Create new user with role 'User'
      const splitName = (userName || "").trim().split(" ");
      const finalFirstName = userFirstName || splitName[0] || "Google";
      const finalLastName = userLastName || splitName.slice(1).join(" ") || "User";
      const finalFullName = userName || `${finalFirstName} ${finalLastName}`.trim();
      const finalAvatar =
        userAvatar ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(
          finalFullName
        )}&background=eaf3ff&color=1474e8&bold=true`;

      user = await User.create({
        firstName: finalFirstName,
        lastName: finalLastName,
        name: finalFullName,
        email: normalizedEmail,
        googleId: userGoogleId || "",
        avatar: finalAvatar,
        role: "User", // Role is User per specification
        status: "Active",
        authProvider: "google",
      });
    }

    const token = user.generateToken();

    res.status(200).json({
      success: true,
      message: "Google authentication successful!",
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone || "",
        role: user.role,
        status: user.status,
        avatar: user.avatar,
        authProvider: user.authProvider,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("GOOGLE AUTH ERROR:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Google authentication failed.",
    });
  }
};

// =========================================================
// GET CURRENT USER (/api/auth/me)
// =========================================================
exports.getMe = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    res.status(200).json({
      success: true,
      user: {
        id: req.user._id.toString(),
        name: req.user.name,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        email: req.user.email,
        phone: req.user.phone,
        role: req.user.role,
        status: req.user.status,
        avatar: req.user.avatar,
        authProvider: req.user.authProvider,
        createdAt: req.user.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
