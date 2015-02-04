if (Meteor.isClient) {


    Template.Map.created = function () {
        this.venues = new ReactiveVar();
        this.selected = new ReactiveVar();
    };

    Template.Map.rendered = updateMap;

    function updateMap() {
        var tpl = Template.instance();

        navigator.geolocation.getCurrentPosition(function (position) {
            Session.set("geolocation", position);

            Meteor.call("venues", position.coords.latitude, position.coords.longitude, { limit: 3 }, function (err, res) {
                if (err) {
                    Session.set("errors", _.union(Session.get("errors"), [err]));
                    return;
                }

                console.log("to union: ", JSON.parse(res.content), tpl.venues.get());

                tpl.venues.set(_.union(JSON.parse(res.content)), tpl.venues.get());

                // set markers for all retrieved venues
                _.each(tpl.venues.get(), function (elem, index) {
                    if (index == 0) {
                        console.log("Selected", elem);
                        tpl.selected.set(elem);
                    }

                    if (!elem.hasMarker) {

                        var marker = new google.maps.Marker({
                            position: new google.maps.LatLng(elem.venue.location.lat, elem.venue.location.lng),
                            map: GoogleMaps.maps.exampleMap.instance,
                            icon: elem.venue.categories[0].icon.prefix + "32" + elem.venue.categories[0].icon.suffix,
                            venue_id: elem.venue.id,
                            title: elem.venue.name
                        });

                        google.maps.event.addListener(marker, "click", function () {
                            var id = this.venue_id;

                            // TODO try catch
                            tpl.selected.set(_.find(tpl.venues.get(), function (elem) {
//                                console.log("_find found", elem);
                                return elem.venue.id == id;
                            }));
                        });

                        elem.hasMarker = true;
                    }
                });

                console.log("after each", tpl.venues.get());
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
                    google.maps.event.addListener(map.instance, "center_changed", function () {
                        console.log("hello center_changed");
                        navigator.geolocation.getCurrentPosition(function (position) {
                            console.log("hello position", position);
                            Session.set("geolocation", position);

                            var marker = new google.maps.Marker({
                                position: new google.maps.LatLng(60, 24),
                                map: GoogleMaps.maps.exampleMap.instance
                            });
                        });
                    });

                    //_.debounce(updateMap, 500));
                });


                var coords = Session.get("geolocation").coords;
                // Map initialization options
                return {
//                    center: new google.maps.LatLng(Session.get("geolocation").coords.latitude, Session.get("geolocation").coords.longitude),
                    center: new google.maps.LatLng(coords.latitude, coords.longitude),
                    zoom: 13,
                    disableDefaultUI: true
                };
            }
        },
        "selected": function () {
            return Template.instance().selected.get();
        }
    });
}