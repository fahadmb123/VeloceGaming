const mongoose = require("mongoose")



const orderSchema = mongoose.Schema({
    userId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "user",
        required : true
    },
    items: [
      {
         variantId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Variant"
         },
         quantity: {
            type : Number
         },
         price: {
            type : Number
         }
      }
   ],
   totalAmount: {
    type : Number
   }, 
   discountAmount: {
    type : Number
   },
   finalAmount: {
    type : Number
   },
   couponCode: {
      type: String,
      default: null
   },
   orderStatus: {
      type: String,
      default: "Pending"
   },
   shippingAddress: {
      fullName: {
        type : String
      },
      phone: {
        type : String
      },
      pincode: {
        type : String
      },
      state: {
        type : String
      },
      city: {
        type :String
      },
      address : {
        type : String
      },
      type : {
        type : String
      }
   },
   PaymentMethod : {
    type : String
   }
},{timesstamps:true})




module.exports = mongoose.model("order",orderSchema)