const mongoose = require("mongoose")





const orderItemSchema = mongoose.Schema({
   variantId : {
      type : mongoose.Schema.Types.ObjectId
   },
   productName : {
      type : String
   },
   productImage : {
      type : String
   },
   attributes : [{
      key : {
         type : String,
      },
      value : {
         type : String
      }
   }],
   quantity : {
      type : Number
   },
   price : {
      type : Number
   },
   total : {
      type : Number
   },
   returnReason : {
      type : String
   },
   returnDescription : {
      type : String
   },
   cancelReason : {
      type : String
   },
   cancelDescription : {
      type : String
   },
   cancelledAt : {
      type : Date
   },
   returnedAt : {
      type : Date
   },
   deliveredAt : {
      type : String
   },
   status: {
      type: String,
      enum : [
         "placed",
         "shipped",
         "ofd",
         "delivered",
         "cancelled",
         "returned"
      ],
      default: "placed"
   },
   returnRequest: {
      reason: {
         type : String
      },
      description: {
         type : String
      },
      status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: null
      },
      requestedAt: {
         type : Date
      }
   }
})



const orderSchema = mongoose.Schema({
   userId : {
      type : mongoose.Schema.Types.ObjectId,
      ref : "user",
      required : true
   },
   orderId : {
      type : String,
      unique : true
   },
   items: [orderItemSchema],
   subtotal : {
      type : Number
   },
   shippingCharge : {
      type : Number,
      default : 0
   },
   totalAmount: {
      type : Number
   }, 
   discountAmount: {
      type : Number,
      default : 0
   },
   finalAmount: {
      type : Number
   },
   couponCode: {
      type: String,
      default: null
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
   paymentMethod : {
      type : String,
      enum : [
         "cod",
         "razorpay",
         "wallet"
      ]
   },
   paymentStatus : {
      type : String,
      enum : [
         "pending",
         "paid",
         "failed",
         "refunded"
      ],
      default : "pending"
   }
},{timestamps:true})



orderSchema.pre("save", function(){

    if(!this.orderId){

        const date = new Date().toISOString().slice(0,10).replace(/-/g,"")

        const random = Math.floor(1000 + Math.random() * 9000)

        //this.orderId = `ORD-${date}-${random}`
        this.orderId = `ORD-${random}`
    }
})



module.exports = mongoose.model("order",orderSchema)