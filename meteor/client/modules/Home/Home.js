if (Meteor.isClient) {

    Template.Home.created = function () {
        this.discover = new ReactiveVar([]);
        this.numVenues = new ReactiveVar(0);
        this.maxVenues = new ReactiveVar(3);
    };

    Template.Home.helpers({
        "discover": function () {
            return Template.instance().discover.get();
        }
    });

    Template.Home.events({
        "click .load-more": function (event, tpl) {
            // increase the number of max venues, this will trigger autorun to check
            // if enough venues have been loaded
            tpl.maxVenues.set(tpl.maxVenues.get() + 3);
        }
    });

    Template.Home.rendered = function () {
        var tpl = Template.instance();
        var category = null;

//        console.log("TPL data", tpl.data);

        // where the magic happens!
        // if either numVenues of maxVenues change, this triggers loading of new venues if so needed
        // note: this also autoruns on first init, because the variables "change"
        Tracker.autorun(checkNew);

        Tracker.autorun(function () {
            var c = Session.get("category");
//            console.log("autorun, session", c, category);
            if (c !== category) {
                category = c;
                if (tpl.numVenues.get() > 0) {
//                    console.log("reset");
                    if (tpl.discover) tpl.discover.set([]);
                    if (tpl.numVenues) tpl.numVenues.set(0);
                    if (tpl.maxVenues) tpl.maxVenues.set(3);
//                    checkNew();
                }
            }
        });

        $(window).scroll(onScroll);

        function checkNew() {
            if (tpl.numVenues.get() < tpl.maxVenues.get()) {
                getVenue(tpl.numVenues.get());
            }
        }

        function getVenue(offset) {
            console.log("getVenue", offset);

            navigator.geolocation.getCurrentPosition(function (position) {
                Session.set("geolocation", position);

//                console.log("cate", tpl.data, tpl.data["category"]);
                var qry = {
                    limit: 1,
                    offset: offset,
                    images: 1,
                    comments: 0 // no comments requested in initial call, only after load to minimize load time
                };

//                if (tpl.data && tpl.data["category"]) {
//                    qry["category"] = tpl.data["category"];
//                }

                var c = Session.get("category");
                if (c) {
                    qry["category"] = c;
                }

                console.log("QUERY", qry);

                Meteor.call("venues", position.coords.latitude, position.coords.longitude, qry,
                    function (err, res) {
                        if (err) {
                            Session.set("errors", _.union(Session.get("errors"), [err]));
                            return;
                        }

                        console.log("res", JSON.parse(res.content)[0]);

                        // check if upen getting the result the category is still the same as
                        // when the request was initiated, or has it changed inbetween and this
                        // result is void
                        if (c != Session.get("category")) {
                            console.log("CATEGORY CHANGED");
                            return;
                        }

                        // push new venues to view helper and increase count
                        var current = tpl.discover.get();
                        current.push(JSON.parse(res.content)[0]);
                        tpl.discover.set(current);
                        tpl.numVenues.set(tpl.numVenues.get() + 1);
                    });
            });

        }

        function onScroll(event) {
            var windowH = $(window).height(),
                documentH = $(document).height(),
                marker = $(".loading-more").offset().top,
                position = $(document).scrollTop();

            // if the marker is less than 1 windowH below the fold: load more
            if (position + windowH > documentH - windowH) {
                if (tpl.numVenues.get() < tpl.maxVenues.get()) {
                } else {
                    tpl.maxVenues.set(tpl.maxVenues.get() + 3);
                }
            } else {
            }

        }
    };
}