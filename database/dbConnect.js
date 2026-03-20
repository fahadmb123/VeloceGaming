const mongoose = require("mongoose")

async function dbConnect () {
    try {
        /*console.log("ENV URL:", process.env.MONGODB_URL)
        const conn = await mongoose.connect(process.env.MONGODB_URL)*/
        mongoose.connect(process.env.MONGODB_URL, {
            family: 4,   // 👈 Force IPv4
        })
        .then(() => console.log("✅ Database Connected"))
        .catch(err => console.log("❌ Mongo Error:", err.message))
       
        
        /*console.log("The Database Has been Connected..")*/
    } catch (err){
        console.log("Database Error Happened..")
    }
}



module.exports = dbConnect;