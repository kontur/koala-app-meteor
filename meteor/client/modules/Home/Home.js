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

        // where the magic happens!
        // if either numVenues of maxVenues change, this triggers loading of new venues if so needed
        // note: this also autoruns on first init, because the variables "change"
        Tracker.autorun(function () {
            if (tpl.numVenues.get() < tpl.maxVenues.get()) {
                getVenue(tpl.numVenues.get());
            }
        });

        $(window).scroll(onScroll);

        function getVenue(offset) {
            console.log("getVenue", offset);

            navigator.geolocation.getCurrentPosition(function (position) {
                Session.set("geolocation", position);

                Meteor.call("venues", position.coords.latitude, position.coords.longitude,
                    {
                        limit: 1,
                        offset: offset,
                        images: 1,
                        comments: 0 // no comments requested in initial call, only after load to minimize load time
                    },
                    function (err, res) {
                    if (err) {
                        Session.set("errors", _.union(Session.get("errors"), [err]));
                        return;
                    }

                    console.log("res", JSON.parse(res.content)[0]);

                    // push new venues to view helper and increase count
                    var current = tpl.discover.get();
                    current.push(JSON.parse(res.content)[0]);
                    tpl.discover.set(current);
                    tpl.numVenues.set(tpl.numVenues.get() + 1);
                });
            });
        }

        function onScroll(event) {
            console.log("scrolling");
            var windowH = $(window).height(),
                documentH = $(document).height(),
                marker = $(".loading-more").offset().top,
                position = $(document).scrollTop();

            console.log(windowH, documentH, marker, position);


            // if the marker is less than 1 windowH below the fold: load more

            if (position + windowH > documentH - windowH) {
                console.log("load more");
                if (tpl.numVenues.get() < tpl.maxVenues.get()) {
                    console.log("already loading more");
                } else {
                    console.log("LOAD MORE");
                    tpl.maxVenues.set(tpl.maxVenues.get() + 3);
                }
            } else {
                console.log("leave it be");
            }

        }
    };
}