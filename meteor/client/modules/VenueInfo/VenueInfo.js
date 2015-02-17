if (Meteor.isClient) {

    Template.VenueInfo.created = function () {
        this.venue = new ReactiveVar();
    };

    Template.VenueInfo.helpers({
        "venue": function () {
            return Template.instance().venue.get();
        },
        "venue_icon": function () {
            try {
                this.icon = Meteor.settings.public["icons"] + "208,2,27/" +
                    encodeURIComponent(this.categories[0].icon.prefix + "32" + this.categories[0].icon.suffix);
            } catch (e) {
                this.icon = null;
            }
            return this.icon;
        }
    });

    Template.VenueInfo.rendered = function () {
        var tpl = Template.instance();
        var id = this.data.id;
        Meteor.call("venue", id, function (err, res) {
            if (err) {
                Session.set("errors", _.union(Session.get("errors"), [err]));
                return;
            }
            var contents = JSON.parse(res.content);
            console.log(contents);
            tpl.venue.set(contents.venue);
        });
    };

}