const userModel = require("../../model/userModel.js")
const userService = require("../../service/userService.js")
const cloudinary = require("../../helpers/cloudinary.js")
const categoryModel = require("../../model/categoryModel.js")
const { variantModel, productModel } = require("../../model/productModel.js")
const wishlistModel = require("../../model/wishlistModel.js")
const cartModel = require("../../model/cartModel.js")



const loadEmailEntry = async (req,res) => {
    try {

        res.render("user/emailEntry")

    } catch (error){
        console.log(error)
    }
}


const loadOtp = async (req,res) => {
    try {

        //global.CexpiryTime = Date.now() + 2 * 60 * 1000
        //CexpiryTime = req.session.CexpiryTime
        //global.CexpiryTime = Date.now() + 2 * 60 * 1000
        let from = req.session.from
        return res.render("user/otp",{expiryTime:CexpiryTime})

    } catch (error) {
        console.log(error)
    }
}


const loadResetPassword = async (req,res) => {
    try {

        let resetPassword = req.session.resetPassword
        req.session.resetPassword = null
        if (!resetPassword) {
            return res.redirect("/login")
        }
        res.render("user/resetPassword")

    } catch (error){
        console.log(error)
    }
}


const loadLogin = async (req,res) => {  
    try {

        let swalMessage = req.session.swalMessage
        req.session.swalMessage = null
        let {message} = req.query
        req.session.message = null
        res.render("user/login",{swalMessage,message})

    } catch (error) {
        console.log(error)
    }
}


const loadSignup = async (req,res) => {
    try {
        res.render("user/signup")

    } catch (error) {
        console.log(error)
    }
}


const loadHome = async (req,res) => {
    try {
        //const {swalMessage} = req.query
        const swalMessage = req.session.swalMessage
        req.session.swalMessage = null

        let wishlistVariantIds = [];
        
        if (req.session.user) {
            const wishlistItems = await wishlistModel.find({
                userId: req.session.user._id
            });
            wishlistVariantIds = wishlistItems.map(item =>
                item.variantId.toString()
            );
        }

        const categories = await categoryModel.find()

        let products = await productModel.find({homepage:true})

        let productIds = products.map(p => p._id)

        const variants = await variantModel.find({productId:{$in:productIds}}).populate({path:"productId",populate:{path:"categoryId"}}).sort({updatedAt:-1}).limit(8)

        let cartCount = 0
        if (req.session.user){
            const cart = await cartModel.findOne({userId:req.session.user._id})
            cartCount = cart?.items.length
        }
        res.render("user/home",{
            swalMessage,
            categories,
            variants,
            wishlistVariantIds,
            cartCount
        })
    } catch (error) {
        console.log(error)
    }
}


const loadProfile = async (req,res) => {
    try {
        const swalMessage = req.session.swalMessage
        req.session.swalMessage = null
        let cartCount = 0
        if (req.session.user){
            const cart = await cartModel.findOne({userId:req.session.user._id})
            cartCount = cart?.items.length
        }
        res.render("user/profile",{swalMessage,cartCount})
    } catch (err) {
        console.log(err)
    }
}


const loadAddress = async (req,res) => {
    try {
        const swalMessage = req.session.swalMessage
        req.session.swalMessage = null


        res.render("user/address",{swalMessage});
    } catch (err) {
        console.log(err)
    }
}


const loadAddAddress = async (req,res) => {
    try {
        req.session.from = req.query.from
        const message = req.session.message
        req.session.swalMessage = null
        req.session.message = null
        let variantId = req.query.variantId
        if (variantId) {
            req.session.variantId = variantId
        } else {
            req.session.variantId = null
        }
        res.render("user/addAddress",{message})
    } catch (err) {
        console.log(err)
    }
}


const loadEditAddress = async (req,res) => {
    try {

        const {id} = req.query
        req.session.from = req.query.from
        let variantId = req.query.variantId
        if (variantId) {
            req.session.variantId = variantId
        } else {
            req.session.variantId = null
        }
        const user = await userModel.findOne({_id:req.session.user._id})

        const address = user.address.id(id)

        //const swalMessage = req.session.swalMessage
        //req.session.swalMessage = null
        const message = req.session.message
        req.session.message = null

        return res.render("user/editAddress",{address,message})
    } catch (err) {
        console.log(err)
    }
}









const redirectGoogle = async (req,res) => {
    try {
        const redirectUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${process.env.GOOGLE_REDIRECT_URI}&response_type=code&scope=profile email`

        //const redirectUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=http://localhost:4000/user/google/callback&response_type=code&scope=profile email`
        res.redirect(redirectUrl)

    } catch (err) {
        console.log(err)
    }
}


const userGoogle = async (req,res) => {
    try {
        const {swalMessage,message} = await userService.userGoogle(req)

        if (message) {
            return res.render("user/login",{message})
        }
        req.session.swalMessage = swalMessage
        //return res.redirect(`/?swalMessage=${swalMessage}`)
        return res.redirect("/")
    } catch (err) {
        console.log(err)
    }
}


const signup = async (req,res) => {
    try {
        const {message,expiryTime} = await userService.signup(req)

        if (message) {
            return res.render("user/signup",{message})
        }else {
            req.session.from = "signup"
            global.CexpiryTime = expiryTime
            return res.redirect("/otp")
        }

    } catch (error) {
        console.log(error)
    }
}


const resendOtp = async (req,res) => {
    try {
        const email = req.session.userEmail
        const name = req.session.userName
        let {expiryTime} = await userService.sendOtp(req,email,name)
        //globel.CexpiryTime = Date.now() + 2 * 60 * 1000
        global.CexpiryTime = expiryTime
        
        //req.session.CexpiryTime = CexpiryTime
        return res.redirect("/otp")
    } catch (err) {
        console.log(err)
    }
}


const otpVarification = async (req,res) => {
    try {
        const {swalMessage,message,resetPassword,profileUpdate} = await userService.otpVarification(req)

        
        if (message){
            return res.render("user/otp",{message,expiryTime:CexpiryTime})
        }
        if (resetPassword) {
            return res.redirect("/resetPassword")
        }
        if (profileUpdate) {
            req.session.swalMessage = swalMessage
            return res.redirect("/profile")
        }
        req.session.swalMessage = swalMessage
        return res.redirect("/login")
    } catch (err) {
        console.log(err)
    }
}

const checkRefferal = async (req,res) => {
    try {
        
        let {refferalCode} = req.body

        let isExist = await userModel.findOne({refferalCode})
        if (isExist) {
            return res.json({
                success : true
            })
        }else {
            return res.json({
                success : false,
                message : "The Refferal Code Not Matching"
            })
        }
    } catch (err) {
        console.log(err)
    }
}

const login = async (req,res) => {
    try {
        const {swalMessage,message} = await userService.login(req)


        if (swalMessage){
            return res.redirect(`/?swalMessage=${swalMessage}`)
        }
        if (message){
            return res.render("user/login",{message})
        }
    } catch (err) {
        console.log(err)
    }
}


const emailEntry = async (req,res) => {
    try {

        const {message,expiryTime} = await userService.emailEntry(req)

        if (message){
            return res.render("user/emailEntry",{message})
        }
        req.session.from = "login"
        global.CexpiryTime = expiryTime
        res.redirect("/otp")
    } catch (err) {
        console.log(err)
    }
}


const resetPassword = async (req,res) => {
    try {

        let {swalMessage} = await userService.resetPassword(req)
        req.session.swalMessage = swalMessage
        res.redirect("/login")

    } catch (err) {
        console.log(err)
    }
}


const profile = async (req,res) => {
    try {

        const {expiryTime,swalMessage} = await userService.profile(req)
        
        if (swalMessage) {
            req.session.swalMessage = swalMessage
            return res.redirect("/profile")
        }
        global.CexpiryTime = expiryTime
        req.session.from = "profile"
        return res.redirect("/otp")

    } catch (err) {
        console.log(err)
    }
}


const addAddress = async (req,res) => {
    try {
        const {swalMessage,message} = await userService.addAddress(req)
        req.session.swalMessage = swalMessage
        req.session.message = message
        const from = req.session.from
        req.session.from = null
        let variantId = req.session.variantId
        req.session.variantId = null
        if (swalMessage) {
            if (from === "address"){
                return res.redirect("/address")
            }
            if (from === "checkout") {
                if (variantId){
                    return res.redirect(`/checkout?variantId=${variantId}&quantity=1`)
                } else {
                    return res.redirect("/checkout")
                }
            }
        }else {
            res.redirect("/addAddress")
        }
    } catch (err) {
        console.log(err)
    }
}


const deleteAddress = async (req,res) => {
    try {

        const {swalMessage} = await userService.deleteAddress(req)
        req.session.swalMessage = swalMessage
        res.redirect("/address")
    } catch (err) {
        console.log(err)
    }
}


const editAddress = async (req,res) => {
    try {
        const id = req.query.id
        
        const {swalMessage,message} = await userService.editAddress(req)
        req.session.swalMessage = swalMessage
        req.session.message = message
        const from = req.session.from
        req.session.from = null
        let variantId = req.session.variantId
        req.session.variantId = null
        //res.redirect(`/editAddress?id=${id}`)
        if (swalMessage) {
            if (from === "address"){
                return res.redirect("/address")
            }
            if (from === "checkout") {
                
                if (variantId){
                    return res.redirect(`/checkout?variantId=${variantId}&quantity=1`)
                } else {
                    return res.redirect("/checkout")
                }
               
            }
        }else {
            return res.redirect(`/editAddress?id=${id}`)
        }
    } catch (err) {
        console.log(err)
    }
}


const uploadProfile = async (req,res) => {
    try {
        const {result} = await userService.uploadProfile(req)

        res.json({
            success : true,
            imageUrl : result.secure_url
        })

    } catch (err) {
        console.log(err)
        res.status(500).json({
            success:false,
            message:"Server Error"
        })
    }
}


const removeProfile = async (req,res) => {
    try {
        await userService.removeProfile(req)

        res.json({
            success : true,
            message: "Profile Removed"
        })
    } catch (err) {
        console.log(err)
    }
}










const logout = (req, res) => {  
    try {
        req.session.user = null
        return res.redirect("/");
    } catch (err){
        console.log(err)
    }
    
    
}



module.exports = {
    loadLogin,
    loadSignup,
    loadEmailEntry,
    loadHome,
    signup,
    loadOtp,
    loadResetPassword,
    resendOtp,
    otpVarification,
    redirectGoogle,
    userGoogle,
    login,
    emailEntry,
    resetPassword,
    loadProfile,
    profile,
    loadAddress,
    loadAddAddress,
    addAddress,
    deleteAddress,
    loadEditAddress,
    editAddress,
    logout,
    uploadProfile,
    removeProfile,
    checkRefferal
}