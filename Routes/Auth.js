const express = require('express');
const User = require('../models/User');
const Order = require('../models/Orders');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const fetch = require('../middleware/fetchdetails');

const jwtSecret = "HaHa"; // 🔐 Replace with env variable in production

// 🚀 Create User
router.post('/createuser', [
  body('email').isEmail(),
  body('password').isLength({ min: 5 }),
  body('name').isLength({ min: 3 })
], async (req, res) => {
  let success = false;
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success, errors: errors.array() });

  try {
    const salt = await bcrypt.genSalt(10);
    const securePass = await bcrypt.hash(req.body.password, salt);

    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) return res.status(400).json({ success, error: "Email already exists" });

    const user = await User.create({
      name: req.body.name,
      password: securePass,
      email: req.body.email,
      location: req.body.location
    });

    const data = { user: { id: user.id } };
    const authToken = jwt.sign(data, jwtSecret);
    success = true;
    res.json({ success, authToken });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success, error: "Internal Server Error" });
  }
});

// 🔐 Login
router.post('/login', [
  body('email', "Enter a valid Email").isEmail(),
  body('password', "Password cannot be blank").exists(),
], async (req, res) => {
  let success = false;
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ success, error: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ success, error: "Invalid credentials" });

    const data = { user: { id: user.id } };
    const authToken = jwt.sign(data, jwtSecret);
    success = true;
    res.json({ success, authToken });

  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// 👤 Get User Details
router.post('/getuser', fetch, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.send(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// 📍 Get Location
router.post('/getlocation', async (req, res) => {
  try {
    const { lat, long } = req.body.latlong;
    const response = await axios.get(`https://api.opencagedata.com/geocode/v1/json?q=${lat}+${long}&key=74c89b3be64946ac96d777d08b878d43`);

    const components = response.data.results[0].components;
    const location = `${components.village || ""}, ${components.county || ""}, ${components.state_district || ""}, ${components.state || ""} - ${components.postcode || ""}`;
    res.send({ location });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
});

// 🍔 Send Food Data
router.post('/foodData', async (req, res) => {
  try {
    res.send([global.foodData, global.foodCategory]);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
});

// 🛒 Place Order
router.post('/orderData', async (req, res) => {
  try {
    const data = req.body.order_data;
    data.splice(0, 0, { Order_date: req.body.order_date });

    const existingOrder = await Order.findOne({ email: req.body.email });
    if (!existingOrder) {
      await Order.create({ email: req.body.email, order_data: [data] });
    } else {
      await Order.findOneAndUpdate(
        { email: req.body.email },
        { $push: { order_data: data } }
      );
    }
    res.json({ success: true });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// 📦 Get Orders
router.post('/myOrderData', async (req, res) => {
  try {
    const orders = await Order.findOne({ email: req.body.email });
    res.json({ orderData: orders });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
