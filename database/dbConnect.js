const mongoose = require("mongoose")

async function dbConnect () {
    try {
        
        mongoose.connect(process.env.MONGODB_URL, {
            family: 4,   
        })
        .then(() => console.log("✅ Database Connected"))
        .catch(err => console.log("❌ Mongo Error:", err.message))
       
        
        
    } catch (err){
        console.log("Database Error Happened..")
    }
}



module.exports = dbConnect;