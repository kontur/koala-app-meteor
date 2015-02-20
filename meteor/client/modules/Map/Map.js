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


    var markerLibLoaded = false;
    var markerLibReadyStack = [];


    // somehow _.debounce just makes a mess here...
    var updateMapLastCall = Date.now();

    Template.Map.rendered = function () {

        var tpl = Template.instance();
        navigator.geolocation.getCurrentPosition(function (position) {
            Session.set("geolocation", position);
            updateMap(position.coords, tpl);

            // when current user position resolved, add marker wrapped in map ready function
            if (GoogleMaps.loaded()) {
                GoogleMaps.ready("VenueMap", function () {
                    // Add a marker to the map once it"s ready
                    var pos = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
                    var here = new google.maps.Marker({
                        position: pos,
                        map: GoogleMaps.maps.VenueMap.instance
                    });

                    // load external library for special formatted markers
                    // TODO check if this could be done smarter somehow
                    // TODO serve a copy of this file from server, not SVN trunk :O
                    Meteor.Loader.loadJs("//google-maps-utility-library-v3.googlecode.com/svn/trunk/richmarker/src/richmarker.js", markerLibReady);

                    google.maps.event.addListener(GoogleMaps.maps.VenueMap.instance, "center_changed", function () {
                        console.log("center_changed");

                        // homebrew debounce; _.debounce somehow seems to get all confused when used with the
                        // addListener function param :/
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


    function markerLibReady() {
        console.log("markerLibLReady");
        markerLibLoaded = true;
        if (markerLibReadyStack.length > 0) {
            _.each(markerLibReadyStack, function (item) {
                addMarker(item);
            });
        }
    }

    function addMarker(options) {
        console.log("addMarker", options);
        if (markerLibLoaded) {
            console.log("addMarker do it");
            marker = new RichMarker({
                position: options.position,
                map: GoogleMaps.maps.VenueMap.instance,
                draggable: false,
                flat: true,
                anchor: RichMarkerPosition.BOTTOM,

                // TODO would be nice to use Blaze here, actually
                content: '<div class="map-venue-marker" id="venue-marker-' + options.venue_id + '">' +
                    '<div class="marker-image"><img src="/img/loading.gif"/></div>' +
                    '<div class="marker-image-count">' + options.numPhotos + '</div></div>'
            });

            // event listener

            // marker photo

        } else {
            console.log("addMarker to stack");
            markerLibReadyStack.push("");
        }

        /*

        var div = document.createElement('DIV');
        div.innerHTML = '<div class="my-other-marker">I am flat marker!</div>';

        marker2 = new RichMarker({
          map: map,
          position: new google.maps.LatLng(30, 50),
          draggable: true,
          flat: true,
          anchor: RichMarkerPosition.MIDDLE,
          content: div
        });

         */
    }


    /**
     *
     * @param position Object{latitude, longitude}
     */
    function updateMap(position, tpl) {
        console.log("updateMap", position, tpl);

        GoogleMaps.maps.VenueMap.instance.setCenter(new google.maps.LatLng(position.latitude, position.longitude));

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
//                    var marker = new google.maps.Marker({
//                        position: new google.maps.LatLng(elem.venue.location.lat, elem.venue.location.lng),
//                        map: GoogleMaps.maps.VenueMap.instance,
//                        icon: Meteor.settings.public["icons"] +
//                            "90,70,30/" +
//                            encodeURIComponent(elem.venue.categories[0].icon.prefix + "32" + elem.venue.categories[0].icon.suffix),
//                        venue_id: elem.venue.id,
//                        title: elem.venue.name
//                    });

                    addMarker({
                        position: new google.maps.LatLng(elem.venue.location.lat, elem.venue.location.lng),
                        numPhotos: 3,
                        venue_id: elem.venue.id
                    });

//                    google.maps.event.addListener(marker, "click", function () {
//                        var id = this.venue_id;
//                        colorMarker(this, "230, 50, 30", encodeURIComponent(elem.venue.categories[0].icon.prefix + "32" + elem.venue.categories[0].icon.suffix));
//                        // TODO try catch
//                        tpl.selected.set(_.find(tpl.venues.get(), function (elem) {
//                            return elem.venue.id == id;
//                        }));
//                    });

                    elem.hasMarker = true;
                }
            });
        });
    };


    function colorMarker(marker, colorStr, iconStr) {
        marker.setIcon(Meteor.settings.public["icons"] + colorStr + "/" + iconStr);
    };

    Template.Map.helpers({
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
        },
        "selected": function () {
            return Template.instance().selected.get();
        }
    });
}