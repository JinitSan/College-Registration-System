const express = require('express');
const bodyParser = require('body-parser');
const ejs = require("ejs");
const app = express();
const mysql = require("mysql")

app.use(bodyParser.urlencoded({extended:true}));
app.set("view engine","ejs");
app.use(express.static("public"));

app.get("/",function(req,res){
    res.send("<h1>College Registration System</h1>")
})

app.get("/login",function(req,res){
    res.render("login");
});

app.post("/login",function(req,res){
    console.log(req.body)
    console.log(req.body['mis'])
    console.log(req.body['password'])
})

app.get("/register",function(req,res){
    res.render("details");
})

app.post("/register",function(req,res){
    console.log(req.body);
    res.redirect("/course_dept")
})

app.get("/course_dept",function(req,res){
    res.render("course_dept");
});

app.post("/course_dept",function(req,res){
    console.log(req.body);
})

// var con = mysql.createConnection({
//     host: "localhost",
//     user: "root",
//     password: "password",
//     database:"student_reg"
//   });
  
// con.connect(function(err){
//     if (err) throw err;
//     console.log("Connected!");
//     con.query("use student_reg", function (err, result) {
//         if (err) throw err;
//         console.log("Database used");
//     });
// });

app.listen(3000,function(){
    console.log("Server started at 3000");
})