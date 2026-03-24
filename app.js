const express = require("express")
const app = express()
const dotenv = require("dotenv").config()
const session = require("express-session")
const flash = require("connect-flash")
const PORT = process.env.PORT || 8000
const dbConnect = require("./database/dbConnect")
const userRouter = require("./routes/user.js")
const adminRouter = require("./routes/admin.js")
const path = require("path")
const expressLayouts = require("express-ejs-layouts");
const { url } = require("inspector")
const noCache = require("nocache")
const {errorHandler} = require('./middleware/errorHandler.js')
require("./cron/cleanupJob.js")




const dns = require("dns")
console.log(dns.getServers());
dns.setServers(["8.8.8.8", "8.8.4.4"]);








app.use(express.urlencoded({extended:true}))
app.use(express.json())




app.use(session({
    secret: process.env.SESSION_SECRET,
    resave:false,
    saveUninitialized:false,
    cookie : {maxAge:1000*60*60*24}
}))
app.use(flash())

app.use((req, res, next) => {
    res.locals.success_msg = req.flash("success");
    res.locals.error_msg = req.flash("error");
    next();
});

app.use((req,res,next) => {
    res.locals.user = req.session.user || null
    next()
})
app.use(noCache())





app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"))
app.use(express.static("public"))
app.use(expressLayouts);




app.use("/",userRouter)
app.use("/admin",adminRouter)


app.use((req,res)=>{
    res.status(404).render("404")
})

app.use(errorHandler)

dbConnect()




app.listen(PORT,()=>{
    console.log(`port running on ${PORT}`)
    console.log(`http://localhost:${PORT}`)
})