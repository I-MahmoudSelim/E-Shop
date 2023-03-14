const express = require("express");
const app = express()
const errorHandler = require("./Utils/errorHandler")

require("./Database/mongoose")  //to connect to database server

const api = process.env.API


app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const userRouter = require("./Routers/User")
const productRouter = require("./Routers/Product")
const orderRouter = require("./Routers/Order")
const categoryRouter = require("./Routers/Category")
const orderItemRouter = require("./Routers/OrderItem")

app.use(`${api}/user`, userRouter)
app.use(`${api}/product`, productRouter)
app.use(`${api}/order`, orderRouter)
app.use(`${api}/item`, orderItemRouter)
app.use(`${api}/category`, categoryRouter)
app.use(errorHandler)

module.exports = app