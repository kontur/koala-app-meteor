if (Meteor.isClient) {

    Template.MapMarker.created = function () {
        this.images = new ReactiveVar([]);
    };

    Template.MapMarker.helpers({
        "numPhotos": function () {
            return this.numPhotos;
        },
        "venueId": function () {
            return this.venueId;
        },
        "images": function () {
            return Template.instance().images.get();
        }
    });

    Template.MapMarker.rendered = function () {
        var tpl = Template.instance(),
            data = this.data;

        console.log("get images for venue ", data.venueId);
        Meteor.call("venue_images", data.venueId, function (err, res) {
            console.log("venues call", err, res, JSON.parse(res.content));
            if (err) {
                Session.set("errors", _.union(Session.get("errors"), [err]));
                return;
            }
            var result = JSON.parse(res.content);
            console.log("images?", result);
            tpl.images.set(result);

//            _.each(tpl.venues.get(), function (venue, index) {
//                if (venue.venue.id == data.venueId) {
//                    venue.instagram = result;
//                }
//                console.log(venue);
//            });
        });
    }
}