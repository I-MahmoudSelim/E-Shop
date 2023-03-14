const jwt = require("jsonwebtoken");
const User = require("../Models/User");
const secret = process.env.JWT_SECRET

const auth = async (req, res, next) => {
    try {
        const token = req.header("Authorization").replace("Bearer ", "");
        const decoded = jwt.verify(token, secret);

        let user = await User.findOne({ _id: decoded.id, 'tokens.token': token });

        if (!user) {
            throw new MyError(402, "unauthentcated request1")
        }

        req.token = token;
        req.user = user;
        next()
    } catch (error) {
        res.status(401).send({ succes: false, message: "unauthentcated request", error })
    }
}

module.exports = auth