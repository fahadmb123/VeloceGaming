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


const couponSchema = z.object({
    
    couponCode: z.string()
        .min(5, { message: "Coupon must be at least 5 characters" })
        .max(15, { message: "Coupon cannot exceed 15 characters" })
        .regex(/^[A-Za-z0-9]+$/, { message: "Coupon must contain only letters and numbers" })
        .transform((val) => val.toUpperCase()),

    discountType: z.enum(["percentage", "flat"], {
        message: "Discount type must be percentage or fixed"
    }),

    discountValue: z.coerce.number()
        .positive({ message: "Discount value must be greater than 0" }),

    minPurchase: z.coerce.number()
        .nonnegative({ message: "Minimum purchase must be 0 or more" }),

    
    maxDiscount: z.preprocess(
        (val) => val === "" ? undefined : val,
        z.coerce.number()
        .nonnegative({ message: "Max discount must be 0 or more" })
        .optional()
    ),

    expDate: z.string()
        .refine((date) => new Date(date) > new Date(), {
            message: "Expiry date must be in the future"
        }),

    maxUsage: z.coerce.number()
        .int({ message: "Max usage must be an integer" })
        .positive({ message: "Max usage must be greater than 0" })
})

const couponStatusSchema = z.object({
    id : z.string().min(1,{message : "ID Is Not Valid"}),
    //status: z.coerce.boolean({message : "Invalid Status"})
    status : z.string().min(1,{message : "Invalid Status"}),
})


module.exports = {
    returnRequestAcceptSchema,
    rejectReturnRequestSchema,
    couponSchema,
    couponStatusSchema
}