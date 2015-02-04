if (Meteor.isClient) {


    Template.Map.created = function () {
        this.venues = new ReactiveVar();
    };

    Template.Map.rendered = function () {
        var tpl = Template.instance();


        navigator.geolocation.getCurrentPosition(function (position) {
            Session.set("geolocation", position);


            Meteor.call("venues", position.coords.latitude, position.coords.longitude, { limit: 10 }, function (err, res) {
                if (err) {
                    Session.set("errors", _.union(Session.get("errors"), [err]));
                    return;
                }
                tpl.venues.set(JSON.parse(res.content));
                _.each(tpl.venues.get(), function (elem, index) {
                    console.log("venue", elem, index);
                    console.log(elem.venue.location.lat, elem.venue.location.lng, GoogleMaps.maps.exampleMap.instance);
                    var marker = new google.maps.Marker({
                        position: new google.maps.LatLng(elem.venue.location.lat, elem.venue.location.lng),
                        map: GoogleMaps.maps.exampleMap.instance
                    });
                });
            });
        });
    };

    Template.Map.helpers({
        "exampleMapOptions": function () {
            // Make sure the maps API has loaded
            if (GoogleMaps.loaded()) {
                // We can use the `ready` callback to interact with the map API once the map is ready.
                GoogleMaps.ready("exampleMap", function (map) {
                    // Add a marker to the map once it"s ready
                    var here = new google.maps.Marker({
                        position: map.options.center,
                        map: map.instance
                    });


                    google.maps.event.addListener(map, 'center_changed', function() {
                        console.log("map center changed");
                    });

                });


                // Map initialization options
                return {
                    center: new google.maps.LatLng(Session.get("geolocation").coords.latitude, Session.get("geolocation").coords.longitude),
                    zoom: 13
                };
            }
        }
    });
}