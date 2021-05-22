if(process.env.NODE_ENV !=="production"){
    require('dotenv').config();
}
var express=require("express");
var app=express();
var bodyParser=require("body-parser");
// const url=require("url");
const querystring = require('querystring'); 

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine","ejs")

// ***************************************************************************
var mongoose=require("mongoose"); 
// const { isBuffer } = require("util");

const dbUrl=process.env.DB_URL || "mongodb://localhost/projectdb";
mongoose.connect(dbUrl,{
    useNewUrlParser:true,
    useUnifiedTopology:true
})
.then(()=>console.log("Connected to project database"))
.catch((err)=>console.log("Couldn't connect to database:27017 ",err));

var studentSchema=new mongoose.Schema({
    name:String,
    usn:String,
    password:String,
},{
    versionKey:false
});

var adminSchema=new mongoose.Schema({
    adminid:Number,
    name:String,
    email:String,
    password:String,
},{
    versionKey:false
});

var complaintSchema=new mongoose.Schema({
    usn:String,
    name:String,
    email:String,
    adminid:Number,
    title:String,
    body:String,
    cid:String,
    date:String,
    date_ir:String,
    solution:String,
    status:String
},{
    versionKey:false
});

var categorySchema=new mongoose.Schema({
    cid:Number,
    cname:String,
},{
    versionKey:false
});

var collegeSchema=new mongoose.Schema({
    collegeid:String,
    adminid:Number,
    collegename:String,
},{
    versionKey:false
});

var students=mongoose.model("students",studentSchema);
var admins=mongoose.model("admins",adminSchema);
var complaints=mongoose.model("complaints",complaintSchema);
var category=mongoose.model("category",categorySchema);
var college=mongoose.model("college",collegeSchema);

// college.create(
//     {
//         collegeid:"rv",
//         adminid:104,
//         collegename:"R.V. College of Engineering"
//     },function(err,c){
//         if(err){
//             console.log(err);
//         }
//         else{
//             console.log("newly created college");
//             console.log(c);
//         }
//     }
// )

// students.create(
//         {
//             name:"Khyati", 
//             usn:"1by18is059",
//             password:"khyati123"
//         },function(err,c){
//             if(err){
//                 console.log(err);
//             }else{
//                 console.log("newly created student");
//                 console.log(c)
//             }
//         }
//     )

        // admins.create(
        //     {
        //         adminid:104,
        //         name:"tanu", 
        //         email:"tanu@rvce.in",
        //         password:"admin104"
        //     },function(err,c){
        //         if(err){
        //             console.log(err);
        //         }else{
        //             console.log("newly created admin");
        //             console.log(c)
        //         }
        //     }
        // )        

// *******************************************************************************


app.get("/",(req,res)=>{
    res.render("home");
})

app.post("/studentlogin",(req,res)=>{
    var name=req.body.name;
    var usn=req.body.usn;
    var password=req.body.password;
    
    students.find({},function(err,allstudents){
        if(err){
            console.log(err);
        }
        else{
            var count=0;
            // var len=allstudents.length;
            // console.log(allstudents);
            allstudents.forEach((s,n)=>{
                if(s.name.toLowerCase()===name.toLowerCase() && s.usn.toLowerCase()===usn.toLowerCase() && s.password.toLowerCase()===password.toLowerCase()){
                    console.log("matched",n);
                    count=1;
                    const query = querystring.stringify({
                        "name": name,
                        "usn": usn,
                    });
                    res.redirect('/student?' + query);
                }
            })
            if(count==0){
                console.log("no match");
                res.redirect("/");
            
            }
        }
    })
})

app.get("/student",(req,res)=>{
    complaints.find({},(err,allcomplaints)=>{
        if(err){
            console.log(err);
        }
        else{
            var stdcomplaints=[];
            var j=0;
            student={
                name:req.query.name,
                usn:req.query.usn,
            };
            for(var i=0;i<allcomplaints.length;i++){
                if(student.usn===allcomplaints[i].usn){
                    stdcomplaints[j]=allcomplaints[i];
                    j++;
                }
            }
            
            category.find({},(err,allcategory)=>{
                if(err){
                    console.log(err);
                }
                else{
                    console.log(req.query);
                    console.log(allcategory);
                    res.render("student",{name:student.name,usn:student.usn,complaints:stdcomplaints,categories:allcategory});
                    // res.render("student",{complaints:allcomplaints});
                    console.log(stdcomplaints);
                }
            })
            
        }
    })
    
})

app.get("/register",(req,res)=>{
    res.render("register");
})

app.post("/register",(req,res)=>{
    
    var name=req.body.name;
    var usn=req.body.usn;
    var pass=req.body.password;

    var newstudent={
        name:name,
        usn:usn,
        password:pass,
    }

    students.create(newstudent,(err,c)=>{
                    if(err){
                        console.log(err);
                    }else{
                        console.log("newly created student");
                        console.log(c)
                        res.redirect("/");
                    }
                }
            )

})

app.post("/adminlogin",(req,res)=>{
    var aadminid=Number(req.body.adminid);
    var name=req.body.aname;
    var password=req.body.apassword;
    var email=req.body.aemail;
    
    admins.find({},function(err,alladmins){
        if(err){
            console.log(err);
        }
        else{
            var count=0;
            // console.log(allstudents);
            alladmins.forEach((a,n)=>{
                if(a.adminid===aadminid && a.name.toLowerCase()===name.toLowerCase() && a.email.toLowerCase()===email.toLowerCase() && a.password.toLowerCase()===password.toLowerCase()){
                    console.log("matched",n);
                    count=1;
                    const query = querystring.stringify({
                        "name": name,
                        "id": aadminid,
                    });
                    res.redirect('/admin?' + query);
                }
               
            })
            if(count==0){
                console.log("no match");
                res.redirect("/");
            
            }
        }
    })
})

app.get("/admin",(req,res)=>{
    complaints.find({},(err,allcomplaints)=>{
        if(err){
            console.log(err);
        }
        else{
            
            category.find({},(err,allcategory)=>{
                if(err){
                    console.log(err);
                }
                else{
                    admin={
                        name:req.query.name,
                        adminid:req.query.id,
                    };
                    coldetails={}
                    allcomp=[]

                            college.find({},(err,allcollege)=>{
                                if(err){
                                    console.log(err);
                                }
                                else{
                                    allcollege.forEach((col,n)=>{
                                        if(col.adminid==admin.adminid)
                                            coldetails=col;
                                    })
                                    console.log(coldetails);
                                    allcomplaints.forEach((c,n)=>{
                                        console.log(c.usn)
                                        if(c.usn.slice(1,3)==coldetails.collegeid){
                                            allcomp.push(c);
                                        }
                                    })
                                    // console.log(allcomp);
                                    console.log(req.query);
                                    console.log(allcategory);
                                    res.render("admin",{name:admin.name,id:admin.adminid,complaints:allcomp,categories:allcategory,col:coldetails});
                                    // res.render("student",{complaints:allcomplaints});
                                }
                            })

                }
                
            })
            
        }
    })
    // res.render("admin.ejs")
})

app.post("/update/:name/:id",(req,res)=>{
    
    complaints.find({},(err,allcomplaints)=>{
        if(err){
            console.log(err);
        }
        else{
            college.find({},(err,allcollege)=>{
                if(err){
                    console.log(err)
                }
                else{
                    var check=req.body.choice;
                    var name=req.params.name;
                    var id=req.params.id;
                    col={};
                    allcomp=[];
                    allcollege.forEach((c)=>{
                        if(c.adminid==id)
                        col=c;
                        console.log(col)
                    })
                    allcomplaints.forEach((c,n)=>{
                        if(c.usn.slice(1,3)==col.collegeid){
                            allcomp.push(c);
                        }
                    })
                    console.log(allcomp)
                    console.log(check,name,id);
                    console.log(allcomp[check]._id);
                    var myquery = { _id: allcomp[check]._id };
                    var newvalues = { $set: {status: "checked"} };
                    complaints.updateOne(myquery, newvalues, function(err, res) {
                        if (err) throw err;
                        console.log("1 document updated");
                        // db.close();
                    });
                    // console.log(req.params);
                    const query = querystring.stringify({
                        "name": name,
                        "id": id,
                    });
                    res.redirect('/admin?' + query);
                }
            })
        }
    })
})

app.post("/complaint",(req,res)=>{
    var usn2=req.body.usn;
    var name2=req.body.name;
    var email2=req.body.email;
    var adminid=req.body.adminid;
    var title2=req.body.title;
    var body2=req.body.body;
    var cid2=req.body.cid;
    var date2=req.body.date;
    var date_ir2=req.body.date_ir;
    var solution2=req.body.solution;
    var status="unchecked";

    var newcomplaint={
        usn:usn2,
        name:name2,
        email:email2,
        adminid:adminid,
        title:title2,
        body:body2,
        cid:cid2,
        date:date2,
        date_ir:date_ir2,
        solution:solution2,
        status:status
    };

    complaints.create(newcomplaint,(err,newcomp)=>{
        if(err){
            console.log(err);
        }
        else{
            const query = querystring.stringify({
                "name": name2,
                "usn": usn2,
            });
            res.redirect('/student?' + query);
            // res.redirect("/student");
        }
    });
});

// app.get("/complaint",(req,res)=>{
//     complaints.find({},(err,allcomplaints)=>{
//         if(err){
//             console.log(err);
//         }
//         else{
            
//             student={
//                 name:req.query.name,
//                 usn:req.query.usn,
//             };
//             console.log(req.query);
//             res.render("student",{name:student.name,usn:student.usn,complaints:allcomplaints});
//             // res.render("student",{complaints:allcomplaints});
//             console.log(allcomplaints);
//         }
//     })
// });

app.get("/complaint/new/:name/:usn",(req,res)=>{
    res.render("complaint",{name:req.params.name,usn:req.params.usn})
    // console.log(req.params)
})




const port=process.env.PORT || 5000;
app.listen(port,()=>{
    console.log("Project server has started at port" +port);
})

app.use(express.static(__dirname + '/public'));

// mongodb+srv://user1:<password>@cluster0.tq42b.mongodb.net/myFirstDatabase?retryWrites=true&w=majority