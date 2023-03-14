const mongoose = require("mongoose");

mongoose.set({ 'strictQuery': false })
const MONGODB_URI = process.env.MONGODB_URI ? process.env.MONGODB_URI : "mongodb://127.0.0.1:27017/eShop-dev"
mongoose.connect(MONGODB_URI)