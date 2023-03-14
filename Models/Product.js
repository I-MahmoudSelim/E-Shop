const { Schema, model } = require("mongoose")

const productSchema = new Schema({
    name: {
        type: String,
        required: [true, "Product must have name"],
        trim: true,
    },
    description: {
        type: String,
        required: [true, "Product must have  short description"],

    },
    richDescription: {
        type: String,
    },
    image: {
        type: Buffer,
    },
    images: [{
        type: Buffer,
    }],
    brand: {
        type: String,
        trim: true,
        default: "Genaric company"
    },
    price: {
        type: Number,
        required: true,
        min: 0,
    },
    category: [{
        type: Schema.Types.ObjectId,
        ref: "Category",
        required: true
    }],
    countInStoke: {
        type: Number,
        required: true,
        min: 0,
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    dateCreated: {
        type: Date,
        default: Date.now,
    }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },


    statics: {
        async create(body) {
            const product = new this(body);
            return await product.save()
        },
    },
    methods: {
        async getCategories() {
            return await populate("category")
        }
    },
})

productSchema.virtual("id").get(function () {
    return this._id.toHexString();
})


module.exports = new model("Product", productSchema)