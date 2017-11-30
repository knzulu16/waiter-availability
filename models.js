var mongoose = require('mongoose');
var Schema=mongoose.Schema;
const mongoURL = process.env.MONGO_DB_URL || "mongodb://localhost/Waiter";

mongoose.connection.on("error", function(err){
  console.log(err);
});



mongoose.connect(mongoURL,{
  useMongoClient:true
}),function(err) {
  if (err) {
    console.log('error connection');
  } else {
    console.log('database connection success');
  }
};




exports.saveData=mongoose.model('saveData',{
  password:String,
  email:String,
  username:String,
  days: {
    Sunday:Boolean,
    Monday : Boolean,
    Tuesday : Boolean,
    Wednesday:Boolean,
    Thursday:Boolean,
    Friday:Boolean,
    Saturday:Boolean
  }

});
