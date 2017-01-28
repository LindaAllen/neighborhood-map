var map;

function start_app() {
    if (!window.google || !window.google.maps) {
        $('#map-container').text('Error: Google Maps data could not be loaded');
        $('#map-list').text('Error: Google Maps data could not be loaded');
    }

    var markers = [
    {
        title: "Zen Bar",
        category: "pub",
        address: "317 Farmington Ave, Plainville CT, 06062",
        phone: "(860) 747-8886",
        status: ko.observable("OK"),
        marker: new google.maps.Marker({
            position: new google.maps.LatLng(0, 0),
            icon: "img/pins/bar.png"
        })
    },
    {
        title: "J.Timothy;s Tavern",
        category: "restuarant",
        address: "143 New Britian Ave, Plainville CT, 06062",
        phone: "(860) 747-6813",
        status: ko.observable("OK"),
        marker: new google.maps.Marker({
            position: new google.maps.LatLng(0, 0),
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
            position: new google.maps.LatLng(0, 0),
            icon: "img/pins/coffee.png"
        })
    },
    {
        title: "Gnazzo's Food Center",
        category: "supermarket",
        address: "73 East Street, Plainville CT, 06062",
        phone: "(860) 747-8758",
        status: ko.observable("OK"),
        marker: new google.maps.Marker({
            position: new google.maps.LatLng(0, 0),
            icon: "img/pins/supermarket.png"
        })
    },
    {
        title: "Friendly's",
        category: "restaurant",
        address: "230 New Britian Ave, Plainville CT, 06062",
        phone: "(860) 410-9703",
        status: ko.observable("OK"),
        marker: new google.maps.Marker({
            position: new google.maps.LatLng(0, 0),
            icon: "img/pins/restaurant.png"
        })
    },
    {
        title: "Red Zone Grille",
        category: "pub",
        address: "54 West Main Street, Plainville CT 06062",
        phone: "(860) 747-2277",
        status: ko.observable("OK"),
        marker: new google.maps.Marker({
            position: new google.maps.LatLng(0, 0),
            icon: "img/pins/bar.png"
        })
    },
    {
        title: "Central Cafe",
        category: "pub",
        address: "24 Whiting Street, Plainville CT 06062",
        phone: "(860) 747-0405",
        status: ko.observable("OK"),
        marker: new google.maps.Marker({
            position: new google.maps.LatLng(0, 0),
            icon: "img/pins/bar.png"
        })
    },
    {
        title: "Dunkin Donuts",
        category: "coffee",
        address: "19 East Street, Plainville CT, 06062",
        phone: "(860) 793-2662",
        status: ko.observable("OK"),
        marker: new google.maps.Marker({
            position: new google.maps.LatLng(0, 0),
            icon: "img/pins/coffee.png"
        })
    }
    ];



    google.maps.event.addDomListener(window, 'load', function () {
        var options = {
            map: {
                center: new google.maps.LatLng(41.6737711, -72.8589988),
                zoom: 14
            }
        };
        map = new NeighborhoodMap(markers, options);
        ko.pureComputed(map.filterLocations, map);
        ko.applyBindings(map);
        map.start();
    });
}