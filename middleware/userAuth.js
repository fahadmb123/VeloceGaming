const userModel = require("../model/userModel")





const isLogged = async (req, res, next) => {

    if (!req.session.user) {
        return res.redirect("/login")
    }
    const user = await userModel.findOne({_id:req.session.user._id})

    if (!user) {
        req.session.user = null
        return res.redirect("/login")
    }
    
    if (user.status === false) {

        const message = "Your account has been blocked."

        req.session.user = null
        return res.redirect(`/login?message=${message}`)
    }
    next()
}





const isLoggedOut = (req, res, next) => {
    if (req.session.user) return res.redirect("/");
    res.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.set("Pragma", "no-cache");
    res.set("Expires", "0");
    next();
};








module.exports = { isLogged, isLoggedOut }
