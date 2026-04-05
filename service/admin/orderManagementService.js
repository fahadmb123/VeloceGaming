const orderModel = require("../../model/orderModel")
const {variantModel} = require("../../model/productModel")
const {z} = require("zod")
const {walletModel,walletTransactionModel} = require("../../model/walletModel")
const {
    returnRequestAcceptSchema,
    rejectReturnRequestSchema
} = require("../../helpers/validators")


const validateBody = z.object({
    orderId : z.string().min(1),
    orderItemId : z.string().min(1),
    orderStatus : z.string().min(1)
})



const updateOrderStatus = async (req) => {
    try {

        
        const validatedBody = validateBody.safeParse(req.body)

        if (!validatedBody.success) {
            return {validated : true}
        }
        const {orderStatus,orderId,orderItemId} = validatedBody.data
        
        await orderModel.updateOne(
            {_id:orderId,"items._id":orderItemId},
            {
                $set : {
                    "items.$.status" : orderStatus
                }
            }
        )
        const order = await orderModel.findOne({_id:orderId})
        
        const orderItem = order?.items.find(item => {
            return item._id.toString() === orderItemId.toString()
        })
        

        
        let pay
        if (orderStatus === 'delivered') {
            pay = 'paid'
        }
        if (orderStatus === 'cancelled') {
            pay = 'closed'
            if (order?.paymentMethod !== "cod") {
                pay = "refunded"
                await walletModel.updateOne(
                    {userId : req.session.user._id},
                    {
                        $inc : {"balance" : orderItem?.total}
                    }
                )
                const transaction = new walletTransactionModel({
                    type : "credit",
                    userId : req.session.user._id,
                    amount : orderItem?.total,
                    reason : "refunded"
                })
                await transaction.save()
            }
            await variantModel.updateOne(
                {_id:orderItem.variantId},
                {
                    $inc : {"stock":1}
                }
            )
        }


        if (orderStatus === 'delivered' || orderStatus === 'cancelled') {
            await orderModel.updateOne(
                {_id:orderId,"items._id":orderItemId},
                {
                    $set : {
                        "items.$.paymentStatus" : pay
                    }
                }
            )
        }

        return {message : "Updated"}

    } catch (err) {
        console.log(err)
    }
}

const returnRequestAccept = async (req) => {
    try {
        
        const validatedBody = returnRequestAcceptSchema.safeParse(req.body)
        
        if (!validatedBody.success) {
            return {validate : true}
        }
        const {orderId,orderItemId,pickUpDate,pickUpTime} = validatedBody.data

        const pickupDateTime = new Date(`${pickUpDate}T${pickUpTime}:00`)

        await orderModel.updateOne(
            {
                _id: orderId,
                "items._id": orderItemId
            },
            {
                $set:{
                    "items.$.returnRequest.pickUpDate": pickupDateTime,
                    "items.$.returnRequest.status": "approved",
                    "items.$.paymentStatus" : "refunded",
                    "items.$.status" : "returned",
                    "items.$.returnedAt" : new Date()
                }
            }
        )
        const order = await orderModel.findOne({_id:orderId})
        const orderItem = order?.items.find(item => {
            return item._id.toString() === orderItemId.toString()
        })

        
        let refund = orderItem?.total - orderItem?.couponDiscount
        await walletModel.updateOne(
            {userId : order.userId},
                {
                    $inc : {"balance" : refund}
                }
        )
        const transaction = new walletTransactionModel({
            type : "credit",
            userId : order.userId,
            amount : refund,
            reason : "refunded"
        })
        await transaction.save()
        
        await variantModel.updateOne(
            {_id:orderItem.variantId},
            {
                $inc : {"stock":1}
            }
        )

        return {message : "Returned Successfully"}

    } catch (err) {
        console.log(err)
    }
}

const rejectReturnRequest = async (req) => {
    try {
        
        const validated = rejectReturnRequestSchema.safeParse(req.body)

        if (!validated.success) {
            return {validate : true}
        }
        const {orderId,orderItemId} = validated.data

        await orderModel.updateOne(
            {
                _id: orderId,
                "items._id": orderItemId
            },
            {
                $set:{          
                    "items.$.returnRequest.status": "rejected"
                }
            }
        )

        return {message : "Rejected Successfully"}

    } catch (err) {
        console.log(err)
    }
}

module.exports = {
    updateOrderStatus,
    returnRequestAccept,
    rejectReturnRequest
}