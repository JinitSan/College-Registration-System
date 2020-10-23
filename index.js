const express = require('express');
const bodyParser = require('body-parser');
const ejs = require("ejs");
const app = express();
const mysql = require("mysql")

var personal_data = []

app.use(bodyParser.urlencoded({extended:true}));
app.set("view engine","ejs");
app.use(express.static("public"));

var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "Jin@mysql201",
    database:"student_reg"
});

var student = {}

app.get("/",function(req,res){
    res.send("<h1>College Registration System</h1>")
})

app.get("/login",function(req,res){
    res.render("login");
});

app.post("/login", function(req,res){
    console.log(res.body)
});

app.get("/register",function(req,res){
    res.render("details");
})

app.post("/register",function(req,res){
    student['MIS'] = req.body['mis'];
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

app.post("/student_info",function(req,res){
    con.query("SELECT * FROM credentials WHERE MIS = ? and password = ?", [req.body['mis'], req.body['password']]
        ,function(err, result){
            if (err) throw err;

            if(result.length != 0){
                con.query("SELECT * FROM STUDENT WHERE MIS = ?", [req.body['mis']], function(err, result){
                    if (err) throw err;
                    get_personal_details(result)
                    con.query("SELECT CITY FROM STUDENT_LOC1 WHERE ZIPCODE = ?", [result[0].zipcode], function(err, result){
                        if (err) throw err;
                        get_personal_details(result)
                        con.query("SELECT STATE FROM STUDENT_LOC2 WHERE CITY = ?", [result[0].CITY], function(err, result){
                            if (err) throw err;
                            get_personal_details(result)
                        });
                    });
                });
                con.query("SELECT DEPT_NAME FROM STUDENT_DEPT WHERE MIS = ?",[req.body['mis']], function(err, result){
                    if (err) throw err
                    get_personal_details(result)
                });

                con.query("SELECT SEMESTER, RESULT_ID FROM PERFORMANCE WHERE MIS = ?",[req.body['mis']], function(err, result){
                    if (err) throw err
                    if(result){
                        for(i = 0; i < result.length; i++){
                            con.query("SELECT CGPA, YEAR FROM MARKSHEET WHERE RESULT_ID = ?", [result[i].RESULT_ID], function(err, result){
                                get_personal_details(result)
                            });
                        }
                    }
        
                });

                con.query("SELECT TRANSACTION_ID FROM FEES WHERE MIS = ?", [req.body['mis']], function(err, result){
                    if (err) throw err
                    get_personal_details(result)
                    con.query("SELECT YEAR, AMOUNT, STATUS FROM PAYMENT_DETAILS WHERE TRANSACTION_ID = ?", [result[0].TRANSACTION_ID], function(err, result){
                        get_personal_details(result)
                    });
                });

                con.query("SELECT COURSE_ID, GRADE FROM TAKES WHERE MIS = ?", [req.body['mis']], function(err, result){
                    if (err) throw err
                    get_personal_details(result)
                    course_ids = []

                    if (result){
                        for(i = 0; i < result.length; i++){
                            //course_ids.push(result[i].COURSE_ID)
                            con.query("SELECT TITLE, COURSE_ID FROM COURSE WHERE COURSE_ID = ?", [result[i].COURSE_ID], function(err, result){
                                if (err) throw err
                                get_personal_details(result)

                                con.query("SELECT DEPT_NAME, CREDITS FROM COURSE_TITLE WHERE TITLE = ?", [result[0].TITLE], function(err, result){
                                    get_personal_details(result)
                                });
                            })
                        }
                    }
                    
                       
                });

                con.query("SELECT SEMESTER, DAYS_PRESENT, TOT_WORKING_DAYS FROM ATTENDANCE WHERE MIS = ?", [req.body['mis']],
                    function(err, result){
                        if (err) throw err
                        get_personal_details(result)
                });
            }
        });
        res.render("student_info")
})

app.get("/course_dept",function(req,res){
    res.render("course_dept");
});

app.post("/course_dept",function(req,res){
    console.log(student['MIS']);
    con.query("insert into student_dept values(?,?)",[student['MIS'],req.body['department']],function(err,result){
        if (err) throw err;
    });
    con.query("insert into marksheet values(?,?,?,?)",[req.body['semester'],req.body['result_id'],req.body['cgpa'],req.body['year']],function(err,result){
        if(err) throw err;
    });
    con.query("insert into performance values(?,?,?)",[student['MIS'],req.body['semester'],req.body['result_id']],function(err,result){
        if(err) throw err;
    })
    con.query("insert into takes values(?,?,?)",[student['MIS'],req.body['course'],req.body['grade']],function(err,result){
        if(err) throw err;
    });
    console.log("Course data entered successfully!")
    res.redirect("/attendance_transaction")
})

app.get("/attendance_transaction",function(req,res){
    res.render("attendance_transaction");
});

app.post("/attendance_transaction",function(req,res){
    console.log(student);
    con.query("insert into attendance values(?,?,?,?)",
    [student['MIS'],req.body['semester'],req.body['days_present'],105],function(err,result){
        if(err) throw err;
    });
    con.query("insert into payment_details values(?,?,?,?)",
    [req.body['transaction_id'],req.body['year'],req.body['amount'],req.body['status']],function(err,result){
        if(err) throw err;
    });
    con.query("insert into fees values(?,?)",
    [student['MIS'],req.body['transaction_id']],function(err,result){
        if(err) throw err;
    });
    console.log("Transaction and Attendance details entered successfully");
});

function get_personal_details(details){
    personal_data.push(details)
    console.log("------------------------------------------------------------------------")
    console.log(personal_data)
}

app.listen(3000,function(){
    console.log("Server started at 3000");
})