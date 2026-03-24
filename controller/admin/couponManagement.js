const couponModel = require("../../model/couponModel")
const couponManagementService = require("../../service/admin/couponManagement")
const {couponStatusSchema} = require("../../helpers/validators")

const loadCouponManagement = async (req,res,next) => {
    try {
        let page = parseInt(req.query.page) || 1
        let limit = 10
        let skip = (page - 1) * limit

        let filter = {}

        let search = req.query.search || ""
        let inputSearch = search.trim()
        let statusFilter = req.query.filter || "all"

        if (inputSearch) {
            filter.code = { $regex: inputSearch.toUpperCase(), $options: "i" }  
        }

        if (statusFilter === "active") {
            filter.status = true
        } else if (statusFilter === "inactive") {
            filter.status = false
        }

        const coupons = await couponModel.find(filter)
        .sort({_id:-1})
        .skip(skip)
        .limit(limit)

        const totalProduct = await couponModel.countDocuments(filter)
        const totalPages = Math.ceil(totalProduct / limit)


        return res.render ("admin/couponManagement",{
            coupons,
            totalPages,
            currentPage: page,
            search:inputSearch,
            filter: statusFilter
        })
    } catch (err) {
        next(err)
    }
}





const addCoupon = async (req,res,next) => {
    try {
        if (!req.session.admin) {
            return {loginRequired : true}
        }

        const {validateMessage,failMessage,message} = await couponManagementService.addCoupon(req)

        if (validateMessage) {
            return res.json({
                validateFail : true,
                message : validateMessage
            })
        }

        if (failMessage) {
            return res.json({
                success : false,
                message : failMessage
            })
        }
        if (message) {
            return res.json({
                success : true,
                message
            })
        }
    } catch (err) {
        next(err)
    }
}

const editCoupon = async (req,res,next) => {
    try {
        if (!req.session.admin) {
            return {loginRequired : true}
        }

        const {validateMessage,failMessage,message} = await couponManagementService.editCoupon(req)

        if (validateMessage) {
            return res.json({
                validateFail : true,
                message : validateMessage
            })
        }

        if (failMessage) {
            return res.json({
                success : false,
                message : failMessage
            })
        }
        if (message) {
            return res.json({
                success : true,
                message
            })
        }
    } catch (err) {
        next(err)
    }
}

const couponStatus = async (req,res,next) => {
    try {
        
        if (!req.session.admin){
            return res.json({
                loginRequired : true
            })
        }
        const validate = couponStatusSchema.safeParse(req.query)

        if (!validate.success) {
            const message = validate.error.issues[0].message
            
            return res.json({
                success : false,
                message 
            })
        }
        const {id,status} = validate.data
        
        const isExist = await couponModel.findOne({_id:id})
        if (!isExist) {
            return res.json({
                success : false,
                message : "Coupon Doesn't Exist"
            })
        }
        //if (status === "false")
        await couponModel.updateOne(
            {_id:id},
            {
                $set : {
                    status:status
                }
            }
        )
        return res.json({
            success : true,
            message : "Updated"
        })
    } catch (err) {
        next(err)
    }
}




module.exports = {
    loadCouponManagement,
    addCoupon,
    editCoupon,
    couponStatus
}