const {walletModel, walletTransactionModel } = require("../../model/walletModel")



const loadWallet = async (req,res) => {
    try {
        if (!req.session.user) {
            return res.redirect("/login")
        }

        
        const wallet = await walletModel.findOne({userId:req.session.user._id})
        const walletTransactions = await walletTransactionModel.find({userId:req.session.user._id}).sort({_id:-1})
        
        
        return res.render("user/wallet",{
            wallet,
            walletTransactions
        })

    } catch (err) {
        console.log(err)
    }
}




module.exports = {
    loadWallet
}