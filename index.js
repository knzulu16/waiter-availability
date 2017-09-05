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


// app.get('/waiter', function(req, res){
//     res.render('index');
// });
// app.get('/', function(req, res){
//     res.redirect('index');
// });



app.get("/waiter/:username", function(req, res, next) {
      let username = req.params.username;
      var msg = " Choose your work schedule " + username;


      waiterShift.saveData.findOne({
          username: username
        },
        function(err, results) {
          if (err) {
            console.log(err);
          } else {
            if (!results){
              res.render("index", {
                username: username,
                output: msg
              })
            }
           else {
            res.render("index", {
              username: results,
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


    app.post('/waiter/:username', function(req, res) {
      var username = req.params.username;
      var msg = " Choose your work schedule " + username;
      var days = req.body.days;

        waiterShift.saveData.findOne({
          username:username
        },
      function(err,results){
        if(err){
          console.log(err);
        }
        else{
          if(!results){
            var newWaiter = new waiterShift.saveData({username: username})
            days.forEach(function(day){
              newWaiter[day]=true;
            })
            newWaiter.save(function(err,results){
              if(err){
                console.log(err);
              }
              else {
                console.log(results);
                res.redirect('/waiter/'+ username);
              }
            });

          }
          else{
            res.render("index", {
                 username:username,
                 output:msg
               })
          }
        }

      })

      // storesData(days, function(err, result){
      //   if (err) {
      //     console.log(err);
      //   } else {
      //
      //     res.render("index", {
      //       username: days
      //     })
      //
      //   }
      //
      // })
    });




    // app.get('/waiters/:username', function(req, res) {
    //   res.send('home');
    // });
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
