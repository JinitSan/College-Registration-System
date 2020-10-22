const express = require('express');
const bodyParser = require('body-parser');
const ejs = require("ejs");
const app = express();
const mysql = require("mysql")

app.use(bodyParser.urlencoded({extended:true}));
app.set("view engine","ejs");
app.use(express.static("public"));

var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "password",
    database:"student_reg"
});

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
    con.query("SELECT * FROM student_loc2 WHERE city = ?",[req.body['city']],function (err, result){
        if (err) throw err;
        if(result.length==0){
            con.query("insert into student_loc2 values(?,?)",[req.body['city'],req.body['state']],function(err,result){
                if (err) throw err;
            });
            con.query("insert into student_loc1 values(?,?)",[req.body['zipcode'],req.body['city']],function(err,result){
                if (err) throw err;
            }); 
        }
        con.query("insert into student values(?,?,?,?,?)",
            [req.body['mis'],req.body['fname'],req.body['lname'],parseInt(req.body['zipcode']),req.body['phone']],
            function(err,result){
                if (err) throw err;
                console.log(result);
            });
        });
    res.redirect("/course_dept")
});

app.get("/course_dept",function(req,res){
    res.render("course_dept");
});

app.post("/course_dept",function(req,res){
    console.log(req.body);
})

app.listen(3000,function(){
    console.log("Server started at 3000");
})