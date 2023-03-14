const User = require("../Models/User");
const express = require("express")
const router = new express.Router()
const auth = require("../Middleware/auth");
const MyError = require("../Utils/MyError");
const handler = require("../Utils/asyncHandler");


router.post("", handler(async (req, res) => {
    const { user, token } = await User.signUp(req.body)
    res.status(201).send({ user, token })
}))

router.post("/login", handler(async (req, res) => {
    const { user, token } = await User.logIn(req.body.email, req.body.password)
    res.status(200).send({ user, token })
}))

router.get("/me", auth, handler(async (req, res) => {
    const user = req.user;
    res.status(200).send({ user })
}))

router.patch("/me", auth, handler(async (req, res) => {
    const user = req.user;
    user = await user.modifiy(req.body);
    if (!user) {
        throw new MyError(500, "something wrong ")
    }
    res.status(200).send({ user })
}))

router.delete("/me", auth, handler(async (req, res) => {
    await User.findByIdAndDelete(req.user._id)
    res.status(200).send("good bye")
}))

router.patch("/me/payment", auth, handler(async (req, res) => {
    let user = req.user
    user = user.modifiyPayment(req.body);
    user = await user.save();
    if (!user) {
        throw new MyError(500, "something wrong ")
    }
    res.status(200).send({ user })
}))

router.delete("/me/payment", auth, handler(async (req, res) => {
    const { user, deletedMethodsCount, alreadyDeleted } = req.user.deletePayment(req.body)
    if (deletedMethodsCount > 0) {
        user = await user.save()
    }
    res.status(200).send({ user: user.toJSON(), deletedMethodsCount, alreadyDeleted })
}))

router.patch("/me/address", auth, handler(async (req, res) => {
    let user = req.user
    user = user.modifiyAddress(req.body);
    user = await user.save();
    if (!user) {
        throw new MyError(500, "something wrong ")
    }
    res.status(200).send({ user })
}))

router.delete("/me/address", auth, handler(async (req, res) => {
    const { user, deletedAddressCount, alreadyDeleted } = req.user.deleteAddress(req.body)
    if (deletedAddressCount > 0) {
        user = await user.save()
    }
    res.status(200).send({ user: user.toJSON(), deletedAddressCount, alreadyDeleted })
}))


const sharp = require("sharp")
const multer = require("multer")

//  middleware to check the uploading picture
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


// router to upload user avatar 

router.post("/me/avatar", auth, handler(upload.single("avatar")), handler(async (req, res) => {
    const avatar = await sharp(req.file.buffer).png().resize(300, 300).toBuffer();
    let user = req.user
    user.avatar = avatar;
    user = await user.save();
    res.status(201).send({ user });
}))

//   router to remove user avatar

router.delete("/me/avatar", auth, handler(async (req, res) => {
    let user = req.user
    user.avatar = undefined;
    user = await user.save();
    res.status(201).send({ user });
}))


module.exports = router;