const userModel = require("../model/userModel")
const bcrypt = require("bcrypt")
const {sendMail} = require("../helpers/mailer")
const salt = 10
const {OAuth2Client} = require("google-auth-library")
const axios = require("axios")
const cloudinary = require("../helpers/cloudinary.js")
const { walletModel, walletTransactionModel } = require("../model/walletModel.js")
const { loadWallet } = require("../controller/user/walletController.js")
const client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
);









const generateOtp = async () => {
    const otp = Math.floor(100000 + Math.random() * 900000)
    return otp.toString()
}


const sendOtp = async (req,email,name) => {
    try {
        const g_otp = await generateOtp()

        const html = `
            Hello ${name},<br><br>

            Thank you for registering with Veloce Gaming.<br><br>

            Your One-Time Password (OTP) is:<br><br>

            <b>${g_otp}</b><br><br>

            This OTP is valid for 2 minutes. Please do not share it with anyone.<br><br>

            Regards,<br>
            Veloce Gaming Team`;


        sendMail(email,"OTP VARIFICATION FROM VELOCE GAMING",html)

        req.session.otp = g_otp
        console.log(g_otp)
        let expiryTime = Date.now() + 2 * 60 * 1000

        req.session.otpExpiry = expiryTime
        
        return {expiryTime}
    } catch (err) {
        console.log(err)
    }
}


const signup = async (req) => {
    try {

        const {name,email,password,refferalCode} = req.body
        
        const user = await userModel.findOne({email})
        
        if (user){
            const message = "The user Already Exist...." 
            return {message}
        }

        let {expiryTime} = await sendOtp(req,email,name)

        if (refferalCode) {
            req.session.refferalCode = refferalCode.trim()
        }
        req.session.otpKey = "register"
        req.session.userEmail = email.trim()
        req.session.userName = name.trim()
        req.session.userPassword = password.trim()

        return {expiryTime}
    } catch (error) {
        console.log(error)
    }
}


const otpVarification = async (req) => {
    try {
        const{otp} = req.body


        email = req.session.userEmail
        name = req.session.userName
        password = req.session.userPassword
        refferalCode = req.session.refferalCode
        req.session.refferalCode = null
        
        

        const originalOtp = req.session.otp
        const otpExpiry = req.session.otpExpiry
        const currentTime = Date.now()
        

       if (otpExpiry < currentTime){
            const message = "OTP Expired"
            return { message };
       }


        if (originalOtp == otp && req.session.otpKey == "register"){
            const hashPassword = await bcrypt.hash(password,salt)
            const newUser = new userModel ({
                name:name,
                email:email,
                password:hashPassword,
                googleId:null
            })
            wallet = new walletModel({
                userId : newUser._id
            })
            await wallet.save()
            let refferedUser = null
            if (refferalCode) {
                refferedUser = await userModel.findOne({refferalCode})
            }
            if (refferedUser) {
                newUser.refferedBy = refferedUser._id
                await walletModel.updateOne(
                    {userId:newUser._id},
                    {
                        $inc : {"balance" : 50}
                    }
                )
                const newUserTransaction = new walletTransactionModel({
                    type : "credit",
                    userId : newUser._id,
                    amount : 50,
                    reason : "cashback"
                })
                await walletModel.updateOne(
                    {userId:refferedUser._id},
                    {
                        $inc : {"balance" : 100}
                    }
                )
                const oldUserTransaction = new walletTransactionModel({
                    type : "credit",
                    userId : refferedUser._id,
                    amount : 100,
                    reason : "cashback"
                })
                await newUserTransaction.save()
                await oldUserTransaction.save()
            }

            await newUser.save()
            const swalMessage = "Account Registered Successfully"
            return {swalMessage}
        }
        else if (originalOtp == otp && req.session.otpKey == "reset-password"){
            const resetPassword = true
            req.session.resetPassword = "resetPassword"
            return {resetPassword}
        } 
        else if (originalOtp == otp && req.session.otpKey  == "profile-update") {
            const user = req.session.user
            const newEmail = req.session.userEmail
            await userModel.updateOne(
                {email:user.email},
                {email:newEmail}
            )
            req.session.user = await userModel.findOne({email:newEmail})
            const profileUpdate = true
            const swalMessage = "Email Updated"
            return {swalMessage,profileUpdate}
        }

        const message = "OTP Is incorrect"
        return {message}
    } catch (err) {
        console.log(err)
    }
}


const userGoogle = async (req) => {
    try {
        const {code} = req.query

        const {tokens} = await client.getToken({
            code:code,
            redirect_uri : process.env.GOOGLE_REDIRECT_URI
        })

        const ticket = await client.verifyIdToken({
            idToken : tokens.id_token,
            audience : process.env.GOOGLE_CLIENT_ID
        })

        const payload = ticket.getPayload()

        const email = payload.email
        const name = payload.name
        const googleId = payload.sub

        let user = await userModel.findOne({email})

        
        if (!user) {
            user = new userModel({
                name,
                email,
                password:null,
                googleId
            })
            wallet = new walletModel({
                userId : user._id
            })
            await user.save()
            await wallet.save()
        }
        if (user.googleId === null){
            const message = "You Cannot Login through Google With Normal Acount"
            return {message}
        }
        if (user.status === false){
            const message = "The Account Is Blocked"
            return {message}
        }
        req.session.user = user
        const swalMessage = "You Logged Successfully"
        return {swalMessage}
    } catch (err) {
        console.log(err)
    }
}


const login = async (req) => {
    try {

        const {email,password} = req.body;

        const user = await userModel.findOne({email})

        let message

        if (!user){
            message = "The User Doesn't Exist"
            return {message}
        }
        else if (user.googleId){
            message = "The Email Is A Google Acount You Can Login With Google"
            return {message}
        }
        if (user.status === false){
            message = "The Acount Is Blocked"
            return {message}
        }
        

        const isMatch = await bcrypt.compare(password,user.password)

        if (!isMatch){
            message = "Password Is Not Matching"
            return {message}
        }
        
        const swalMessage = "You Logged Successfully"
        req.session.user = user

        return {swalMessage}


    } catch (err) {
        console.log(err)
    }
}


const emailEntry = async (req) => {
    try {

        const {email}  = req.body

        const user  = await userModel.findOne({email})
        let message

        if (!user){
            message = "Invalid Email Address"
            return {message}
        }

        if (user.googleId){
            message = "The Email Is Of Google You Cannot Change Password"
            return {message}
        }
        req.session.otpKey = "reset-password"
        req.session.userEmail = email

        let {expiryTime} = await sendOtp(req,email,user.name)
        return {expiryTime}

    } catch (err) {
        console.log(err)
    }
}


const resetPassword = async (req) => {
    try {
        const {newPassword} = req.body

        if (req.session.resetPassword == "resetPassword"){
            return {resetPassword:true}
        }
        email = req.session.userEmail

        const user = await userModel.findOne({email})

        const hashPassword = await bcrypt.hash(newPassword,salt)
        
        await userModel.updateOne(
            {_id:user._id},
            {password:hashPassword}
        )

        let swalMessage = "Password Changed Successfully"
        return {swalMessage}

    } catch (err) {
        console.log(err)
    }
}


const profile = async (req) => {
    try {
        let swalMessage

        let isUpdate = false
        const {name,email,currentPassword,newPassword} = req.body

        let user = req.session.user
        let inputName = name.trim()
        let inputCurrentPassword = currentPassword.trim()
        let inputNewPassword = newPassword.trim()

        if (inputName && inputName !== user.name) {
            await userModel.updateOne(
                {_id:user._id},
                {name:inputName}
            )
            isUpdate = true
        }

        user = await userModel.findOne({_id:user._id})
        req.session.user = user

        if (inputCurrentPassword) {
            if (user.googleId){
                swalMessage = "You Cannot Change The Password Of The Google Account"
                return {swalMessage}
            }

            const isMatch = await bcrypt.compare(inputCurrentPassword,user.password)

            if (!isMatch) {
                swalMessage = "Invalid Current Password"
                return {swalMessage}
            }
            const hashPassword = await bcrypt.hash(inputNewPassword,salt)
            await userModel.updateOne(
                {_id:user._id},
                {password:hashPassword}
            )
            isUpdate = true
        }

        user = await userModel.findOne({_id:user._id})
        req.session.user = user

        if (email && email != user.email) {
            const emailExist = await userModel.findOne({email})

            if (user.googleId){
                swalMessage = "You Cannot Change The Email Of The Google Account "
                return {swalMessage}
            }
            if (emailExist){
                swalMessage = "The User Is Already Exist"
                return {swalMessage}
            }

            let {expiryTime} = await sendOtp(req,email,user.name)
            req.session.otpKey = "profile-update"
            //req.session.newEmail = email
            req.session.userEmail = email
            return {expiryTime}
        }


        user = await userModel.findOne({_id:user._id})
        req.session.user = user

        if (!isUpdate) {
            swalMessage = "No Changes"
            return {swalMessage}
        }
        swalMessage = "Updated"
        return {swalMessage}
    } catch (err) {
        console.log(err)
    }
}


const addAddress = async (req) => {
    try {

        const {
            name,
            phone,
            pincode,
            address,
            state,
            city,
            type
        } = req.body

        const response = await axios.get(`https://api.postalpincode.in/pincode/${pincode}`)

        if ((response.data[0].Status !== "Success")){
            const message = "Invalid Pincode"
            return {message}
        }

        const postOffice = response.data[0].PostOffice

        const isMatch = postOffice.some((obj) => {
            return obj.State.toLowerCase() === state.toLowerCase() && obj.District.toLowerCase() === city.toLowerCase()
        })

        if (!isMatch) {
            const message = "The Post Code Is Not Match With City And State"
            return {message}
        }

        await userModel.updateOne(
            {_id:req.session.user._id},
            {$push : {
                address : {
                    fullName : name,
                    phone ,
                    pincode,
                    address,
                    state,
                    city,
                    type
                }
            }}
        )
        
        req.session.user = await userModel.findOne({_id:req.session.user._id})
        const swalMessage = "Address Added"
        return {swalMessage}
    } catch (err) {
        console.log(err)
    }
}


const deleteAddress = async (req) => {
    try {

        const {id} = req.query

        await userModel.updateOne(
            {_id:req.session.user._id},
            {$pull:{
                address: {_id:id}
            }}
        )

        req.session.user = await userModel.findOne({_id:req.session.user._id})

        const swalMessage = "Address Removed Successfully"
        return {swalMessage}

    } catch (err) {
        console.log(err)
    }
}


const editAddress = async (req) => {
    try {
        const addressId = req.query.id

        let isUpdated = true

        const {name,phone,pincode,address,state,city,type} = req.body

        const response = await axios.get(`https://api.postalpincode.in/pincode/${pincode}`)

        if ((response.data[0].Status !== "Success")){
            const message = "Invalid Pincode"
            return {message}
        }


        const postOffice = response.data[0].PostOffice

        const isMatch = postOffice.some((obj) => {
            return obj.State.toLowerCase() === state.toLowerCase() && obj.District.toLowerCase() === city.toLowerCase()
        })



        if (!isMatch) {
            const message = "The Post Code Is Not Match With City And State"
            return {message}
        }



        const user = await userModel.findOne({_id:req.session.user._id})

        const currentAddress = user.address.find((obj) => {
            return obj._id.toString() === addressId;
        })

        if (name == currentAddress.fullName && phone == currentAddress.phone && pincode == currentAddress.pincode && address == currentAddress.address && state == currentAddress.state && city == currentAddress.city && type == currentAddress.type) {
            isUpdated = false
        }



        await userModel.updateOne(
            {_id:req.session.user._id,"address._id":addressId},
            {$set :{
                "address.$.fullName" : name,
                "address.$.phone" : phone,
                "address.$.pincode" : pincode,
                "address.$.address" : address,
                "address.$.state" : state,
                "address.$.city" : city,
                "address.$.type" : type
            }}
        )
       


        req.session.user = await userModel.findOne({_id:req.session.user._id})

        let swalMessage

        if (isUpdated){
            swalMessage = "Updated"
        }else {
            swalMessage = "No Changes"
        }

        return {swalMessage}

    } catch (err) {
        console.log(err)
    }
}


const uploadProfile = async (req) => {
    try {
        const result = await cloudinary.uploader.upload(req.file.path,{folder:"profile_image"})
        
        await userModel.updateOne(
            {_id:req.session.user._id},
            {
                profileImage : result.secure_url,
                profileImageId : result.public_id
            }
        )
        
        req.session.user = await userModel.findOne({_id:req.session.user._id})

        return {result}

    } catch (err) {
        console.log(err)
    }
}


const removeProfile = async (req) => {
    try {
        const user = await userModel.findOne({_id:req.session.user._id})

        await cloudinary.uploader.destroy(user.profileImageId)

        await userModel.updateOne (
            {_id:req.session.user._id},
            {
                profileImage : null,
                profileImageId : null
            }
        )

        req.session.user = await userModel.findOne({_id:req.session.user._id})

        return 
    } catch (err) {
        console.log(err)
    }
}









module.exports = {
    signup,
    sendOtp,
    otpVarification,
    userGoogle,
    login,
    emailEntry,
    resetPassword,
    profile,
    addAddress,
    deleteAddress,
    editAddress,
    uploadProfile,
    removeProfile
}