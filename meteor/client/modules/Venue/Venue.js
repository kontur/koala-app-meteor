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

    Template.Venue.rendered = function () {
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

            Meteor.call("venue_images", id, function (err, res) {
                if (err) {
                    Session.set("errors", _.union(Session.get("errors"), [err]));
                    return;
                }
                var images = JSON.parse(res.content);
                console.log("images", id, images);
                tpl.images.set(images);
            });
        });
    };

}