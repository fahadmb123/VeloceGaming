const {walletModel, walletTransactionModel } = require("../../model/walletModel")
const cartModel = require("../../model/cartModel")


const loadWallet = async (req,res) => {
    try {
        if (!req.session.user) {
            return res.redirect("/login")
        }

        
        const wallet = await walletModel.findOne({userId:req.session.user._id})
        const walletTransactions = await walletTransactionModel.find({userId:req.session.user._id}).sort({_id:-1})
        
        let cartCount = 0
        if (req.session.user){
            const cart = await cartModel.findOne({userId:req.session.user._id})
            cartCount = cart?.items.reduce((acc,curr)=>{
                acc += curr.quantity
                return acc
            },0)
        }
        return res.render("user/wallet",{
            wallet,
            walletTransactions,
            cartCount
        })
        
    } catch (err) {
        console.log(err)
    }
}




module.exports = {
    loadWallet
}