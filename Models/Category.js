const { Schema, model } = require("mongoose")

const categorySchema = Schema({
    name: {
        type: String,
        required: true,
    },
    color: {
        type: String
    },
    icon: {
        type: Buffer
    },
    image: {
        type: Buffer
    }
}, {

    toJSON: { virtuals: true },
    toObject: { virtuals: true },

    statics: {
        async create(body) {
            let category = new this(body)
            return await category.save()
        },


    },

    methods: {
        async getProducts() {
            return this.populate({ path: "products", select: "_id name price category" })
        }
    }
})

categorySchema.virtual("products", {
    ref: "Product",
    localField: "_id",
    foreignField: "category"
})

categorySchema.virtual("id").get(function () {
    return this._id.toHexString();
})

module.exports = new model("Category", categorySchema)