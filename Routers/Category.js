const Category = require("../Models/Category");
const express = require("express")
const router = new express.Router()


router.post("/", async (req, res) => {
    const category = await Category.create({ ...req.body.category })
    if (category) {
        res.status(201).send({ category })
    } else {
        res.status(400).send("Category cannot be created")
    }
});

router.delete("/:id", async (req, res) => {
    const category = await Category.findByIdAndDelete(req.params.id)
    if (category) {
        res.status(200).send({ success: true, message: "The category is deleted" })
    } else {
        res.sataus(404).send({ success: false, message: "Category is not founded" })
    }
})

router.get("/", async (req, res) => {
    const categories = await Category.find({})
    if (categories) {
        res.status(200).send({ categories })
    } else {
        res.sataus(404).send({ success: false, message: "There is no category" })
    }
})

router.get("/:id", async (req, res) => {
    const category = await Category.findById(req.params.id)
    if (category) {
        res.status(200).send({ category })
    } else {
        res.sataus(404).send({ success: false, message: "Category is not founded" })
    }
})


router.put("/:id", async (req, res) => {
    const category = await Category.findByIdAndUpdate(
        req.params.id,
        { ...req.body.category },
        { new: true, runValidators: true })
    if (category) {
        res.status(200).send({ category })
    } else {
        res.status(404).send({ success: false, message: "Category is not be founded" })
    }
})

router.get("/:id/products", async (req, res) => {
    let category = await Category.findById(req.params.id)


    category = await category.getProducts()
    console.log(category)
    if (category) {
        res.status(200).send({ category, products: category.products })
    } else {
        res.sataus(404).send({ success: false, message: "Category is not founded" })
    }
})
module.exports = router;