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

    console.log("onBefore");
});

Router.onAfterAction(function () {
    console.log("onAfter");
});

Router.onBeforeAction(function () {
    GoogleMaps.load();
    this.next();
}, { only: ['map', 'venue.map'] });


// ROUTES
// ======

Router.route("/", function () {
    this.render("HeaderDiscover", { to: "header" });
    this.render("Home", {
        to: "top"
    });
    this.render("Empty", { to: "bottom" });
}, { name: "home" });

// just a URL redirect in case someone "guesses" to go to the /discover URL
Router.route("/discover", function () {
    this.redirect("/");
}, { name: "discover_null" });

Router.route("/discover/:category", function () {
    this.render("HeaderDiscover", { to: "header" });
    this.render("Home", {
        to: "top",
        data: {
            "category": this.params.category
        }
    });
    this.render("Empty", { to: "bottom" });
}, { name: "discover" });


Router.route("/map", {
    onBeforeAction: function () {
        console.log("onBeforeMap");
        GoogleMaps.load();
        this.next();
    },
    action: function () {
        this.render("Header", { to: "header" });
        this.render("Map", {
            to: "top"
        });
        this.render("Empty", { to: "bottom" });
    }
}, { name: "map" });


// this works, but causes an extraneous browser history entry :/
//Router.route("/venue/:id", function () {
//    this.redirect("/venue/" + this.params.id + "/info");
//}, { name: "venue" });

Router.route("/venue/:id/info", function () {
    console.log("venue", this.params.id);
    var id = this.params.id;
    this.render("HeaderStub", { to: "header" });
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
    this.render("Header", { to: "header" });
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
    this.render("Header", { to: "header" });
    this.render("Search", {
        to: "top"
    });
    this.render("Empty", { to: "bottom" });
}, { name: "venue.search" });