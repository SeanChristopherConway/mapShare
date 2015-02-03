	/*
     * Author:      Sean Conway
     * Contact:     scconway8@gmail.com
     * Website:     
     * Twitter:     @scconway8
	 
	 Description: This script contains all of the main functions for the mapping application that are called from map.js, this has been separated for cleanliness and readabilty.  Many of the functions are callback functions, meaning they are functions that are actually variables of other functions, e.g. an AJAX or XHR function may post/get to a database or FME server and the data it returns is then fed into this callback.  Or, in other words, these are the response functions for the event handlers.
	 
	 
*/

jQuery.fn.center = function () {
    this.css("position","absolute");
    this.css("top", ( $(window).height() - this.height() ) / 2+$(window).scrollTop() + "px");
    this.css("left", ( $(window).width() - this.width() ) / 2+$(window).scrollLeft() + "px");
    return this;

}//end of jQuery center function


/*  Resizes the map and the map loading circle when an orientation change occurs and triggers this function. */
  function myOrientResizeFunction(){

  	$('#map').css("width", window.innerWidth);
	$('#map').css("height",  window.innerHeight);			

	$('#MapLoadingDiv').center();
	$('#MapLoadingDiv').css("width", "50px");
	$('#MapLoadingDiv').css("height", "50px");


}

/*  This function is used to make ajax requests for most instances in the applicaton where such calls are required. */  
  function AjaxCaller(type,params,dataType,url,cb)
{
	
		   $.ajax({
    type:type,
    data: params, 
	dataType: dataType,
    url:url,
    success:function(data) {
			 cb(data)
    }//end of success function

	});//end of ajax		

}//end of AjaxCaller function

	var CustomIcon = L.Icon.extend({
   options: {
        iconSize: new L.Point(32, 32),
        opacity: 0.5,
        iconAnchor: new L.Point(16, 16),
        popupAnchor: new L.Point(0, -18)
      }
    });
	
function eventMsg(msg)
{

	if($("#inputMsg").val()=="")
	{
		msg = "Click the link below to update me";
		return msg;
	}
	
	else
	{
		msg = $("#inputMsg").val();
		return msg;
	}


}		

function makeIcon(event)
{
	console.log(event);
	var the_url = '/icons/';
		switch(event){
		
		case "fire":
			var fIcon = new CustomIcon({iconUrl: the_url+"fire.png"});

		return fIcon;
		break;
		
		case "theft":
			var fIcon = new CustomIcon({iconUrl: the_url+"robber.png"});

		return fIcon;
		break;
		
		case "alcohol related":
			var fIcon = new CustomIcon({iconUrl: the_url+"bottle.png"});

		return fIcon;
		break;
		
		case "party":
			var fIcon = new CustomIcon({iconUrl: the_url+"boombox.png"});
		return fIcon;
		break;
		
		case "traffic":
			var fIcon = new CustomIcon({iconUrl: the_url+"car_sedan_red.png"});

		return fIcon;
		break;
		
		default:
		var fIcon = new CustomIcon({iconUrl: the_url+"information.png"});
		return fIcon;
		
		}//end of switch
		
}
/*
* show/hide layerGroup   
*/
function showLayer(group,nlayer,layerN) {
	nlayer._leaflet_id=layerN;
    group.addLayer(nlayer);   
}
function hideLayer(group,id) {
    group.removeLayer(id);
	$("#MapLoadingDiv").hide();		
}



function addMarker(e,group,clickArr)
{

			var clickPositionMarker = new L.marker([e.latlng.lat,e.latlng.lng],{draggable:true});
			clickPositionMarker._leaflet_id = ""+e.latlng.lat+e.latlng.lng+"";
			clickArr.push(clickPositionMarker);
			clickPositionMarker.addTo(group).bindPopup("<a name='createMsg' id="+clickPositionMarker._leaflet_id+">Click me to create and share an event</a>"+"<br>"+"<br>"+"<a name='removeClickM' id="+e.latlng.lat+"_"+e.latlng.lng+">Remove Me</a>")
					.openPopup();	


}

function loadData(socket)
{
	socket.emit('loadData',{room:'public'});
}
	
function addEvent(socket,y,x,msg,ev)
{

	if(ev=="pleasechoose")
	{
		alert("Please choose an event !");
		return;
	}
	 socket.emit('add',{lat:y,lon:x,msg:msg,event:ev});		
						
}//end of addEvent function


function filter(socket,filter)
{
	if(filter=="all")
	{
		loadData(socket);	
	}
	else
	{
		socket.emit('filter',{filter:filter});
	}
	
}//end of filter function

function pubLayer(feature,latlng) {

		var the_url = '/icons/';
		switch(feature.properties.event){
		
		case "fire":
			var fIcon = new CustomIcon({iconUrl: the_url+"fire.png"});

		return L.marker(latlng,  {icon: fIcon});
		break;
		
		case "theft":
			var fIcon = new CustomIcon({iconUrl: the_url+"robber.png"});

		return L.marker(latlng,  {icon: fIcon});
		break;
		
		case "alcohol related":
			var fIcon = new CustomIcon({iconUrl: the_url+"bottle.png"});

		return L.marker(latlng,  {icon: fIcon});
		break;
		
		case "party":
			var fIcon = new CustomIcon({iconUrl: the_url+"boombox.png"});

		return L.marker(latlng,  {icon: fIcon});
		break;
		
		case "traffic":
			var fIcon = new CustomIcon({iconUrl: the_url+"car_sedan_red.png"});

		return L.marker(latlng,  {icon: fIcon});
		break;
		
		
		default:
		var fIcon = new CustomIcon({iconUrl: the_url+"information.png"});
		return L.marker(latlng,  {icon: fIcon});
		
		}//end of switch
		
    

};

function filter1(feature,layer){	

				if($("#evFilters").val()!="all"){
			     return feature.properties.event == $("#evFilters").val();
				 }
				 else{
				 return true;			 
				 }
				 
	}
	
function getArgs(layerName,markers){
 
var layerFN = window[layerName];

 switch(layerName){
 
		default:
			
		return { pointToLayer:pubLayer,
              onEachFeature: function (feature, layer) {
				//layer._leaflet_id = ""+feature.properties.latitude+feature.properties.longitude+"";
				markers.addLayer(layer);
			    if (feature.properties && feature.properties.popup_msg) {
        layer.bindPopup("<b>Message from sender: </b>"+feature.properties.popup_msg+"<br>");
    }
			 }   //, filter:filter1
              }
				
				
 
 		}//end of switch
  }//end of args function


