


const loadWallet = async (req,res) => {
    try {

        return res.render("user/wallet")

    } catch (err) {
        console.log(err)
    }
}


module.exports = {
    loadWallet
}