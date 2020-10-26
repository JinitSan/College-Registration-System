const express = require('express');
const bodyParser = require('body-parser');
const ejs = require("ejs");
const app = express();
const mysql = require("mysql")

var personal_data = []
var size

app.use(bodyParser.urlencoded({extended:true}));
app.set("view engine","ejs");
app.use(express.static("public"));

var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "password",
    database:"student_reg"
});

var student = {}

// app.get("/",function(req,res){
//     res.send("<h1>College Registration System</h1>")
// });

app.get("/",function(req,res){
    res.render("login");
});

app.post("/", function(req,res){
    console.log(res.body)
});

app.get("/register",function(req,res){
    res.render("details");
});


app.get("/student_info", function(req, res){
    res.render("student_info", {
        MIS: '', 
        fname: '',
        lname: '',
        zipcode: '',
        phone: '',
        city: '',
        state: '',
        transaction_id: result7[0].TRANSACTION_ID,
        fees_year: '',
        fees_amount: '',
        fees_status: '',
        attendance_semester: '',
        attendance_days_present: '',
        attendance_tot_days: '',
        acad_grades: grades,
        acad_title: '',
        acad_credits: '',
        acad_course_id: '',
        dept_name: '',
        acad_cgpa: '',
        acad_result_id: ''
    });
});
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
        con.query("insert into credentials values(?,?)",
            [req.body['mis'],req.body['password']],
            function(err,result){
                if (err) throw err;
        });
    });
    res.redirect("/course_dept")
});

app.post("/student_info",function(req,res){
    con.query("SELECT * FROM credentials WHERE MIS = ? and password = ?", [req.body['mis'], req.body['password']]
        ,function(err, result){
            if (err) throw err;

            if(result.length != 0){
                var credits = []
                var course_id = []
                var course_title = []
                var grades = []
                var cgpa = []
                var result_id = []
                con.query("SELECT * FROM STUDENT WHERE MIS = ?", [req.body['mis']], function(err, result){
                    if (err) throw err;

                    get_personal_details(result)
                    con.query("SELECT CITY FROM STUDENT_LOC1 WHERE ZIPCODE = ?", [result[0].zipcode], function(err, result2){
                        if (err) throw err;

                        get_personal_details(result2)
                        con.query("SELECT STATE FROM STUDENT_LOC2 WHERE CITY = ?", [result2[0].CITY], function(err, result3){
                            if (err) throw err;
                            get_personal_details(result3)
                            con.query("SELECT DEPT_NAME FROM STUDENT_DEPT WHERE MIS = ?",[req.body['mis']], function(err, result4){
                                if (err) throw err
                                get_personal_details(result4)
                                con.query("SELECT SEMESTER, RESULT_ID FROM PERFORMANCE WHERE MIS = ?",[req.body['mis']], function(err, result5){
                                    if (err) throw err
                                    if(result5){
                                        for(i = 0; i < result5.length; i++){
                                            result_id.push(result5[i].RESULT_ID)

                                            con.query("SELECT CGPA, YEAR FROM MARKSHEET WHERE RESULT_ID = ?", [result5[i].RESULT_ID], function(err, result6){
                                                get_personal_details(result6)
                                                cgpa.push(result6[0].CGPA)

                                            });
                                        }
                                    }
                                    con.query("SELECT TRANSACTION_ID FROM FEES WHERE MIS = ?", [req.body['mis']], function(err, result7){
                                        if (err) throw err
                                        get_personal_details(result7)
                                        con.query("SELECT YEAR, AMOUNT, STATUS FROM PAYMENT_DETAILS WHERE TRANSACTION_ID = ?", [result7[0].TRANSACTION_ID], function(err, result8){
                                            get_personal_details(result8)
                                            con.query("SELECT SEMESTER, DAYS_PRESENT, TOT_WORKING_DAYS FROM ATTENDANCE WHERE MIS = ?", [req.body['mis']],
                                            function(err, result9){
                                                if (err) throw err
                                                get_personal_details(result9)
                                                con.query("SELECT COURSE_ID, GRADE FROM TAKES WHERE MIS = ?", [req.body['mis']], function(err, result10){
                                                    if (err) throw err
                                                    get_personal_details(result10)
                                                    
                                                    if (result10){
                                                        for(size = 0; size < result10.length; size++){
                                                            
                                                            grades.push(result10[size].GRADE);
                                                            course_id.push(result10[size].COURSE_ID)

                                                            con.query("SELECT TITLE, COURSE_ID FROM COURSE WHERE COURSE_ID = ?", [result10[size].COURSE_ID], function(err, result11){
                                                                if (err) throw err
                                                                get_personal_details(result11)
                                                                
                                                                course_title.push(result11[0].TITLE);

                                                                con.query("SELECT DEPT_NAME, CREDITS FROM COURSE_TITLE WHERE TITLE = ?", [result11[0].TITLE], function(err, result12){
                                                                    get_personal_details(result12)
                                                                    credits.push(result12[0].CREDITS)
                                                                    // console.log(size)
                                                                    // console.log(result10.length)

                                                                    if (size == result10.length){
                                                                        res.render("student_info", {
                                                                            MIS: result[0].MIS, 
                                                                            fname: result[0].fname,
                                                                            lname: result[0].lname,
                                                                            zipcode: result[0].zipcode,
                                                                            phone: result[0].phone,
                                                                            city: result2[0].CITY,
                                                                            state: result3[0].STATE,
                                                                            transaction_id: result7[0].TRANSACTION_ID,
                                                                            fees_year: result8[0].YEAR,
                                                                            fees_amount: result8[0].AMOUNT,
                                                                            fees_status: result8[0].STATUS,
                                                                            attendance_semester: result9[0].SEMESTER,
                                                                            attendance_days_present: result9[0].DAYS_PRESENT,
                                                                            attendance_tot_days: result9[0].TOT_WORKING_DAYS,
                                                                            acad_grades: grades,
                                                                            acad_title: course_title,
                                                                            acad_credits: credits,
                                                                            acad_course_id: course_id,
                                                                            dept_name: result4[0].DEPT_NAME,
                                                                            acad_cgpa: cgpa,
                                                                            acad_result_id: result_id
                                                                        });
                                                                    }
                                                                });
                                                               
                                                            });
                                                        }
                                                        
                                                    }
                                                    
                                                });
                                            });
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
                
            }
        });
        
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
    res.redirect("student_info")
});

function get_personal_details(details){
    personal_data.push(details)
    // console.log("------------------------------------------------------------------------")
    // console.log(personal_data)
}

app.listen(3000,function(){
    console.log("Server started at 3000");
})