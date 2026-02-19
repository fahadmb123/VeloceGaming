function isLogged(req,res,next) {
    try {

        if (!req.session.admin){
            return res.redirect("/admin/login")
        }
        next()
    } catch (err) {
        console.log(err)
    }
}


const isLoggedOut = (req, res, next) => {
    if (req.session.admin) return res.redirect("/admin/userManagement");
    res.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.set("Pragma", "no-cache");
    res.set("Expires", "0");
    next();
};






module.exports = {isLogged,isLoggedOut}