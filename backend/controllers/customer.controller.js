const bcrypt = require('bcryptjs');
const Customer = require('../models/customer.model');
const generateToken = require('../utils/generateToken');

/**
 * @desc    Register a new customer
 * @route   POST /customers/register
 * @access  Public
 */
const registerCustomer = async (req, res) => {
  try {
    const { fullName, email, password, phone } = req.body;

    // 1. Validation: All fields are mandatory
    if (!fullName || !email || !password || !phone) {
      return res.status(400).json({
        success: false,
        message: 'All fields (fullName, email, password, phone) are mandatory'
      });
    }

    // 2. Validation: Password length >= 6
    if (typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must contain at least 6 characters'
      });
    }

    // 3. Validation: Unique Email Check
    const normalizedEmail = email.toLowerCase().trim();
    const existingCustomer = await Customer.findOne({ email: normalizedEmail });
    if (existingCustomer) {
      return res.status(409).json({
        success: false,
        message: 'A customer with this email already exists'
      });
    }

    // 4. Hash password with bcrypt before saving
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 5. Create new customer
    const newCustomer = await Customer.create({
      fullName: fullName.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      phone: phone.trim()
    });

    // 6. Return success response (Password must NEVER be returned)
    return res.status(201).json({
      success: true,
      message: 'Customer registered successfully',
      customer: {
        _id: newCustomer._id,
        fullName: newCustomer.fullName,
        email: newCustomer.email,
        phone: newCustomer.phone
      }
    });
  } catch (error) {
    console.error('Registration Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during registration',
      error: error.message
    });
  }
};

/**
 * @desc    Authenticate customer & get token in HttpOnly cookie
 * @route   POST /customers/login
 * @access  Public
 */
const loginCustomer = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Validate request body
    if (!email || !password) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // 2. Find customer by email
    const normalizedEmail = email.toLowerCase().trim();
    const customer = await Customer.findOne({ email: normalizedEmail });

    // 3. If customer not found -> 401 (generic message for security)
    if (!customer) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // 4. Compare password using bcrypt
    const isPasswordMatch = await customer.comparePassword(password);
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // 5. Generate JWT and store in HttpOnly cookie
    generateToken(res, customer._id);

    // 6. Return success response
    return res.status(200).json({
      success: true,
      message: 'Login successful'
    });
  } catch (error) {
    console.error('Login Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during login',
      error: error.message
    });
  }
};

/**
 * @desc    Get currently authenticated customer profile
 * @route   GET /customers/me
 * @access  Protected
 */
const getMyProfile = async (req, res) => {
  try {
    // req.user was populated by auth.middleware.js excluding the password
    const customer = req.user;

    return res.status(200).json({
      _id: customer._id,
      fullName: customer.fullName,
      email: customer.email,
      phone: customer.phone
    });
  } catch (error) {
    console.error('Get Profile Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error fetching profile',
      error: error.message
    });
  }
};

/**
 * @desc    Logout customer by clearing HttpOnly authentication cookie
 * @route   POST /customers/logout
 * @access  Protected
 */
const logoutCustomer = async (req, res) => {
  try {
    // Clear the authentication cookie
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });

    return res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during logout',
      error: error.message
    });
  }
};

/**
 * @desc    Bonus Challenge: Change customer password
 * @route   PATCH /customers/change-password
 * @access  Protected
 */
const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    // 1. Validation: required fields
    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Both oldPassword and newPassword are required'
      });
    }

    // 2. Validation: new password length >= 6
    if (typeof newPassword !== 'string' || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must contain at least 6 characters'
      });
    }

    // 3. Find customer with password included
    const customer = await Customer.findById(req.user._id);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    // 4. Verify old password using bcrypt
    const isOldPasswordMatch = await customer.comparePassword(oldPassword);
    if (!isOldPasswordMatch) {
      return res.status(400).json({
        success: false,
        message: 'Incorrect old password'
      });
    }

    // 5. Hash new password and save
    const salt = await bcrypt.genSalt(10);
    customer.password = await bcrypt.hash(newPassword, salt);
    await customer.save();

    return res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change Password Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during password change',
      error: error.message
    });
  }
};

module.exports = {
  registerCustomer,
  loginCustomer,
  getMyProfile,
  logoutCustomer,
  changePassword
};
