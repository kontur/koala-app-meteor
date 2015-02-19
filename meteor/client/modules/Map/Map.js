if (Meteor.isClient) {

    /**
     * RichMarker Anchor positions
     * @enum {number}
     */
    var RichMarkerPosition = {
        'TOP_LEFT': 1,
        'TOP': 2,
        'TOP_RIGHT': 3,
        'LEFT': 4,
        'MIDDLE': 5,
        'RIGHT': 6,
        'BOTTOM_LEFT': 7,
        'BOTTOM': 8,
        'BOTTOM_RIGHT': 9
    };
    window['RichMarkerPosition'] = RichMarkerPosition;


    Template.Map.created = function () {
        this.venues = new ReactiveVar();
        this.selected = new ReactiveVar();
    };


    // somehow _.debounce just makes a mess here...
    var updateMapLastCall = Date.now();

    Template.Map.rendered = function () {


        var tpl = Template.instance();
        navigator.geolocation.getCurrentPosition(function (position) {
            Session.set("geolocation", position);
            updateMap(position.coords, tpl);

            // when current user position resolved, add marker wrapped in map ready function
            if (GoogleMaps.loaded()) {
                GoogleMaps.ready("exampleMap", function () {
                    // Add a marker to the map once it"s ready
                    var pos = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
//                    var here = new google.maps.Marker({
//                        position: pos,
//                        map: GoogleMaps.maps.exampleMap.instance
//                    });

                    console.log("hello", google.maps.OverlayView, RichMarker);

                    Meteor.Loader.loadJs("//google-maps-utility-library-v3.googlecode.com/svn/trunk/richmarker/src/richmarker.js", function () {
                        console.log("google maps utils loaded");
                        marker = new RichMarker({
                            position: pos,
                            map: GoogleMaps.maps.exampleMap.instance,
                            draggable: true,
                            content: '<div class="my-marker"><div>This is a nice image</div>' +
                                '<div><img src="http://farm4.static.flickr.com/3212/3012579547_' +
                                '097e27ced9_m.jpg"/></div><div>You should drag it!</div></div>'
                        });
                    });

                    google.maps.event.addListener(GoogleMaps.maps.exampleMap.instance, "center_changed", function () {
                        console.log("center_changed");
                        if (updateMapLastCall + 1000 < Date.now()) {
                            updateMapLastCall = Date.now();
                            updateMap({
                                    "latitude": this.getCenter().lat(),
                                    "longitude": this.getCenter().lng()
                                },
                                tpl);
                        }
                    });

                });
            }
        });
    };


    /**
     *
     * @param position Object{latitude, longitude}
     */
    function updateMap(position, tpl) {
        console.log("updateMap", position, tpl);

        GoogleMaps.maps.exampleMap.instance.setCenter(new google.maps.LatLng(position.latitude, position.longitude));

        Meteor.call("venues", position.latitude, position.longitude, { limit: 3 }, function (err, res) {
            console.log("venues call", err, res, JSON.parse(res.content));
            if (err) {
                Session.set("errors", _.union(Session.get("errors"), [err]));
                return;
            }

            var responseVenues = JSON.parse(res.content);
            var currentVenues = tpl.venues.get();

            // if there is already previously found venues on the map
            if (currentVenues) {
                _.each(currentVenues, function (currentVenue) {
                    // if any of the found vneues is already in the current venues don't add it
                    var inArrayAlready = _.find(responseVenues, function (responseVenue) {
                        return responseVenue.venue.id == currentVenue.venue.id;
                    });

                    if (!inArrayAlready) {
                        responseVenues.push(currentVenue);
                    }
                });
            }
            tpl.venues.set(responseVenues);


            // set markers for all retrieved venues
            _.each(tpl.venues.get(), function (elem, index) {
                if (index == 0) {
                    // TODO highlight current venue
                    tpl.selected.set(elem);
                }

                if (!elem.hasMarker) {
                    var marker = new google.maps.Marker({
                        position: new google.maps.LatLng(elem.venue.location.lat, elem.venue.location.lng),
                        map: GoogleMaps.maps.exampleMap.instance,
                        icon: Meteor.settings.public["icons"] +
                            "90,70,30/" +
                            encodeURIComponent(elem.venue.categories[0].icon.prefix + "32" + elem.venue.categories[0].icon.suffix),
                        venue_id: elem.venue.id,
                        title: elem.venue.name
                    });

                    google.maps.event.addListener(marker, "click", function () {
                        var id = this.venue_id;
                        colorMarker(this, "230, 50, 30", encodeURIComponent(elem.venue.categories[0].icon.prefix + "32" + elem.venue.categories[0].icon.suffix));
                        // TODO try catch
                        tpl.selected.set(_.find(tpl.venues.get(), function (elem) {
                            return elem.venue.id == id;
                        }));
                    });

                    elem.hasMarker = true;
                }
            });
        });
    };


    function colorMarker(marker, colorStr, iconStr) {
        marker.setIcon(Meteor.settings.public["icons"] + colorStr + "/" + iconStr);
    };

    Template.Map.helpers({
        "exampleMapOptions": function () {
            var tpl = Template.instance();

            // Make sure the maps API has loaded
            if (GoogleMaps.loaded()) {
                return {
                    center: new google.maps.LatLng(0, 0),
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