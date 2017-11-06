"use strict";
var express = require('express');
var handlebars = require('express-handlebars');
const session = require("express-session");
var bodyParser = require('body-parser');
const flash = require('express-flash');
var app = express();
var http = require('http');
var io = require('socket.io')(http);
var waitersList = [];
var waiterShift = require('./models');
app.use(express.static(__dirname + '/public'));
app.engine('handlebars', handlebars({
  extname: 'handlebars',
  defaultLayout: 'main'
}));
app.set('view engine', 'handlebars');


app.use(session({
  secret: 'keyboard cat',
  cookie: {
    maxAge: 60000 * 30
  }
}));
app.use(session({
  secret: 'nzulu',
  resave: false,
  saveUninitialized: true
}))
app.use(flash());
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({
  extended: false
}));
// parse application/json
// app.use(bodyParser.json())


app.get("/waiter/:username", getuser, function(req, res, next) {
  var username = req.params.username;
  // console.log("{{{{{{{{{{{{{{{}" +username);

  waiterShift.saveData.findOne({
      username: username
    },
    function(err, shiftData) {
      console.log("#######", shiftData);
      if (err) {
        console.log(err);
      } else {
        if (!shiftData) {
          res.render("index", {
            username: username,
            output: username
          })
        } else {

          res.render("index", {
            username: shiftData.username,
            output: username,
            days: shiftData.days
          })
        }
      }
    });
})




app.post('/waiter/:username', getuser, function(req, res) {

  var objectDays = {};
  var container = "";
  var username = req.params.username;

  var days = req.body.days;

  if (days === undefined) {
    console.log('no days');
    req.flash('error', 'Select checkBoxes');
    res.redirect('/waiter/' + username);
  } else {

    // it determines if the days are arrays and convert from string to array
    if (!Array.isArray(days)) {
      days = [days];

    }
    days.forEach(function(day) {
      objectDays[day] = true;
    })
    waiterShift.saveData.findOneAndUpdate({
        username: username
      }, {
        days: objectDays
      },
      function(err, results) {
        if (err) {
          console.log(err);
        } else {

          if (!results) {


            var newWaiter = new waiterShift.saveData({
              username: username,
              days: objectDays
            })

            newWaiter.save(function(err, results) {
              if (err) {
                console.log(err);
              } else {

                req.flash('error', 'Successful added to the database');
                res.redirect('/waiter/' + username);

              }
            })

          } else {
            req.flash('error', 'Successful updated to the database');
            res.redirect('/waiter/' + username);


          }
        }


      })
  }
});


function daysColoring(color) {
  if (color === 3) {
    return "style1";
  } else if (color < 3) {
    return "style2";
  } else if (color > 3) {
    return "style3";
  }
}


app.get('/days', IsAdmin, function(req, res) {
  var shiftDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  var waiterDays = {
    Monday: {
      waiter: []
    },
    Tuesday: {
      waiter: []
    },
    Wednesday: {
      waiter: []
    },
    Thursday: {
      waiter: []
    },
    Friday: {
      waiter: []
    },
    Saturday: {
      waiter: []
    },
    Sunday: {
      waiter: []
    }
  }
  waiterShift.saveData.find({}, function(err, results) {
    if (err) {
      console.log(err);
    }
    // loop through results from the db
    results.forEach(function(shift) {
      //loop thru days
      shiftDays.forEach(function(day) {
        if (shift.days[day]) {
          // console.log(shift[day]);
          console.log(shift.username);
          waiterDays[day].waiter.push(shift.username);
        }

      })

    })

    console.log(waiterDays.Monday.waiter);
    console.log(waiterDays);
    res.render('days', {
      waiterDays: waiterDays,
      SundayColor: daysColoring(waiterDays.Sunday.waiter.length),
      MondayColor: daysColoring(waiterDays.Monday.waiter.length),
      TuesdayColor: daysColoring(waiterDays.Tuesday.waiter.length),
      WednesdayColor: daysColoring(waiterDays.Wednesday.waiter.length),
      ThursdayColor: daysColoring(waiterDays.Thursday.waiter.length),
      FridayColor: daysColoring(waiterDays.Friday.waiter.length),
      SaturdayColor: daysColoring(waiterDays.Saturday.waiter.length)

    });
  })
});
// deleting data from the database
app.get('/Clear', function(req, res) {
  waiterShift.saveData.remove({}, function(err, remove) {
    if (err) {
      return err;
    }
    res.redirect('/days');
  })
});



// login routes

app.get('/login', function(req, res) {

  // try {
  res.render("login");
  // } catch (err) {
  //   next(err)
  // }
})

var users = {
  "admin": "admin",
  "Nzulu": "waiter",
  "Nolo": "waiter"
};
app.post('/login', function(req, res) {
  // console.log(req);
  // res.send(req.body)
  let username = req.body.username;
  var password = req.body.password;
  var userRole = users[req.body.username];

  if (userRole && req.body.password === "pass123") {
    req.session.username = req.body.username;
    req.session.userRole = userRole;
    //console.log("**********");
    console.log(userRole);
    console.log('@@@@@@@@@@@');

    if (userRole === "waiter") {
      res.redirect("/waiter/" + username);
    } else if (userRole === "admin") {
      res.redirect("/days");
    } else {
      //flash message - access denied
      res.redirect("/login");
    }
  }

})

app.get('/access_denied', function(req, res) {
  console.log("AAAAAAAAA");

  res.render('access_denied');

})

function IsAdmin(req, res, next) {

  if (!req.session.username) {
    //if (req.path !== "/login"){
    return res.redirect("/login");
    //}
  }
  if (req.session.userRole !== "admin") {
    return res.redirect("/access_denied");
  }
  next()
}


app.get('/logout', function(req, res) {
  console.log("AAAAAAAAA");

  delete req.session.username;
  res.redirect("/login");

})

function getuser(req, res, next) {
  if (!req.session.username) {
    //if (req.path !== "/login"){
    return res.redirect("/login");
    //}
  }
  if (req.session.userRole === "admin") {
    return res.redirect("/access_denied")
  }
  next()
}


// var users={
//   "admin":"admin",
//   "Nzulu":"waiter"
// }
//
// var username=req.body.user;
// var password=req.body.passwd;






app.use(function(err, req, res, next) {
  console.error(err.stack)
  res.status(500).send(err.stack)
});

const port = process.env.PORT || 5001;
app.listen(port, function() {
  console.log('web app started on port:' + port);
});
