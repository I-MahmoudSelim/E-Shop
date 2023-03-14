const Order = require("../Models/Order");
const Item = require("../Models/OrderItem");
const express = require("express")
const router = new express.Router()
const Auth = require("../Middleware/Auth")
const admin = require("../Middleware/admin")
const handler = require("../Utils/asyncHandler");
const MyError = require("../Utils/MyError");
const User = require("../Models/User");


router.post("/", Auth, handler(async (req, res) => {

    let order = { ...req.body.order }
    order["customer"] = req.user;
    order["totalPrice"] = 0;
    order.orderItems = await Promise.all(order.orderItems.map(async i => {
        let item = await Item.create(i)
        console.log(item)
        order.totalPrice += +item.total;
        return item._id
    }))
    console.log(order.orderItems)
    order = await Order.create({ ...order })
    if (order) {
        res.status(201).send({ order })
    } else {
        res.status(400).send("Product cannot be created")
    }
}));

router.get("/me", Auth, handler(async (req, res) => {
    // conole.log()
    let user = req.user
    user = await user.populate("orders")
    res.status(200).send({ user })
}))
router.get("/me/spends", Auth, handler(async (req, res) => {
    let user = req.user
    user = await user.populate("orders")
    const totalSpends = user.orders.reduce((x, y) => x + y.totalPrice, 0)
    res.status(200).send({ totalSpends: totalSpends })
}))

router.get("/:id", admin, handler(async (req, res) => {
    const order = await Order.findById(req.params.id)
        .populate("customer", "name")
        .populate({
            path: "orderItems",
            populate: {
                path: "product",
                populate: "category"
            }
        })
    console.log(order)
    if (!order) {
        throw new MyError(404, "Order not founded")
    }
    res.status(200).send({ order })
}))

router.put("/:id", admin, handler(async (req, res) => {
    const order = await Order.findByIdAndUpdate(req.params.id, req.body.order, { new: true, runValidators: true })
    if (!order) {
        throw new MyError(404, "Order not founded")
    }
    res.status(200).send({ order })
}))

router.delete("/:id", Auth, handler(async (req, res) => {
    const order = await Order.findById(req.params.id)
    if (order.customer !== req.user._id && !req.user.isAdmin) {
        throw new MyError(403, " Unauthorized request")
    }
    order.orderItems.forEach(async element => {
        await Item.findByIdAndDelete(element._id)
    });
    order.deleteOne()
    res.status(200).send({ succes: true, message: "Order is canceled succesfully" })
}))

router.get("/get/profits", admin, handler(async (req, res) => {
    const totalSales = await Order.aggregate().group({ _id: null, totalSales: { $sum: "$totalPrice" } })
    if (!totalSales) {
        throw new MyError(500, "the total sales cannot generated")
    }
    res.status(200).send({ totalSales: totalSales.pop().totalSales })
}))
router.get("/get/count", admin, handler(async (req, res) => {
    const orderCount = await Order.estimatedDocumentCount()
    if (!orderCount) {
        throw new MyError(500, "the total sales cannot generated")
    }
    res.status(200).send({ orderCount })
}))


module.exports = router;