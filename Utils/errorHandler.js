const { Error } = require("mongoose")
// const multer = require("multer")





module.exports = function (err, req, res, next) {
    console.log(err)
    if (err.status) {
        res.status(err.status).send({ succes: false, err })
    } else if (err instanceof Error) {
        res.status(422).send({ succes: false, err })
        // } else if (err instanceof multer.MulterError) {
        //     res.status(422).send({ succes: false, err })
    } else {
        res.status(500).send({ succes: false, err })
    }
}