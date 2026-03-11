const express = require("express")
const router = express.Router()
const userController = require("../controller/user/userController")
const userProductController = require("../controller/user/userProductController")
const userCheckoutController = require("../controller/user/userCheckoutController")
const userOrderController = require("../controller/user/userOrderController")
const {isLogged,isLoggedOut} = require("../middleware/userAuth")
const {uploadSingle} = require("../middleware/multer")






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

router.get("/wishlist",isLogged,userProductController.loadWishlist)

router.get("/cart",isLogged,userProductController.loadCart)

router.get("/checkout",isLogged,userCheckoutController.loadCheckout)

router.get("/orderSuccessPage",isLogged,userOrderController.loadOrderSuccessPage)



router.get("/downloadInvoice",isLogged,userOrderController.downloadInvoice)



router.get("/shop",userProductController.loadShop)

router.get("/product/:id",userProductController.loadProduct)




router.get("/orderDetails",isLogged,userOrderController.loadOrderDetails)

router.get("/orderHistory",isLogged,userOrderController.loadOrderHistory)




router.post("/wishlist/remove/:id",isLogged,userProductController.wishlistRemove)

router.post("/cart/remove/:id",isLogged,userProductController.cartRemove)


router.post("/signup",userController.signup)

router.post("/otp",userController.otpVarification)

router.post("/login",userController.login)

router.post("/emailEntry",userController.emailEntry)

router.post("/resetPassword",userController.resetPassword)

router.post("/profile",userController.profile)

router.post("/addAddress",userController.addAddress)

router.post("/editAddress",userController.editAddress)

router.post("/profile-upload",uploadSingle("profileImage"),userController.uploadProfile)

router.post("/profile-remove",userController.removeProfile)

router.post("/wishlist/toggle",userProductController.wishlistToggle)

router.post("/cart/add",userProductController.addToCart)

router.post("/cart/inc",userProductController.cartInc)

router.post("/cart/dec",userProductController.cartDec)

router.post("/wishlist/allToCart",userProductController.allToCart)

router.post("/placeOrder",userOrderController.placeOrder)



router.post("/orderDetails/cancel",userOrderController.cancelOrder)
router.post("/orderDetails/return",userOrderController.returnOrder)


module.exports = router