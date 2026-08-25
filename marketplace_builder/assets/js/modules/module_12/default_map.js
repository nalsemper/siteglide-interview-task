var map;
//---Initiate Google Map--- All the map settings are contained in this function. It runs as soon as it has downloaded the necessary libraries from Google. 
function initMap(options, locations) {
	//Remove invalid Events- These may be missing locations
	function isValid(i) {
		if (i.valid === "valid") {
			return true;
		}
		return false;
	}
	locations = locations.filter(isValid);
	//---Handle Options Defaults--- Takes options from the Object and stores as variables local to the function.
	//Default Map Selector
	options.map_selector = (typeof options.map_selector !== 'undefined') ? options.map_selector : "#map";
	//Default Zoom
	options.zoom = (typeof options.zoom !== 'undefined') ? options.zoom : 3;
	//Default Center
	options.center = (typeof options.center !== 'undefined') ? options.center : false;
	//Toggle Info Windows
	options.show_info_windows = (typeof options.show_info_windows !== 'undefined') ? options.show_info_windows : true;
	//Toggle Summary
	options.show_summary = (typeof options.show_summary !== 'undefined') ? options.show_summary : false;
	//Default Marker Animation
	options.markers.animation = (typeof options.markers.animation !== 'undefined') ? google.maps.Animation[options.markers.animation] : false;
	//---Define Map Centre--- Decides where the centre of the map should be, by finding the average position of all events.
	if (options.center == false) {
		var bound = new google.maps.LatLngBounds();
		for (i = 0; i < locations.length; i++) {
			bound.extend( new google.maps.LatLng(locations[i].lat, locations[i].lng) );
		}
		var center = { lat: bound.getCenter().lat(), lng: bound.getCenter().lng() };
	} else {
		var center = options.center;
	}
	
	
	//---Build Map--- Creates maps
	map = new google.maps.Map(document.querySelector(options.map_selector), {
		center: center,
		zoom: options.zoom
	});
	//---Add Markers--- Adds markers where each event is taking place. Note that event_data property is completely customisable.
	var markers = locations.map(function(location, i) {
		var current_address_location = { lat: locations[i].lat, lng: locations[i].lng };
		var marker = new google.maps.Marker({
			animation: options.markers.animation,
			draggable: false,
			clickable: options.show_info_windows,
			position: current_address_location,
			event_data: {
				name: locations[i].name,
				address: locations[i].address,
				event_start: locations[i].event_start,
				event_end: locations[i].event_end,
				properties: locations[i].properties,
				slug: locations[i].slug
			}
		});
		//Define infowindow for markers
		if (options.show_info_windows) {
			var infowindow = new google.maps.InfoWindow({
				content: '<h2>'+locations[i].name+'</h2><a href="'+locations[i].slug+'">View Details</a><br><br><p>'+locations[i].address+'</p><p>Starts: '+locations[i].event_start+'<br>Ends: '+locations[i].event_end+'</p>'
			});
			marker.addListener('click', function() {
				infowindow.open(map, marker);
			});
		}
		return marker;
	});

	//--Cluster Markers--- Add a marker clusterer to manage the markers.

	var markerCluster = new MarkerClusterer(map, markers,
	{imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m'});
	google.maps.event.addListener(markerCluster, "click", function(c) {
		//If several events happen in the same location, the cluster marker will still show at the highest level of zoom. This code makes sure that clicking on the cluster icon again (at maximum zoom) will load infowindows containing data for all events within the cluster.
		if (options.show_info_windows && map.zoom === 22) {
			event.preventDefault();
			infoWindowContent = "";
			for (i=0;i<c.markers_.length;i++) {
				infoWindowContent = infoWindowContent + '<h2>'+c.markers_[i].event_data.name+'</h2><a href="'+c.markers_[i].event_data.slug+'">View Details</a><br><br><p>'+c.markers_[i].event_data.address+'</p><p>Starts: '+c.markers_[i].event_data.event_start+'<br>Ends: '+c.markers_[i].event_data.event_end+'</p><br><br>'
			}
			var infoWindow = new google.maps.InfoWindow({
				content: infoWindowContent,
				position: c.markers_[0].position
			});
			infoWindow.open(map);
		}
	});

	if(options.show_summary) {
		//---Display Summary--- This section of code handles the summary List which displays the List of Events covered by this viewport of the Map
		function updateMapEventsList() {
			var mapSummary = "";
			for (i=0;i<markerCluster.markers_.length;i++) {
				if(markerCluster.markers_[i].isAdded == true) {
					mapSummary = mapSummary+'<h2>'+markerCluster.markers_[i].event_data.name+'</h2><p>'+markerCluster.markers_[i].event_data.address+'</p><p>Starts: '+markerCluster.markers_[i].event_data.event_start+'<br>Ends: '+markerCluster.markers_[i].event_data.event_end+'</p>';
				}
			}
			if (typeof options.summary_selector !== "undefined") {
				document.querySelector("#mapSummary").innerHTML = mapSummary;
			}
			mapSummary = "";
		}
		var center_changed_throttle = false;
		map.addListener('center_changed', function() {
			if (center_changed_throttle == false) {
				center_changed_throttle = true;
				markerCluster.clearMarkers();
				markerCluster.addMarkers(markers,true);
				setTimeout(function(){
					center_changed_throttle = false;
				}, 500);
			}
		});
		markerCluster.addListener('clusteringend', updateMapEventsList);
	}
}
