function NeighborhoodMap(locations, options) {
    this.locations = locations || [];

    this.options = options || {map: {}};

    this.map = new google.maps.Map(document.querySelector('.map-container'), options.map);
    this.infowindow = new google.maps.InfoWindow({maxWidth: 250});

    this.searchReq = ko.observable('');
    this.filtered = ko.observable(this.locations);
    this.geocoder = new google.maps.Geocoder();

    this.modal = $('#errorModal')
}

NeighborhoodMap.prototype = Object.create({});
NeighborhoodMap.prototype.constructor = NeighborhoodMap;

NeighborhoodMap.prototype.filterLocations = function (searchTerm) {
    console.log(this);
    console.log(this.locations);
    return this.locations.filter(function (location) {
        // Clear the Timers and Map Markers
        location.marker.setVisible(false);
        clearTimeout(location.timer);
        // Filter by Search Term
        var titleSearch = location.title.toLowerCase().indexOf(searchTerm),
            categorySearch = location.category.toLowerCase().indexOf(searchTerm);
        return ((titleSearch > -1 || categorySearch > -1) && location.status() === 'OK');
    }, this).map(function (location, i) {
        location.marker.setVisible(true);
        return location;
    }, this);
};

NeighborhoodMap.prototype.setPosition = function (location) {
    var map = this.map,
        modal = this.modal;
    this.geocoder.geocode({'address': location.address}, function (results, status) {
        if (status === 'OK') {
            location.marker.position = results[0].geometry.location;
            location.marker.setAnimation(google.maps.Animation.DROP);
            location.marker.setMap(map);
        } else if (status === 'OVER_QUERY_LIMIT') {
            // If status is OVER_QUERY_LIMIT, then wait and re-request
            modal.find('.modal-message').text("Google Geocoder API in over rate limit");
            modal.modal('show');
            setTimeout(this.setPosition.bind(this, location), 2000);
        } else {
            location.status('ERROR');
            modal.find('.modal-message').text('Error code: ' + status + 'for Location:' + location.title);
            modal.modal('show');
        }
    });
};

NeighborhoodMap.prototype.setBubble = function (location) {
    var infowindow = this.infowindow,
        modal = this.modal;
    google.maps.event.addListener(location.marker, 'click', function () {

        //Request Yelp info, then format it, and place it in infowindow
        yelpRequest(location.phone, function (data) {

            //Can you clarify the following code review comment on this segment?
            //"This text template is one part of View so you can move it into index.html."
            var contentString = "<div id='yelpWindow'>" +
                "<h5>" + "<a href='" + data.mobile_url + "' target='_blank'>" + data.name + "</a>" + "</h5>" +
                "<p>" + data.location.address + "</p>" +
                "<p>" + data.display_phone + "</p>" +
                "<img src='" + data.rating_img_url_large + "'>" +
                "<p>" + data.snippet_text + "</p>" +
                "</div>";
            infowindow.setContent(contentString);
        }, function (error) {
            modal.find('.modal-message').text(error);
            modal.modal('show');
        });

        infowindow.open(this.map, location.marker);
    });
};

NeighborhoodMap.prototype.toggleBounce = function (location) {
    if (location.marker.getAnimation() !== null) {
        location.marker.setAnimation(null);
    } else {
        new google.maps.event.trigger(location.marker, 'click');
        location.marker.map.setCenter(location.marker.position);
        location.marker.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(function () {
            location.marker.setAnimation(null);
        }, 700);
    }
};

NeighborhoodMap.prototype.start = function () {
    this.locations.map(function (location, i) {
        this.setPosition(location);
        this.setBubble(location);
    }, this);
    this.searchReq.subscribe(function (searchTerm) {
        var filteredResults = this.filterLocations(searchTerm);
        this.filtered(filteredResults);
    }.bind(this));
};
