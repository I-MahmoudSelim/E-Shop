class MyError extends Error {
    constructor(status = 500, message = "There is something wrong") {
        super()
        this.status = status;
        this.message = message;
    }
}

module.exports = MyError;