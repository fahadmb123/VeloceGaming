const nodemailer = require("nodemailer")


const transporter = nodemailer.createTransport({
    host:process.env.SMTP_HOST,
    port:process.env.SMTP_PORT,
    secure:false,
    requireTLS: true,
    auth:{
        user:process.env.SMTP_MAIL,
        pass:process.env.SMTP_PASSWORD
    }
})

const sendMail = async (email,subject,html) => {
    try {

        const mail = {
            from:process.env.SMTP_MAIL,
            to:email,
            subject:subject,
            html:html
        }

        transporter.sendMail(mail,(err,info)=>{
            if (err) {
                console.log(err)
            }
            //console.log("message Send: "+info.messageId)
        })

    } catch (err) {
        console.log(err)
    }
}




module.exports = {sendMail}