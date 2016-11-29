"use strict";

//Error handling - checks if Google Maps has loaded
if (!window.google || !window.google.maps){
  $('#map-container').text('Error: Google Maps data could not be loaded');
  $('#map-list').text('Error: Google Maps data could not be loaded');
}

// --------- MODEL ---------------

var markersModel = [
  {
    title: "Zen Bar",
    category: "pub",                         // category for search field
    address: "317 Farmington Ave, Plainville CT, 06062", // street address for use by Google Maps geocoder
    phone: "(860) 747-8886",                         // phone number for use by Yelp API
    status: ko.observable("OK"),                    // change status if error message received from Yelp
    marker: new google.maps.Marker({               // google maps marker object
      position: new google.maps.LatLng(0,0),          // set initial position to (0,0)
      icon: "img/pins/bar.png"                 // category icon for map pin
    })
  },
  {
    title: "J.Timothy;s Tavern",
    category: "restuarant",
    address: "143 New Britian Ave, Plainville CT, 06062",
    phone: "(860) 747-6813",
    status: ko.observable("OK"),
    marker: new google.maps.Marker({
      position: new google.maps.LatLng(0,0),
      icon: "img/pins/restaurant.png"
    })
  },
  {
    title: "Starbucks",
    category: "coffee",
    address: "275 New Britian Ave, Plainville CT, 06062",
    phone: "(860) 747-4977",
    status: ko.observable("OK"),
    marker: new google.maps.Marker({
      position: new google.maps.LatLng(0,0),
      icon: "img/pins/coffee.png"
    })
  },
  {
    title: "Gnazzo's Food Center",
    category: "supermarket",
    address: "73 East Street, Plainville CT, 06062",
    phone: "(860) 747-8758",
    status: ko.observable("OK"),
    marker : new google.maps.Marker({
      position: new google.maps.LatLng(0,0),
      icon: "img/pins/supermarket.png"
    })
  },
  {
    title: "Friendly's",
    category: "restaurant",
    address: "230 New Britian Ave, Plainville CT, 06062",
    phone: "(860) 410-9703",
    status: ko.observable("OK"),
    marker : new google.maps.Marker({
      position: new google.maps.LatLng(0,0),
      icon: "img/pins/restaurant.png"
    })
  },
  {
    title: "Red Zone Grille",
    category: "pub",
    address: "54 West Main Street, Plainville CT 06062",
    phone: "(860) 747-2277",
    status: ko.observable("OK"),
    marker : new google.maps.Marker({
      position: new google.maps.LatLng(0,0),
      icon: "img/pins/bar.png"
    })
  },
  {
    title: "Central Cafe",
    category: "pub",
    address: "24 Whiting Street, Plainville CT 06062",
    phone: "(860) 747-0405",
    status: ko.observable("OK"),
    marker : new google.maps.Marker({
      position: new google.maps.LatLng(0,0),
      icon: "img/pins/bar.png"
    })
  },
  {
    title: "Dunkin Donuts",
    category: "coffee",
    address: "19 East Street, Plainville CT, 06062",
    phone:"(860) 793-2662",
    status: ko.observable("OK"),
    marker : new google.maps.Marker({
      position: new google.maps.LatLng(0,0),
      icon: "img/pins/coffee.png"
    })
  }
];
// ---------------------------------- VIEWMODEL ------------------------------

var resultMarkers = function(members){
  var self = this;

  self.mapOptions = {
    center: new google.maps.LatLng(41.6737711, -72.8589988), //set map center in Queen Anne
    zoom: 14
  };

  var mapCont = document.getElementsByClassName('map-container');

  self.map = new google.maps.Map(mapCont[0], self.mapOptions);

  self.infowindow = new google.maps.InfoWindow({ maxWidth:250 });

  self.searchReq = ko.observable('');     //user input to Search box

  // Filtered version of data model, based on Search input
  self.filteredMarkers = ko.computed(function() {
    //Remove all markers from map
    var len = members.length;
    for (var i = 0; i < len; i++) {
      members[i].marker.setMap(null);
      clearTimeout(members[i].timer);
    }
    //Place only the markers that match search request
    var arrayResults = [];
    arrayResults =  $.grep(members, function(a) {
      var titleSearch = a.title.toLowerCase().indexOf(self.searchReq().toLowerCase());
      var catSearch = a.category.toLowerCase().indexOf(self.searchReq().toLowerCase());
      return ((titleSearch > -1 || catSearch > -1) && a.status() === 'OK');
    });
    //Iterate thru results, set animation timeout for each
    var len = arrayResults.length;
    for (var i = 0; i < len; i++){
      (function f(){
        var current = i;
        var animTimer = setTimeout(function(){arrayResults[current].marker.setMap(self.map);}, i * 250);
        arrayResults[current].timer = animTimer;
      }());
    }
    //Return list of locations that match search request, for button list
    return arrayResults;
  });

  //Use street address in model to find LatLng
  self.setPosition = function(location){
    var geocoder = new google.maps.Geocoder();
    //use address to find LatLng with geocoder
    geocoder.geocode({ 'address': location.address }, function(results, status) {
      if (status === 'OK'){
        location.marker.position = results[0].geometry.location;
        location.marker.setAnimation(google.maps.Animation.DROP);
      } else if (status === 'OVER_QUERY_LIMIT'){
        // If status is OVER_QUERY_LIMIT, then wait and re-request
        console.log("in over limit");
        setTimeout(function(){
          geocoder.geocode({ 'address': location.address }, function(results, status) {
              location.marker.position = results[0].geometry.location;
              location.marker.setAnimation(google.maps.Animation.DROP);
            });
        }, 2000);

      } else {
        //If status is any other error code, then set status to Error, which will remove it from list and map
        location.status('ERROR');
        //Log error information to console
        console.log('Error code: ', status, 'for Location:', location.title);
      }
    });
  };

  //Adds infowindows to each marker and populates them with Yelp API request data
  self.setBubble = function(index){
    //Add event listener to each map marker to trigger the corresponding infowindow on click
    google.maps.event.addListener(members[index].marker, 'click', function () {

      //Request Yelp info, then format it, and place it in infowindow
      yelpRequest(members[index].phone, function(data){

        //Can you clarify the following code review comment on this segment?
        //"This text template is one part of View so you can move it into index.html."
        var contentString = "<div id='yelpWindow'>" +
                            "<h5>" +  "<a href='" + data.mobile_url + "' target='_blank'>" +data.name + "</a>" + "</h5>" +
                            "<p>" + data.location.address + "</p>" +
                            "<p>" + data.display_phone + "</p>" +
                            "<img src='" + data.rating_img_url_large + "'>" +
                            "<p>" + data.snippet_text + "</p>" +
                            "</div>";
        self.infowindow.setContent(contentString);
      });

      self.infowindow.open(self.map, members[index].marker);
  });
};

  //Iterate through data model, get LatLng location then set up infowindow
  self.initialize = function(){
    for (var current in members){
      self.setPosition(members[current]);
      self.setBubble(current);
    }
  };

  //Toggle bounce animation for map marker on click of Location list button (via data-binding)
  self.toggleBounce = function(currentMarker) {
    if (currentMarker.marker.getAnimation() !== null) {
      currentMarker.marker.setAnimation(null);
    } else {
      self.map.setCenter(currentMarker.marker.position);       //center map on bouncing marker
      currentMarker.marker.setAnimation(google.maps.Animation.BOUNCE);
      setTimeout(function(){currentMarker.marker.setAnimation(null);}, 1900); //bounce for 2800 ms
    }
  };
};

//----

var myMarkers = new resultMarkers(markersModel);
ko.applyBindings(myMarkers);
google.maps.event.addDomListener(window, 'load', myMarkers.initialize);
