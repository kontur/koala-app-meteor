Router.configure({
    layoutTemplate: "Shell",
    loadingTemplate: "Loading"
//    notFoundTemplate: "notFound",
});


Router.onBeforeAction(function (req, res, next) {
    // reset error message array before showing next view
    Session.set("errors", null);

    // fetch geolocation into session for any router (TODO be more selective about this?)
    navigator.geolocation.getCurrentPosition(function (position) {
        Session.set("geolocation", position);
    });
    this.next();
});

Router.route("/", function () {
    this.render("Home", {
        to: "main"
    });
});

Router.route("/explore", function () {
    this.render("Explore", {
        to: "main"
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
});

Router.route("/explore/:category", function () {
    this.render("ExploreCategory", {
        to: "main",
        data: {
            "category": this.params.category
        }
    });
});

Router.route("/venue/:id", function () {
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
            id: id
        }
    });
});

Router.route("/venue/:id/map", function () {
    console.log("venue map", this.params.id);
    var id = this.params.id;
    this.render("VenueMap", {
        to: "top"
    });
    this.render("VenuePhotos", {
        to: "bottom",
        data: {
            id: id
        }
    });
});

Router.route("/search", function () {
    this.render("Search", {
        to: "main"
    });
});