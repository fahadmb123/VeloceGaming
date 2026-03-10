const {z} = require("zod")


const returnRequestAcceptSchema  = z.object({
    orderId : z.string().min(1),
    orderItemId : z.string().min(1),
    pickUpDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    pickUpTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/)
})

const rejectReturnRequestSchema = z.object({
    orderId : z.string().min(1),
    orderItemId : z.string().min(1)
})



module.exports = {
    returnRequestAcceptSchema,
    rejectReturnRequestSchema
}