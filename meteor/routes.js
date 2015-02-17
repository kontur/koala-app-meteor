Router.configure({
    layoutTemplate: "Shell",
    loadingTemplate: "Loading"
//    notFoundTemplate: "notFound",
});


// HOOKS
// =====

Router.onBeforeAction(function (req, res, next) {
    // reset error message array before showing next view
    Session.set("errors", null);

    // fetch geolocation into session for any router (TODO be more selective about this?)
    navigator.geolocation.getCurrentPosition(function (position) {
        Session.set("geolocation", position);
    });
    this.next();
});

Router.onBeforeAction(function() {
  GoogleMaps.load();
  this.next();
}, { only: ['map', 'venue.map'] });


// ROUTES
// ======

Router.route("/", function () {
    this.render("Home", {
        to: "main"
    });
}, { name: "home" });


Router.route("/explore", function () {
    this.render("Explore", {
        to: "main"
    });
});

Router.route("/explore/:category", function () {
    this.render("ExploreCategory", {
        to: "main",
        data: {
            "category": this.params.category
        }
    });
});


Router.route("/map", {
    onBeforeAction: function () {
        console.log("onBeforeMap");
        GoogleMaps.load();
        this.next();
    },
    action: function () {
        this.render("Map", {
            to: "main"
        });
    }
}, { name: "map" });


Router.route("/venue/:id", function () {
    this.redirect("/venue/" + this.params.id + "/info");
}, { name: "venue" });

Router.route("/venue/:id/info", function () {
    console.log("venue", this.params.id);
    var id = this.params.id;
    this.render("VenueInfo", {
        to: "top",
        data: {
            id: id
        }
    });
    this.render("VenuePhotos", {
        to: "bottom",
        data: {
            id: id,
            active: "info"
        }
    });
}, { name: "venue.info" });

Router.route("/venue/:id/map", function () {
    console.log("venue map", this.params.id);
    var id = this.params.id;
    this.render("VenueMap", {
        to: "top",
        data: {
            id: id
        }
    });
    this.render("VenuePhotos", {
        to: "bottom",
        data: {
            id: id,
            active: "map"
        }
    });
}, { name: "venue.map" });

Router.route("/search", function () {
    this.render("Search", {
        to: "main"
    });
}, { name: "venue.search" });