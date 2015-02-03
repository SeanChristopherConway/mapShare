
  /* Call files php to get a list of all the files in the layers folder, which are our static geojson layers */
var loc = window.location.pathname;
  
  /* Sets up the slide menu function*/
  $(function() {
	$('div#menu').mmenu();
});



var isMobile = {
    Android: function() {
        return navigator.userAgent.match(/Android/i);
    },
    BlackBerry: function() {
        return navigator.userAgent.match(/BlackBerry/i);
    },
    iOS: function() {
        return navigator.userAgent.match(/iPhone|iPad|iPod/i);
    },
    Opera: function() {
        return navigator.userAgent.match(/Opera Mini/i);
    },
    Windows: function() {
        return navigator.userAgent.match(/IEMobile/i);
    },
	
	 ipad: function() {
        return navigator.userAgent.match(/iPad/i);
		 },
    any: function() {
        return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
    }
};	
	

var curZoom;



  /*  This code  is only executed after the DOM has been loaded */
  $( document ).ready(function() {

	
    $("#menu").trigger("open");
					var events = ["alcohol related","fire","party","theft","traffic"];
					var options = $("#inputEvent");
					var evFilters = $("#evFilters");
					
			$.each(events, function(item) {
				 options.append($("<option />").val(events[item]).text(events[item]));
				 
				 evFilters.append($("<option />").val(events[item]).text(events[item]));
			});
  
  $("#osm").prop("checked", true);
  $("#clickEnable").prop("checked", true);
});//end of document ready function


var IPObj;	
	
$.get("http://ipinfo.io", function(response) {
    getIPInfo(response);
}, "jsonp");


function getIPInfo(response)
{

IPObj = response;
console.log(IPObj);

}



/* when the window loads (so when we have the map div loaded into the DOM) run all this code */
window.onload = function init(){
	
	var southWest = L.latLng(-85.05112877980659,-179.6484375),
    northEast = L.latLng(84.92832092949963,179.12109374999997),
    bounds = L.latLngBounds(southWest, northEast);
	
	var APP = new Object();
	 /* main map arguments*/

	APP.defaultLat = IPObj.loc.split(",")[0];
	APP.defaultLon = IPObj.loc.split(",")[1];
	APP.mapOptions = {
	    center: new L.LatLng(APP.defaultLat,APP.defaultLon),
		zoomsliderControl: false,
	    zoom: 8,
		maxBounds: bounds,
		minZoom: 3,
		maxZoom: 18,
};

var map;
	search_group = new L.LayerGroup();
	temp_group = new L.LayerGroup();
	clickArr = new Array();
	locHideVar = false;	
	openToggle = false;
	upId = null;
	markers =  L.markerClusterGroup({spiderfyOnMaxZoom: true, showCoverageOnHover: true, zoomToBoundsOnClick: true,removeOutsideVisibleBounds: false});
	

 /* initialise our Leaflet map */
map = new L.Map('map', APP.mapOptions);

		   var opts2 = {
        left: '150px',
        length: 2,
        width: 3,
        radius: 7
    };
//uncomment below to add OSM building data

var content = function(canvas,width,height)
{

	tree.draw(canvas,height,width);
};

var popup;

//L.terminator().addTo(map);

/* remove Powered by Leaflet attribution */
map.attributionControl.setPrefix('');

    var geoControl =  new L.Control.GeoSearch({
            provider: new L.GeoSearch.Provider.Google(),
			 showMarker: false
        }).addTo(map);
		
		$("#leaflet-control-geosearch-qry").hide();
/*
    The osm tile layer is added by default, toggle in menu to change
    */
addTileLayer("osm");
var osmb = new OSMBuildings(map).load();

L.Icon.Canvas = L.Icon.extend({
        options: {
                iconSize: new L.Point(20, 20), // Have to be supplied
                /*
                iconAnchor: (Point)
                popupAnchor: (Point)
                */
                className: 'leaflet-canvas-icon'
        },

        createIcon: function () {
                var e = document.createElement('canvas');
                this._setIconStyles(e, 'icon');
                var s = this.options.iconSize;
                e.width = s.x
                e.height = s.y;
                this.draw(e.getContext('2d'), s.x, s.y);
                return e;
        },

        createShadow: function () {
                return null;
        },

        draw: function(canvas, width, height) {
        }
});


osmb.click(function(e) {
		var circle = new L.Icon.Canvas({iconSize: new L.Point(30, 30)});
		circle.draw = function(ctx, w, h) {
		content(ctx, w, h);
}
		map.addLayer(new L.Marker([e.lat, e.lon], {icon: circle}));
});//end of osmb click function
 
 
  function getGeoLocation()
  {
  if (navigator.geolocation)
    {
    var latlong = navigator.geolocation.getCurrentPosition(showPosition,error);
	return latlong;
    }
  else{
  alert("Geolocation is not supported by this browser.");
  }
  }
function showPosition(position)
  {
  console.log(position);
    var e = {};
	e.latlng = {};
	e.latlng.lat = position.coords.latitude;
	e.latlng.lng = position.coords.longitude;
	addMarker(e,temp_group,clickArr);

  }
 function error(msg) {
  alert("Sorry, geolocation error.");

}


var name = '';
var socket = io.connect();
console.log(socket);

         socket.on('add', function (data) {
		 console.log(data);
			if(temp_group.hasLayer(map._layers[""+data.lat+data.lon+""]))
			{
				hideLayer(temp_group,map._layers[""+data.lat+data.lon+""]);
			}
			var clickPositionMarker = new L.marker([data.lat,data.lon],{icon: makeIcon(data.event),draggable:false});
			clickPositionMarker._leaflet_id = ""+data.lat,data.lon+"";
			clickPositionMarker.addTo(search_group).bindPopup("<b>Message from sender: </b>"+data.msg+"<br>")
					 .openPopup();	
			markers.addLayer(clickPositionMarker);
			
			
         });
	 
	     socket.on('delete', function (data) {
			console.log(search_group);
		 
		 			var clickPositionMarker = map._layers[""+data.lat+data.lon+""];
					hideLayer(search_group,clickPositionMarker);
					clickArr.splice(clickArr.indexOf(clickPositionMarker), 1);
					
         });
		 
		  socket.on('loadData', function (data) {
					if(markers.getLayers().length!=-1)
					{
						markers.clearLayers();
						//search_group.clearLayers();
					}
					L.geoJson(data.geojson,getArgs("public",markers));
					showLayer(search_group,markers,"public");
         });
		 
		   socket.on('filter', function (data) {
					markers.clearLayers();
					//search_group.clearLayers();
					L.geoJson(data.geojson,getArgs("public",markers));
					showLayer(search_group,markers,"public");
         });
		 
	 
	      socket.on('deleteAll', function (data) {
			 search_group.clearLayers();  
         });
	    

           

/* remove Powered by Leaflet attribution */
map.attributionControl.setPrefix('');
	  
	  
/*Toggle basemap layer depending on user checkbox button selection*/
$("input[value='osm']").click(function(){
		addTileLayer("osm");
	});	
	
	
$("input[value='mq']").click(function(){
		addTileLayer("mq");
});

	
	
/* sets the base layers to be automatically collapsed open, as one of them is selected by default */
$('#collapseOne').collapse({
  toggle: true
})

/*Toggle span caret based on the id attribute */
 $(".headTitle[data-toggle='collapse']").click(function(e) {
	   

	     var spanC = $(this).find('span:first').attr('class');
	     var spanID = $(this).find('span:first').attr('id');
	 	
		if(spanC=="right-caret")
		{
 			$("#"+spanID).attr("class","caret");
			}
		else{
			$("#"+spanID).attr("class","right-caret");

			}	
           
	     e.preventDefault();
        });

  $('#collapseTwo').on('shown', function () {
 locHideVar = true;

})

loadData(socket);	

var searchMenuState = false;
var editMenuState = false;
$('#search').on('shown', function () {
 searchMenuState = true;

});

$('#EditEvents').on('shown', function () {
 editMenuState = true;

});

$("#bSearchFormNewEvent" ).submit(function( event ) {
	if(event.preventDefault) {event.preventDefault();}else{event.returnValue = false;}	

		if(!isNaN($("#inputCoords").val().split(",")[0])&&!isNaN($("#inputCoords").val().split(",")[1]))
		{
			var msg;
			addEvent(socket,$("#inputCoords").val().split(",")[0],$("#inputCoords").val().split(",")[1],eventMsg(msg),$("#inputEvent").val());
				
		}
		else
		{
		geoControl.geosearch($("#inputCoords").val());
		}
});

$("#bEditFormNewEvent" ).submit(function( event ) {
	if(event.preventDefault) {event.preventDefault();}else{event.returnValue = false;}	
	
	
	alert("Sorry amigos this is still a work in progress ! Never fear though, for a nerd I be...");
	upMsg(socket,$("#inputMsgUp").val(),upId);

});

  $("#evFilters").change(function (event) {
	if(event.preventDefault) {event.preventDefault();}else{event.returnValue = false;}	
	
	filter(socket,$("#evFilters").val());

	
  });	

  
  
  
 /*
 
 -------------------------Click map function-------------------------
 This function is fired on a map click, grabbing the lat,long and allowing the user to make a nearest features query 
 */
toggleClick=true;
 map.on('click', function(e) {
	
		if(toggleClick)
		{
				addMarker(e,temp_group,clickArr);
	
		}
});

map.on('geosearch_showlocation', function (result) {
	 var msg;
	 addEvent(socket,result.Location.Y,result.Location.X,eventMsg(msg),$("#inputEvent").val());
});

map.on('zoomend', function(e) {
	
curZoom = map.getZoom(); 	
});


function addTileLayer(x)
{
	console.log(x);
	var mapQuestAttr = 'Tiles Courtesy of <a href="http://www.mapquest.com/">MapQuest</a> &mdash; ';
	var osmDataAttr = 'Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
	var mopt = {
	    url: 'http://otile{s}.mqcdn.com/tiles/1.0.0/osm/{z}/{x}/{y}.jpeg',
	    options: {attribution:mapQuestAttr + osmDataAttr, subdomains:'1234', continuousWorld: false,worldCopyJump: false,noWrap: true}
	  };
	var osm = L.tileLayer("http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{attribution:osmDataAttr,continuousWorld: false,worldCopyJump: false,noWrap: true});
	var mq=L.tileLayer(mopt.url,mopt.options);
	switch(x)
	{
			case "osm":
				$("#osm").prop("checked", true);
				if(map.hasLayer(mq)){map.removeLayer(mq)}
				osm.addTo(map);

			break;
		
		
		
			case "mq":
				$("#mq").prop("checked", true);
				if(map.hasLayer(osm)){map.removeLayer(osm)}
				mq.addTo(map);
			break;
		
	}
	
	
	
}//end of addTileLayer





/*
HTML5 Geolocation function: In development
*/

/* Scale options --> Set to display only metric */
   var scaleOpts = APP.mapOptions = {
    metric:true,
    imperial:false,
};
//add scalebar to map
L.control.scale(scaleOpts).addTo(map);


 $(".leaflet-control-pan").hide();

if( !isMobile.any()||isMobile.ipad() )
{


map.addControl(new L.Control.Zoomslider({position: 'bottomleft'}));
new L.Control.Pan({ position: 'topright' }).addTo(map);
} 




  $("#clickEnable").change(function (event) {
	if(event.preventDefault) {event.preventDefault();}else{event.returnValue = false;}	
	if($("#clickEnable").is(':checked'))
	{
	toggleClick=true;
	}
	else{
	
	toggleClick=false;
	}
});	

	
  

 $("#GeoLocate").click(function(event) {
	if(event.preventDefault) {event.preventDefault();}else{event.returnValue = false;}	
  	getGeoLocation();	
  
});	


  
$(document).on("click","a[name='removeClickM']", function (e) {
	
	  // Stop form from submitting normally
	e.preventDefault();

	for(i=0;i<clickArr.length;i++) {

	if(temp_group.hasLayer(clickArr[i]))
	{
		if(clickArr[i]._latlng.lat+"_"+clickArr[i]._latlng.lng==$(this).attr('id'))
			{
				hideLayer(temp_group,clickArr[i]);
				clickArr.splice(clickArr.indexOf(clickArr[i]), 1);
				
			}
		
	}
	
    }  
	

  
});



$(document).on("click","a[name='upMsg']", function (e) {
	
	  // Stop form from submitting normally
	e.preventDefault();

	console.log(map._layers[$(this).attr('id')]);
	
	  $("#menu").trigger("open");
				if(editMenuState==false)
				{
					$('#EditEvents').collapse('toggle');
				}
				$('#inputMsgUp').val(map._layers[$(this).attr('id')].feature.properties.popup_msg);
				upId = map._layers[$(this).attr('id')]._latlng.lat+","+map._layers[$(this).attr('id')]._latlng.lng+","+map._layers[$(this).attr('id')].feature.properties.event;

  
});



$(document).on("click","a[name='createMsg']", function (e) {
	
	  // Stop form from submitting normally
	e.preventDefault();

	console.log(map._layers[$(this).attr('id')]);
	
	  $("#menu").trigger("open");
				if(searchMenuState==false)
				{
					$('#search').collapse('toggle');
				}
				

				$('#inputCoords').val(map._layers[$(this).attr('id')]._latlng.lat+","+map._layers[$(this).attr('id')]._latlng.lng);
	
  
});


$("#bSearchClearM").click(function() {

 temp_group.clearLayers();
  
});





map.addLayer(temp_group);
map.addLayer(search_group);



};  /* end of window on load function */


