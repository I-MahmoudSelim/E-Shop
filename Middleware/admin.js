const jwt = require("jsonwebtoken");
const User = require("../Models/User");
const secret = process.env.JWT_SECRET;
const MyError = require("../Utils/MyError")

module.exports = async function (req, res, next) {
    try {
        const token = req.header("Authorization").replace("Bearer ", "");
        const decoded = jwt.verify(token, secret);
        const user = await User.findById(decoded.id)
        if (!user.isAdmin) {
            throw new MyError(403, "You are not allowed !")
        }
        req.user = user
        req.token = token
        next()
    } catch (error) {
        res.status(403).send({ succes: false, message: "Unauthorized request", error })
    }
}
