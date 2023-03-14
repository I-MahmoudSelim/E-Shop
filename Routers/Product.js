const Product = require("../Models/Product");
const Category = require("../Models/Category");
const express = require("express")
const router = new express.Router()
const admin = require("../Middleware/admin")
const auth = require("../Middleware/auth")
const handler = require("../Utils/asyncHandler")

router.post("/", admin, handler(async (req, res) => {
    const product = await Product.create({ ...req.body.product })
    if (product) {
        res.status(201).send({ product })
    } else {
        res.status(400).send("Product cannot be created")
    }
}));


router.delete("/:id", admin, handler(async (req, res) => {
    const product = await Product.findByIdAndDelete(req.params.id)
    if (product) {
        res.status(200).send({ success: true, message: "The product is deleted" })
    } else {
        res.sataus(404).send({ success: false, message: "Product is not founded" })
    }
}));

router.get("/", handler(async (req, res) => {
    const filter = {}
    const sort = {}
    let limit = req.query.limit || 10;
    let skip = req.query.skip || 0;

    if (req.query.category) {
        const category = await Category.exists({ name: req.query.category }) //return the id of that category
        filter.category = category._id
    }
    if (req.query.brand) { filter.brand = req.query.brand }
    if (req.query.name) { filter.name = req.query.name }
    if (req.query.sortBy) {
        const sortBy = req.query.sortBy.split(":")
        sort[sortBy[0]] = sortBy[1] === "des" ? -1 : 1
    }
    if (req.query.sortBy2) {
        const sortBy = req.query.sortBy2.split(":")
        sort[sortBy[0]] = sortBy[1] === "des" ? -1 : 1
    }
    if (req.query.maxPrice) {
        filter.price = {}
        filter.price["$lte"] = req.query.maxPrice
    }
    if (req.query.minPrice) {
        if (!filter.price) { filter.price = {} }
        filter.price["$gte"] = req.query.minPrice
    }

    const products = await Product.find(filter)
        .select("name price image")
        .sort(sort)
        .limit(+limit)
        .skip(+limit * +skip)
    if (products) {
        res.status(200).send({ products })
    } else {
        res.sataus(404).send({ success: false, message: "There is no product" })
    }
}));

router.get("/:id", handler(async (req, res) => {
    const product = await Product.findById(req.params.id)
    if (product) {
        res.status(200).send({ product })
    } else {
        res.sataus(404).send({ success: false, message: "Product is not founded" })
    }
}));

router.put("/:id", admin, handler(async (req, res) => {
    const product = await Product.findByIdAndUpdate(
        req.params.id,
        { ...req.body.product },
        { new: true, runValidators: true })
    if (product) {
        res.status(200).send({ product })
    } else {
        res.status(404).send({ success: false, message: "Product is not be founded" })
    }
}));

router.get("/:id/products", handler(async (req, res) => {
    const product = await Product.findById(req.params.id).getCategories()
    if (product) {
        res.status(200).send({ category: product.category, product })
    } else {
        res.sataus(404).send({ success: false, message: "Product is not founded" })
    }
}));

router.get("/get/count", handler(async (req, res) => {
    const productsCount = await Product.estimatedDocumentCount()
    if (productsCount) {
        res.status(200).send({ count: productsCount })
    } else {
        res.sataus(404).send({ success: false, message: "There is no product" })
    }
}));

router.get("/get/featured", handler(async (req, res) => {
    const products = await Product.find({ isFeatured: true })
    if (products) {
        res.status(200).send({ products })
    } else {
        res.sataus(404).send({ success: false, message: "There is no product" })
    }
}));

const multer = require("multer");
const MyError = require("../Utils/MyError");
const sharp = require("sharp");
const upload = multer({
    limits: {
        fileSize: 1000000
    }, fileFilter(req, file, next) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            throw new MyError(422, "avatar must be image with extention of (jpg,png,jpeg)")
        }
        next(undefined, true)
    }
})

router.put("/:id/image", admin, handler(upload.single("image")), handler(async (req, res) => {
    // console.log(req.file)
    const image = await sharp(req.file.buffer).png().resize({ width: 250, height: 250 }).toBuffer();
    const product = await Product.findByIdAndUpdate(req.params.id, { image }, { new: true, runValidators: true })

    res.status(200).send({ product })
}))

router.put("/:id/images", admin, upload.array("images"), handler(async (req, res) => {
    // console.log(req.files)
    const images = await Promise.all(req.files.map(async file => {
        return await sharp(file.buffer).png().resize({ width: 250, height: 250 }).toBuffer()
    }));

    const product = await Product.findByIdAndUpdate(req.params.id, { images }, { new: true, runValidators: true })

    res.status(200).send({ product })
}))
module.exports = router;