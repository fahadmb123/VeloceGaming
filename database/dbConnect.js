const mongoose = require("mongoose")

async function dbConnect () {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URL)
        console.log("The Database Has been Connected..")
    } catch (err){
        console.log("Database Error Happened..")
    }
}


module.exports = dbConnect;