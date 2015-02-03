var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io');
var pg = require('pg');
var conString = "postgres://postgres:[password]:[port]/[database]";

server.listen(8000, function(){
  console.log('listening on *:8000');
});

app.use(express.static(__dirname+'/') );
	

io = io.listen(server);

function FeatureCollection(){
    this.type = 'FeatureCollection';
    this.features = new Array();
}

function Feature(){
    this.type = 'Feature';
    this.geometry = new Object;
    this.properties = new Object;
} 


   
function makeQuery(queryString,args,callback)
{
		 
		 pg.connect(conString, function(err, client, done) {
  if(err) {
    return console.error('error fetching client from pool', err);
  }

  client.query(queryString,args ,function(err, result) {
    //call `done()` to release the client back to the pool
    done();

    if(err) {
      return console.error('error running query', err);
    }

	if(callback)
		callback(result);

});
});
}//end of makeQuery function


function getTime(timeString,type)
 {
	var date,
		time;
	date = timeString.split("-")[2].split("T")[0];
	time = timeString.split("-")[2].split("T")[1].substr(0, timeString.split("-")[2].split("T")[1].length - 1);
	
	switch(type)
	{
		case "time":
			return time;
		case "date":
		console.log(date);
			return date;
	
	}
 }
 
var clients = [];

// open the socket connection
io.sockets.on('connection', function (socket) {

     clients.push(socket.id); 
    clients.forEach(function(client) {
    console.log("%s is connected",client);
});




 
 
function loadData(result)
{


		var  featureCollection = new FeatureCollection();
	for(i=0; i<result.rows.length; i++){

		var feature = new Feature();
		feature.geometry = JSON.parse(result.rows[i].geometry);
		feature.properties.event = result.rows[i].event;
		feature.properties.latitude = result.rows[i].latitude;
		feature.properties.longitude = result.rows[i].longitude;
		feature.properties.popup_msg = result.rows[i].popup_msg;
		featureCollection.features.push(feature);
}
  

socket.emit('loadData', {
        geojson: featureCollection
      });
    
}//end of loadData function

function loadDataAgain()
{

  makeQuery('SELECT event,latitude,longitude,popup_msg,ST_AsGeoJSON(the_geom)AS geometry FROM community_open;',null,loadData);

}//end of function loadDataAgain


function filterData(result)
{


	var  featureCollection = new FeatureCollection();
	for(i=0; i<result.rows.length; i++){

		var feature = new Feature();
		feature.geometry = JSON.parse(result.rows[i].geometry);
		feature.properties.event = result.rows[i].event;
		feature.properties.latitude = result.rows[i].latitude;
		feature.properties.longitude = result.rows[i].longitude;
		feature.properties.popup_msg = result.rows[i].popup_msg;
		featureCollection.features.push(feature);
}

socket.emit('filter', {
        geojson: featureCollection
      });

}//end of filterData function



var minutes = 1, the_interval = minutes * 60 * 1000;
setInterval(function() {
  var d = new Date(),
	  n = d.toISOString();
  console.log("I am doing my %s minute check to find files older than a day",minutes);
  var delString = "DELETE FROM community_open WHERE timestamp != $1;";
  makeQuery(delString,[getTime(n,"date")],loadDataAgain);
}, the_interval);


   socket.on('add', function (data) {
	


  var wkt = "POINT("+data.lon+" "+data.lat+")";
  var d = new Date(),
	   n = d.toISOString(),
	   delString = 'INSERT INTO community_open(latitude,longitude,the_geom,event,popup_msg,timestamp) VALUES($1 ,$2,ST_GeomFromText($3,4326),$4,$5,$6);';
  makeQuery(delString, [data.lat,data.lon,wkt,data.event,data.msg,getTime(n,"date")],null);
	
	
	
  
io.sockets.emit('add', {
         lat : data.lat, 
         lon : data.lon,
		 msg:data.msg,
		 event:data.event
      });
	  
	  
  });


       socket.on('loadData', function (data) {

  makeQuery('SELECT event,latitude,longitude,popup_msg,ST_AsGeoJSON(the_geom)AS geometry FROM community_open;',null,loadData);

   });
 

       socket.on('filter', function (data) {
	   
	   makeQuery('SELECT event,latitude,longitude,popup_msg,ST_AsGeoJSON(the_geom)AS geometry FROM community_open WHERE event = $1;',[data.filter],filterData);

  });

  socket.on('disconnect', function() {
 
      var i = clients.indexOf(socket);
	  console.log('%s disconnected',socket.id);
      delete clients[i];
   });

});


