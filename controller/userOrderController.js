const userOrderService = require("../service/userOrderService")
const orderModel = require("../model/orderModel")


const loadOrderSuccessPage = async (req,res) => {
    try {

        const orderObjectId = req.query.id
 
        const order = await orderModel.findOne({_id:orderObjectId})
        
        return res.render("user/orderSuccessPage",{
            order
        })
    } catch (err) {
        console.log(err)
    }
}




const placeOrder = async (req,res) => {
    try {

        if (!req.session.user){
            return res.json ({
                loginRequired : true
            })
        }

        const {failMessage,message,orderObjectId} = await userOrderService.placeOrder(req)

        if (failMessage) {
            return res.json({
                success : false,
                message : failMessage
            })
        }

        if (message) {
            return res.json({
                success : true,
                orderObjectId
            })
        }
    } catch (err) {
        console.log(err)
    }
}



module.exports = {
    placeOrder,
    loadOrderSuccessPage
}