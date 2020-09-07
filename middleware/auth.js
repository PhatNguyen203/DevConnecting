const jwt = require("jsonwebtoken");
const config = require("config");

module.exports = function (req, res, next) {
  //get token from header x-auth-token
  const token = req.header("x-auth-token");
  //check if no token
  if (!token) {
    return res.status(401).json({ msg: "no token, authorization dennied" });
  }
  //verify token
  try {
    jwt.verify(token, config.get("jwtSecretToken"), (error, decoded) => {
      if (error) {
        return res.status(401).json({ msg: "Token is invalid" });
      } else {
        req.user = decoded.user;
        console.log(req.user);
        next();
      }
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json("Middleware Error");
  }
};
