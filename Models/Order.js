const { Schema, model, Error } = require("mongoose")
const validator = require("validator");
const MyError = require("../Utils/MyError");
const handler = require("../Utils/asyncHandler");



const orderSchema = Schema({
    orderItems: [{
        type: Schema.Types.ObjectId,
        ref: "Item",
        required: true
    }],
    address: {
        title: {
            type: String,
            trim: true,
        },
        street: {
            type: String,
            trim: true,
        },
        city: {
            type: String,
            trim: true,
        },
        country: {
            type: String,
            trim: true,
        }
    },
    phone: {
        type: String,
        validate(v) {
            if (!validator.isMobilePhone(v, "ar-EG")) {
                throw new MyError(422, "Mobile phone is invalid");
            }
        },
    },
    status: {
        type: String,
        default: "Pending"
    },
    totalPrice: {
        type: Number,
    },
    customer: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    DateOrderd: {
        type: Date,
        default: Date.now
    }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },

})

orderSchema.virtual("id").get(function () {
    return this._id.toHexString();
})
const Item = require("./OrderItem")

module.exports = new model("Order", orderSchema)