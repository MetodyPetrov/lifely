const { getCollection } = require("../utils/utils");
const jwt = require("jsonwebtoken");
const { ObjectId } = require('mongodb');
const { SECRET } = require('../config');

exports.auth = (req, res, next) => {
  const token = req.header("X-Authorization");

  if (token) {
    try {
      const decodedToken = jwt.verify(token, SECRET);
      
      req.user = decodedToken;
      
      next();
    } catch (err) {
      res.status(401).json({
        message: "You are not authorized",
      });
    }
  } else {
    next();
  }
};

exports.isAuth = async (req, res, next) => {
  if (!req.user) {
    res.status(400).json({
      message: "Forbiden!",
    });
    return;
  }

  const collection = await getCollection("accounts");
  const account = await collection.findOne({ username: req.user.username, _id: new ObjectId(req.user._id) });
  if (!account) {
    res.status(400).json({
      message: "Forbiden!",
    });
    return;
  }

  next();
};
