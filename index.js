"use strict";
var express = require('express');
var handlebars = require('express-handlebars');
const session = require("express-session");
var bodyParser = require('body-parser');

var app = express();
var waitersList = [];
var waiterShift = require('./models');
app.use(express.static(__dirname + '/public'));
app.engine('handlebars', handlebars({
  extname: 'handlebars',
  defaultLayout: 'main'
}));
app.set('view engine', 'handlebars');

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({
  extended: false
}));
// parse application/json
app.use(bodyParser.json())


app.get("/waiter/:username", function(req, res, next) {
  var username = req.params.username;
  // console.log("{{{{{{{{{{{{{{{}" +username);
  var msg = " Choose your work schedule" + username;

  waiterShift.saveData.findOne({
      username: username
    },
    function(err, results) {
      if (err) {
        console.log(err);
      } else {
        if (!results) {
          res.render("index", {
            username: username,
            output: msg
          })
        } else {
          res.render("index", {
            username: results.username,
            output: msg
          })
        }
      }
    });
})
// res.render("index", {
//   output: msg,
//   o
// })






// function storesData(usernameParam, cb) {
//   waiterShift.saveData.findOne({
//       username: usernameParam
//
//     },
//     function(err, results) {
//       if (err) {
//         return err;
//       } else {
//         if (!results) {
//           waiterShift.save(cb);
//         } else {
//
//             function(err, results){
//               if (err) {
//                 return err;
//               } else if (results) {
//                 results.save(cb);
//               }
//             })
//
//         }
//       }
//     })
// }

var objectDays = {};
app.post('/waiter/:username', function(req, res) {
  var username = req.params.username;
  // console.log(username);
  var msg = " Choose your work schedule " + username;
  var days = req.body.days;


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
              console.log(results);
              res.redirect('/waiter/' + results.username);
            }
          })

        } else {
          // console.log('++++++++++++++' + username);
          res.render('index',{username:username});
        }
      }

    })

});




app.get('/days', function(req, res) {
  var shiftDays = ["Monday", "Tuesday","Wednesday","Thursday","Friday", "Saturday","Sunday"];

  var waiterDays = {
    Monday :{
      waiter: []
    },
    Tuesday :{
      waiter: []
    },
    Wednesday :{
      waiter: []
    },
    Thursday :{
      waiter: []
    },
    Friday :{
      waiter: []
    },
    Saturday :{
      waiter: []
    },
    Sunday :{
      waiter: []
    }
  }
  waiterShift.saveData.find({}, function(err, results) {
    if (err) {
      console.log(err);
    }
    // loop through results from the db
    results.forEach(function(shift){
      //loop thru days
      shiftDays.forEach(function(day){
        if(shift.days[day]){
          // console.log(shift[day]);
          console.log(shift.username);
           waiterDays[day].waiter.push(shift.username);
        }

      })

    })

    console.log(waiterDays.Monday.waiter);
    console.log(waiterDays);
    res.render('days', {
      waiterDays:waiterDays



    });
  })
});
//
// app.post('/waiters/:username',function(req, res){
// res.send('home');
// })
//
// app.get('/days',function(req, res){
// res.send('home');
// })



app.use(function(err, req, res, next) {
  console.error(err.stack)
  res.status(500).send(err.stack)
});

const port = process.env.PORT || 5001;
app.listen(port, function() {
  console.log('web app started on port:' + port);
});
