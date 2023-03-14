const app = require("./app")
const PORT = process.env.PORT

app.listen(PORT, () => {
    console.log("eShop app is on port: ", PORT)
})