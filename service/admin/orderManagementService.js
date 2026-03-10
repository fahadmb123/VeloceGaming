const orderModel = require("../../model/orderModel")
const {z} = require("zod")
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

        console.log(req.body)
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

        let pay
        if (orderStatus === 'delivered') {
            pay = 'paid'
        }
        if (orderStatus === 'cancelled') {
            pay = 'closed'
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