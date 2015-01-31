if (Meteor.isClient) {

    Template.Venue.created = function () {
        this.venue = new ReactiveVar();
        this.images = new ReactiveVar();
    };

    Template.Venue.helpers({
        "venue": function () {
            return Template.instance().venue.get();
        },
        "images": function () {
            return Template.instance().images.get();
        }
    });

    Template.Venue.rendered = function () {
        var tpl = Template.instance();
        Meteor.call("venue", this.data.id, function (err, res) {
            if (err) {
                Session.set("errors", _.union(Session.get("errors"), [err]));
                return;
            }
            var contents = JSON.parse(res.content);
            tpl.venue.set(contents.venue);
            tpl.images.set(contents.images)
        });
    };

}