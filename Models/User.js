const mongoose = require("mongoose");
const validator = require("validator");
const MyError = require("../Utils/MyError");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            trim: true,
            lowerCase: true,
            unique: true,
            validate(value) {
                if (!validator.isEmail(value)) {
                    throw new MyError(422, "e-mail is not valid");
                }
            },
        },
        password: {
            type: String,
            required: true,
            trim: true,
            minLength: 7,
            select: false,
            validate(v) {
                if (!validator.isStrongPassword(v)) {
                    throw new MyError(422, "password cannot contain password");
                }
            },
        },
        address: [{
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
            },

        }],
        phone: {
            type: String,
            unique: true,
            // validate(v) {
            //     if (!validator.isMobilePhone(v, "ar-EG")) {
            //         throw new MyError(422, "Mobile phone is invalid");
            //     }
            // },
        },
        age: {
            type: Number,
            min: 21,
            rquire: true,
        },
        payment: [{
            method: {
                type: String,
                enum: ["Bank Card", "Online Wallet"],
                required: function () {
                    if (this._id) {
                        return true;
                    }
                    return false;
                },
            },
            holderName: {
                type: String,
                required: function () {
                    if (this.method) {
                        return true;
                    }
                    return false;
                },
                trim: true,
            },
            cardNumber: {
                type: String,
                alias: "walletNumber",
                required: function () {
                    if (this.method) {
                        return true;
                    }
                    return false;
                },
                trim: true,
                maxlength: 16,
                minlength: 16,
                validate(v) {
                    if (this.method === "Bank Card" && !validator.isInt(v)) {
                        if (this.method === "Online Wallet" && !validator.isMobilePhone(v, "ar-EG")) {
                            throw new MyError(422, "Mobile phone is invalid");
                        }
                        throw new MyError(422, "Bank Card number is invalid")
                    }
                }
            },
            CVV: {
                type: String,
                select: false,
                required: function () {
                    if (this.method === "Bank Card") {
                        return true;
                    }
                    return false;
                },
                maxlength: 3,
                minlength: 3,
                validate(v) {
                    if (!validator.isInt(v)) {
                        throw new MyError(422, "CVV must be a number")
                    }
                }
            },
            expireDate: {
                type: String,
                trim: true,
                required: function () {
                    if (this.method === "Bank Card") {
                        return true;
                    }
                    return false;
                },
                maxlength: 5,
                minlength: 5,
                validate(v) {
                    if (!validator.isDate("19" + v + "/12", { format: "YYYY/MM/DD" })) {
                        throw new MyError(422, "expiry date is invalid")
                    }
                }
            },

        }],
        tokens: [{
            token: {
                type: String,
                required: true,
            }
        }],
        avatar: Buffer,
        isAdmin: Boolean,
    },
    {

        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },

        statics: {

            async signUp(body) {
                const user = new this(body);
                const token = user.getJWT();
                user.tokens.push({ token });
                await user.save();
                return { user, token };
            },

            async logIn(email, password) {
                if (validator.isEmail(email)) {
                    let user = await this.findOne({ email }).select({ name: 1, email: 1, password: 1, age: 1, phone: 1, address: 1, });
                    if (user) {
                        if (await bcrypt.compare(password, user.password)) {
                            user = await this.findById(user._id)
                            const token = user.getJWT();
                            user.tokens.push({ token });
                            await user.save()
                            return { user, token };
                        }
                    }
                }
                throw new MyError(422, "email or password is wrong, try again");
            },
        },


        methods: {

            async modifiy(body) {
                const properties = Object.keys(body);

                if (properties.length === 0) {
                    throw new MyError(400, "invalid data")
                }
                let user = this
                const variables = ["name", "email", "password", "age", "phone", "address", "payment"];
                const isvalidated = properties.filter((property) => variables.includes(property));

                for (const property of isvalidated) {

                    if (property === "address") {
                        user.modifiyAdress(body) // edit the address array go to ln:188
                    } else if (property === "payment") {
                        user.modifiyPayment(body)// edit the payment array go to ln:174
                    } else {
                        user[property] = body[property];
                    }
                }

                user = await user.save();
                return user;
            },

            modifiyPayment(body) {
                try {
                    let user = this;
                    for (const i of body.payment) {
                        let index = user.payment.findIndex((x) => x._id.equals(i._id));
                        if (index == -1) {
                            user.payment.push(i);
                        } else {
                            for (const key in i) {
                                if (Object.hasOwnProperty.call(user.payment[index].toObject(), key)) {
                                    user.payment[index][key] = i[key]
                                }
                            }
                        }
                    }
                    return user;
                } catch (error) {
                    throw new MyError(422, error.message)
                }
            },

            modifiyAdress(body) {
                try {
                    user = this;

                    for (const i of body.address) {
                        let index = user.address.findIndex((x) => x._id.equals(i._id));
                        if (index == -1) {
                            user.address.push(i);
                        } else {
                            user.address[index].title = i.title;
                            user.address[index].description = i.description;
                        }
                    }
                    return user;
                } catch (error) {
                    throw new MyError(422, error.message)
                }
            },

            deletePayment(body) {
                try {
                    let user = this;
                    let deletedMethodsCount = 0;
                    let alreadyDeleted = [];
                    let methods = [...user.payment];
                    for (const i of [...body.payment]) {
                        let index = methods.findIndex((x) => x._id.equals(i._id));
                        if (index == -1) {
                            alreadyDeleted.push(i)
                        } else {
                            methods.splice(index, 1)
                            deletedMethodsCount += 1;
                        }
                    }
                    user.payment = methods;
                    return { user, deletedMethodsCount, alreadyDeleted };
                } catch (error) {
                    throw new MyError(422, error.message)
                }
            },

            deleteAdress(body) {
                try {
                    let user = this;
                    let deletedAddressCount = 0;
                    let alreadyDeleted = [];
                    let addresses = [...user.address];
                    for (const i of [...body.address]) {
                        let index = addresses.findIndex((x) => x._id.equals(i._id));
                        if (index == -1) {
                            alreadyDeleted.push(i)
                        } else {
                            addresses.splice(index, 1)
                            deletedAddressCount += 1;
                        }
                    }
                    user.address = addresses;
                    return { user, deletedAddressCount, alreadyDeleted };
                } catch (error) {
                    throw new MyError(422, error.message)
                }
            },

            securePayment() {
                if (this.payment) {
                    for (let card of this.payment) {
                        if (card.method === "Bank Card") {
                            card.cardNumber = "Ends with " + card.cardNumber.slice(-4)
                        }
                    }
                }
            },

            getJWT() {
                const token = jwt.sign({ id: this._id }, process.env.JWT_SECRET);
                return token;

            },

            toJSON() {
                this.securePayment()
                let user = this.toObject();
                delete user.password;
                delete user.tokens;
                delete user.__v;
                return user;
            }
        }
    }
)

userSchema.pre("save", async function (next) {
    const user = this;
    if (user.isModified("password")) {
        user.password = await bcrypt.hash(user.password, 8);
    } else if (user.isModified("payment")) {
        user.payment.CVV = await bcrypt.hash(user.payment.CVV, 8);
    }
    next();
});
userSchema.virtual("id").get(function () {
    return this._id.toHexString();
})
userSchema.virtual("orders", {
    ref: "Order",
    localField: "_id",
    foreignField: "customer"
})
module.exports = new mongoose.model("User", userSchema);

