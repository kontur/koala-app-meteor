if (Meteor.isClient) {

    Template.VenueMap.created = function () {
        this.venue = new ReactiveVar();
    };

    Template.VenueMap.helpers({
        "venue": function () {
            return Template.instance().venue.get();
        },
        "VenueMapOptions": function () {
            var tpl = Template.instance();
            // Make sure the maps API has loaded
            if (GoogleMaps.loaded()) {
                return {
                    center: new google.maps.LatLng(0, 0),
                    zoom: 13,
                    disableDefaultUI: true
                };
            }
        }
    });

    Template.VenueMap.rendered = function () {
        var tpl = Template.instance();
        var id = tpl.data.id;
        var panTo = null; // note: can't set to lat lng because googe.maps.LatLng might not be available yet


        navigator.geolocation.getCurrentPosition(function (position) {
            Session.set("geolocation", position);

            Meteor.call("venue", id, function (err, res) {
                if (err) {
                    Session.set("errors", _.union(Session.get("errors"), [err]));
                    return;
                }
                var contents = JSON.parse(res.content);
                tpl.venue.set(contents.venue);
                console.log("venue", tpl.venue.get());

                // Add a marker to the map once it"s ready
                var venuePos = new google.maps.LatLng(contents.venue.location.lat, contents.venue.location.lng);

                var venueMarker = new google.maps.Marker({
                    position: venuePos,
                    map: GoogleMaps.maps.VenueMap.instance,
                    icon: Meteor.settings.public["icons"] + "208,2,27/" +
                        encodeURIComponent(contents.venue.categories[0].icon.prefix + "32" +
                            contents.venue.categories[0].icon.suffix)
                });

                panTo = venuePos;
                GoogleMaps.maps.VenueMap.instance.panTo(venuePos);
            });

            GoogleMaps.ready("VenueMap", function () {
                if (!panTo) {
                    panTo = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
                }
                GoogleMaps.maps.VenueMap.instance.setCenter(panTo);
                var hereMarker = new google.maps.Marker({
                    position: new google.maps.LatLng(position.coords.latitude, position.coords.longitude),
                    map: GoogleMaps.maps.VenueMap.instance
                });
            });
        });
    };

}