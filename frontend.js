// Initialize Map window

var container = document.getElementById('map');
	var options = {
		center: new kakao.maps.LatLng(37.5663, 126.9779),
		level: 3
	};

var map = new kakao.maps.Map(container, options);

// Map Control
var mapTypeControl = new kakao.maps.MapTypeControl();

var zoomControl = new kakao.maps.ZoomControl();

map.addControl(mapTypeControl, kakao.maps.ControlPosition.TOPRIGHT);

map.addControl(zoomControl, kakao.maps.ControlPosition.RIGHT);

// Coords and Array Variables
var userCoords;
var markersPos = [];
var markersTitle = [];
var distOfPoints = [];
var markersInRange = [];

// Read address JSON file, place markers on interactive map
$.getJSON('./address_dict.json', function(data) {
	var tempMarkerPos = [];
	var tempMarkersTitle = [];
	var geocoder = new kakao.maps.services.Geocoder();
	for (var address in data) {
		const currAddress = address;
		geocoder.addressSearch(address, function(result, status) {
			// if address is valid
			if (status === kakao.maps.services.Status.OK) {
				var coords = new kakao.maps.LatLng(result[0].y, result[0].x);

				//console.log(currAddress);

				// Markers for each location
				var marker = new kakao.maps.Marker({
					map: map,
					position: coords,
					title: currAddress,
					clickable: true
				});
				marker.setMap(map);

				// Vars of coords denoted La and Ma
				markersPos.push(marker.getPosition());

				// Title of markers (i.e. Written location in Korean; type is string)
				markersTitle.push(marker.getTitle().toString());

				// Additional Information about each location
				var infoWindow = new kakao.maps.InfoWindow({
				});
				infoWindow.setContent(data[currAddress]);				

				// if mouse cursor over location
				kakao.maps.event.addListener(marker, 'click', function() {
					infoWindow.open(map, marker);
				});
				
				// if mouse cursor leaves location
				kakao.maps.event.addListener(marker, 'mouseout', function() {
					infoWindow.close();
				});
			}
		});
	};

});

// import image for current location marker
var imageSrc = './current_marker.png',
	imageSize = new kakao.maps.Size(64, 69),
	imageOption = {offset: new kakao.maps.Point(27, 69)};

// create marker image
var markerImage = new kakao.maps.MarkerImage(imageSrc, imageSize, imageOption);

// Request location info via HTML5 geolocation and set to center
if (navigator.geolocation) {
	// Accepted use of location info
	navigator.geolocation.getCurrentPosition(function(pos) {
		var lat = pos.coords.latitude;
		var lon = pos.coords.longitude;

		const currLocation = new kakao.maps.LatLng(lat, lon),
			message = '<div style="padding:5px;">현재위치</div>';

		displayMarker(currLocation, message);

		userCoords = currLocation;

		var surrounding = new kakao.maps.Circle({
			center: currLocation,
			radius: 2500,
			strokeOpacity: 1
		});
		
		surrounding.setMap(map);

		searchSurroundings(surrounding, markersPos);


	});
} else {
	// Denied use of Current Location
	const defaultPos = new kakao.maps.LatLng(33.450701, 126.570667),
		message = '<div style="padding:5px;">현재위치 사용 기능이 꺼져있습니다.</div>';
	
	displayMarker(defaultPos, message);
};

// Display Marker for User Position
function displayMarker(position, message) {
	var marker = new kakao.maps.Marker({
		map: map,
		position: position,
		image: markerImage
	});

	var infoWindow = new kakao.maps.InfoWindow({
		content: message,
	});

	kakao.maps.event.addListener(marker, 'mouseover',function(){
		infoWindow.open(map, marker);
	});

	kakao.maps.event.addListener(marker, 'mouseout', function(){
		infoWindow.close();
	});

	infoWindow.open(map, marker);

	map.setCenter(position);
};

// Helper function for searching surroundings


function searchSurroundings(circle, markers) {
	//var inRange = [];
	var line = new kakao.maps.Polyline();

	var i;

	for (i = 0; i < markers.length; ++i) {
		var path = [markers[i], circle.getPosition()];
		line.setPath(path);

		// distance from center of circle to marker point
		var distance = line.getLength();

		if (distance < circle.getRadius()) {
			distOfPoints.push(distance);
			markersInRange.push(markersTitle[i]);
		}
		
		if (distance < shortest) {
			shortest = distance;
			shortestTitle = markersTitle[i];
		}
	};
};

function nearbyAlert() {
	alert("반경 5km내 수거함 " + distOfPoints.length + "개가 있습니다.");
};


// Code for nearestLoc()
var shortest = Number.MAX_SAFE_INTEGER;
var shortestTitle;
var ind = -1;


// Code for nearestLoc()
function nearestLoc() {
	//shortestTitle = markersTitle[ind];
	const adjustedDistance = shortest/1000;
	alert("가장 가까운 수거함의 주소는 " + shortestTitle + "입니다. 이동 거리는 약 " + adjustedDistance + "km 입니다.");
};