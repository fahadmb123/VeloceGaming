const express = require("express")
const router = express.Router()
const userController = require("../controller/userController")
const {isLogged,isLoggedOut} = require("../middleware/userAuth")
const upload = require("../middleware/multer")






router.get("/google/callback",isLoggedOut,userController.userGoogle)

router.get("/google",isLoggedOut,userController.redirectGoogle)

router.get("/resendOtp",userController.resendOtp)

router.get("/emailEntry",isLoggedOut,userController.loadEmailEntry)

router.get("/otp",userController.loadOtp)

router.get("/resetPassword",isLoggedOut,userController.loadResetPassword)

router.get("/login",isLoggedOut,userController.loadLogin)

router.get("/signup",isLoggedOut,userController.loadSignup)

router.get("/",userController.loadHome )

router.get("/profile",isLogged,userController.loadProfile)

router.get("/address",isLogged,userController.loadAddress)

router.get("/addAddress",isLogged,userController.loadAddAddress)

router.get("/address/delete",isLogged,userController.deleteAddress)

router.get("/editAddress",isLogged,userController.loadEditAddress)

router.get("/logout",isLogged,userController.logout)






router.post("/signup",userController.signup)

router.post("/otp",userController.otpVarification)

router.post("/login",userController.login)

router.post("/emailEntry",userController.emailEntry)

router.post("/resetPassword",userController.resetPassword)

router.post("/profile",userController.profile)

router.post("/addAddress",userController.addAddress)

router.post("/editAddress",userController.editAddress)

router.post("/profile-upload",upload.single("profileImage"),userController.uploadProfile)

router.post("/profile-remove",userController.removeProfile)





module.exports = router