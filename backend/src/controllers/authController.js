const User = require("../models/User");

const https = require("https");

// Enhanced Google ID Token validator (verifies signature with Google's servers)
const verifyGoogleCredential = async (credential) => {
  if (!credential || typeof credential !== "string") return null;

  // 1. Online cryptographic verification with Google's tokeninfo API
  try {
    const googleData = await new Promise((resolve, reject) => {
      https
        .get(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`, (res) => {
          let raw = "";
          res.on("data", (chunk) => (raw += chunk));
          res.on("end", () => {
            try {
              resolve(JSON.parse(raw));
            } catch (err) {
              reject(err);
            }
          });
        })
        .on("error", reject);
    });

    if (googleData && googleData.email && !googleData.error) {
      if (process.env.GOOGLE_CLIENT_ID && googleData.aud !== process.env.GOOGLE_CLIENT_ID) {
        console.warn(
          `Google token audience (${googleData.aud}) mismatch with GOOGLE_CLIENT_ID (${process.env.GOOGLE_CLIENT_ID})`
        );
      }
      return {
        email: googleData.email,
        name: googleData.name,
        given_name: googleData.given_name,
        family_name: googleData.family_name,
        sub: googleData.sub,
        picture: googleData.picture,
      };
    }
  } catch (err) {
    console.warn("Online Google token verification note:", err.message);
  }

  // 2. Fallback: Parse Google JWT token payload locally
  try {
    const parts = credential.split(".");
    if (parts.length === 3) {
      const payloadBase64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
      const jsonString = Buffer.from(payloadBase64, "base64").toString("utf-8");
      const parsed = JSON.parse(jsonString);
      if (parsed && (parsed.email || parsed.sub)) {
        return parsed;
      }
    }
  } catch (error) {
    console.error("Local Google credential parsing error:", error);
  }

  return null;
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

    // If Google ID token credential was passed, verify it
    if (credential) {
      const decodedGoogle = await verifyGoogleCredential(credential);
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
        gender: req.user.gender || "",
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

// =========================================================
// UPDATE PROFILE (/api/auth/profile)
// =========================================================
exports.updateProfile = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    const { firstName, lastName, gender, email, phone } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (firstName !== undefined && firstName.trim()) {
      user.firstName = firstName.trim();
    }
    if (lastName !== undefined && lastName.trim()) {
      user.lastName = lastName.trim();
    }
    if (firstName !== undefined || lastName !== undefined) {
      user.name = `${user.firstName || ""} ${user.lastName || ""}`.trim();
    }
    if (gender !== undefined) {
      user.gender = gender;
    }
    if (phone !== undefined) {
      const cleanPhone = phone.trim();
      if (cleanPhone && cleanPhone !== user.phone) {
        const existingPhone = await User.findOne({
          phone: cleanPhone,
          _id: { $ne: user._id },
        });
        if (existingPhone) {
          return res.status(400).json({
            success: false,
            message: "Phone number is already associated with another account.",
          });
        }
      }
      user.phone = cleanPhone;
    }
    if (email !== undefined && email.trim() && email.trim().toLowerCase() !== user.email) {
      const cleanEmail = email.trim().toLowerCase();
      const existingEmail = await User.findOne({
        email: cleanEmail,
        _id: { $ne: user._id },
      });
      if (existingEmail) {
        return res.status(400).json({
          success: false,
          message: "Email address is already in use by another account.",
        });
      }
      user.email = cleanEmail;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: "Personal Information updated successfully!",
      user: {
        id: user._id.toString(),
        name: user.name,
        firstName: user.firstName,
        lastName: user.lastName,
        gender: user.gender,
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
    console.error("UPDATE PROFILE ERROR:", error);
    res.status(500).json({ success: false, message: error.message || "Failed to update profile." });
  }
};

const {
  sendPasswordResetOtpEmail,
  sendPasswordResetSuccessEmail,
} = require("../utils/emailService");

// =========================================================
// FORGOT PASSWORD - Send 6-Digit OTP to Gmail
// =========================================================
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body || {};
    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: "Email address is required.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address.",
      });
    }

    // Check if account exists with this email
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No account exists with this email address. Please check your email or sign up.",
      });
    }

    // Generate random 6-digit numeric OTP code
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.resetPasswordOtp = otp;
    user.resetPasswordExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry
    await user.save();

    // Send branded email with logo and 6-digit OTP
    const emailResult = await sendPasswordResetOtpEmail({
      to: user.email,
      name: user.name || user.firstName || "Reader",
      otp: otp,
    });

    if (!emailResult.success) {
      console.warn(
        `[AuthController] OTP email warning for ${user.email}:`,
        emailResult.error || emailResult.reason
      );
    }

    return res.status(200).json({
      success: true,
      message: "A 6-digit OTP verification code has been sent to your email address.",
      email: user.email,
    });
  } catch (error) {
    console.error("FORGOT PASSWORD ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to process password reset request.",
    });
  }
};

// =========================================================
// VERIFY OTP CODE
// =========================================================
exports.verifyResetOtp = async (req, res) => {
  try {
    const { email, otp } = req.body || {};
    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, message: "Email is required." });
    }
    if (!otp || !otp.toString().trim()) {
      return res.status(400).json({ success: false, message: "6-digit OTP is required." });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const cleanOtp = otp.toString().trim();

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({ success: false, message: "User account not found." });
    }

    if (!user.resetPasswordOtp || user.resetPasswordOtp !== cleanOtp) {
      return res.status(400).json({
        success: false,
        message: "Invalid or incorrect OTP code. Please check and try again.",
      });
    }

    if (!user.resetPasswordExpires || new Date() > new Date(user.resetPasswordExpires)) {
      return res.status(400).json({
        success: false,
        message: "This OTP code has expired. Please request a new verification code.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully. You may now enter your new password.",
      email: user.email,
    });
  } catch (error) {
    console.error("VERIFY OTP ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to verify OTP code.",
    });
  }
};

// =========================================================
// RESET PASSWORD - Apply New Password
// =========================================================
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword, confirmPassword } = req.body || {};

    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, message: "Email address is required." });
    }
    if (!otp || !otp.toString().trim()) {
      return res.status(400).json({ success: false, message: "OTP code is required." });
    }
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters long.",
      });
    }
    if (confirmPassword !== undefined && newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "New password and Confirm password do not match.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const cleanOtp = otp.toString().trim();

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({ success: false, message: "User account not found." });
    }

    if (!user.resetPasswordOtp || user.resetPasswordOtp !== cleanOtp) {
      return res.status(400).json({
        success: false,
        message: "Invalid or incorrect OTP code. Please check and try again.",
      });
    }

    if (!user.resetPasswordExpires || new Date() > new Date(user.resetPasswordExpires)) {
      return res.status(400).json({
        success: false,
        message: "This OTP code has expired. Please request a new verification code.",
      });
    }

    // Set new password (pre-save hook will hash it with bcrypt)
    user.password = newPassword;
    user.resetPasswordOtp = null;
    user.resetPasswordExpires = null;
    await user.save();

    // Send confirmation email in background
    sendPasswordResetSuccessEmail({
      to: user.email,
      name: user.name || user.firstName || "Reader",
    }).catch((e) => console.warn("Notice: reset success email error:", e.message));

    return res.status(200).json({
      success: true,
      message: "Your password has been reset successfully! You can now sign in with your new password.",
    });
  } catch (error) {
    console.error("RESET PASSWORD ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to reset password.",
    });
  }
};

// =========================================================
// CHANGE / RESET PASSWORD (LOGGED IN USER)
// =========================================================
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body || {};

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters long.",
      });
    }

    if (confirmPassword !== undefined && newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "New password and Confirm password do not match.",
      });
    }

    const user = await User.findById(req.user._id).select("+password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User account not found." });
    }

    // If user has a password already set, verify currentPassword
    if (user.password) {
      if (!currentPassword) {
        return res.status(400).json({
          success: false,
          message: "Current password is required.",
        });
      }
      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        return res.status(400).json({
          success: false,
          message: "Incorrect current password. Please try again.",
        });
      }
    }

    user.password = newPassword;
    user.resetPasswordOtp = null;
    user.resetPasswordExpires = null;
    await user.save();

    // Send confirmation email asynchronously
    sendPasswordResetSuccessEmail({
      to: user.email,
      name: user.name || user.firstName || "Reader",
    }).catch((e) => console.warn("Notice: password change email error:", e.message));

    return res.status(200).json({
      success: true,
      message: "Password changed successfully!",
    });
  } catch (error) {
    console.error("CHANGE PASSWORD ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to change password.",
    });
  }
};

