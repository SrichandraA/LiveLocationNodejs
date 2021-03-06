var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var mysql=require('mysql');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var index = require('./routes/index');
var users = require('./routes/users');

var app = express();
var urlencodedParser = bodyParser.urlencoded({extended: false});
var idForMap;
var sqlUpdate;
var con =mysql.createConnection({
  host:"localhost",
  user:"root",
  password:"lkgukg",
  database:"map"

});
con.connect(function(err){
  if (err) throw err;
  console.log("connected");
});
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'ejs');

app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/getIdForMap', function(req, res, next) {
  res.send(idForMap);
});

app.get('/googleMap/:id',function(req,res){
          console.log("open map");
          console.log(req.params.id);
          idForMap=req.params.id;
    res.render('map.html');
});

app.put('/updatelocation',urlencodedParser, function(req,res){
          console.log("update operation");

  console.log(req.body.id);
 	var data = [
    {
      latitude: req.body.latitude,
      longitude: req.body.longitude
    },
    {id: req.body.id}
  ];
  sqlUpdate = "UPDATE location SET ? WHERE ?";
  con.query(sqlUpdate,data,function(err,result){
  	if(err)throw err;
    res.send("updated successfully !")
  });
});


app.get('/getlocation',function(req,res){
  con.query("SELECT latitude,longitude FROM location",function(err,result){
	   if(err) throw err;
      console.log("select operation");
     console.log(result);
	   res.send(JSON.stringify(result));
   });
});

app.get('/getlocation/:id',function(req,res){
    var data = {id: req.params.id};

  con.query("SELECT latitude,longitude FROM location WHERE ?",data,function(err,result){
	   if(err) throw err;
      console.log("select operation");
     console.log(result);
	   res.send(JSON.stringify(result));
   });
});


app.post('/insertlocation',function(req,res){
      var data = {
        latitude: req.body.latitude,
        longitude: req.body.longitude
       
      };
    sqlInsert = 'INSERT INTO location SET ?';
    con.query(sqlInsert,data,function(err,result1){
        if(err) throw err;
console.log("inserted");

    });
  con.query("SELECT MAX(id) as MAX FROM location", function (err, result, fields) {
            if(err) throw err;
    res.send(JSON.stringify(result));
          });
});
app.use('/', index);
app.use('/users', users);




// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
