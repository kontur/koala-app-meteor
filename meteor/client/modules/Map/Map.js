if (Meteor.isClient) {


    Template.Map.created = function () {
        this.venues = new ReactiveVar();
        this.selected = new ReactiveVar();
    };

    Template.Map.rendered = function () {
        var tpl = Template.instance();


        navigator.geolocation.getCurrentPosition(function (position) {
            Session.set("geolocation", position);

            Meteor.call("venues", position.coords.latitude, position.coords.longitude, { limit: 3 }, function (err, res) {
                if (err) {
                    Session.set("errors", _.union(Session.get("errors"), [err]));
                    return;
                }
                tpl.venues.set(JSON.parse(res.content));
                _.each(tpl.venues.get(), function (elem, index) {

                    if (index == 0) {
                        console.log("Selected", elem);
                        tpl.selected.set(elem);
                    }

                    console.log(elem);
                    var marker = new google.maps.Marker({
                        position: new google.maps.LatLng(elem.venue.location.lat, elem.venue.location.lng),
                        map: GoogleMaps.maps.exampleMap.instance,
                        icon: elem.venue.categories[0].icon.prefix + "64" + elem.venue.categories[0].icon.suffix,
                        venue_id: elem.venue.id
                    });

                    google.maps.event.addListener(marker, "click", function () {
                        console.log("hello marker", this, tpl);
                        var id = this.venue_id;

                        tpl.selected.set(_.find(tpl.venues.get(), function (elem) {
                            console.log("_find found", elem);
                            return elem.venue.id == id;
                        }));
                        //tpl.selected = tpl.venues.venue.id search... this.id
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


                    google.maps.event.addListener(map, "center_changed", function() {
                        console.log("map center changed");
                    });

                });


                // Map initialization options
                return {
                    center: new google.maps.LatLng(Session.get("geolocation").coords.latitude, Session.get("geolocation").coords.longitude),
                    zoom: 13
                };
            }
        },
        "selected": function () {
            return Template.instance().selected.get();
        }
    });
}