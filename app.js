
const express=require("express");
const app=express();
const mongoose=require("mongoose");
const ejsmate=require("ejs-mate");
const path=require("path");
const session=require("express-session");
const passport=require("passport");
const User=require("./modules/user");


app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.engine("ejs",ejsmate);
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname,"public")));







main().then(()=>{console.log("MongoDb connect")}).catch((err)=>{console.log(`Mongodb error:${err}`)});

async function main(){
   await mongoose.connect('mongodb://127.0.0.1:27017/mediflow');

}

const sessionOptions={
    secret:"sdfdf",
    resave: false,
    saveUninitialized: true,
}

app.use(session(sessionOptions));
app.use(passport.initialize());
app.use(passport.session());

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
    res.locals.curruser=req.user;

    next();
})



app.get("/root",(req,res)=>{
    res.send("Hi I am root");

})


app.get("/signup",(req,res)=>{
    res.render("trial/signup");
});
app.post("/signup",async(req,res)=>{
 let{username,email,password,role}=req.body;
 const newuser=new User({email,username,role});
 const register=await User.register(newuser,password);
 console.log(register);
 res.redirect("/home");

});


app.get("/login",(req,res)=>{
    res.render("trial/login");
});
app.post("/login",passport.authenticate("local",{failureRedirect:"/login"}),async(req,res)=>{
    const selectrole=req.body.role;
    const actualrole=req.user.role;
    if(selectrole==actualrole){
       res.redirect("/home");
    }else{
        req.logOut(()=>{
            console.log("role did not matched");
            res.redirect("/login");
        })
    }
      
});
app.get("/logout",(req,res)=>{
    req.logOut((err)=>{
        if(err){
            next(err);
        }else{
            res.redirect("/login");
        }
    })
})

app.get("/home",(req,res)=>{
    if(!req.isAuthenticated()){
       return res.redirect("/login");
        
    }

    res.render("trial/home");
})

app.listen(8080,()=>{
    console.log("server is listening");
})

