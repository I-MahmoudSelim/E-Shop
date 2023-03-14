const { Schema, model } = require("mongoose")
const validator = require("validator");
const MyError = require("../Utils/MyError");

const itemSchema = Schema({
    product: {
        type: Schema.Types.ObjectId,
        ref: "Product",
        required: true
    },
    quantity: {
        type: Number,
        min: 0,
        max: 10
    },
    name: {
        type: String,
        required: [true, "Product must have name"],
        trim: true,
    },
    total: {
        type: Number,
        required: true,
    }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },

    statics: {
        async create(body) {
            body.total = body.price * body.quantity;
            body.product = body._id;
            delete body._id;
            delete body.price;
            console.log(body)
            return await new this({ ...body }).save()
        }
    }
})

itemSchema.virtual("id").get(function () {
    return this._id.toHexString();
})
module.exports = new model("Item", itemSchema)