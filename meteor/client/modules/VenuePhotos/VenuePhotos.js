if (Meteor.isClient) {

    Template.VenuePhotos.created = function () {
        this.images = new ReactiveVar();
    };

    Template.VenuePhotos.helpers({
        "images": function () {
            return Template.instance().images.get();
        }
    });

    Template.VenuePhotos.rendered = function () {
        var tpl = Template.instance();
        var id = this.data.id;

        Meteor.call("venue_images", id, function (err, res) {
            if (err) {
                Session.set("errors", _.union(Session.get("errors"), [err]));
                return;
            }
            var images = JSON.parse(res.content);
            console.log("images", id, images);
            tpl.images.set(images);
        });
    };

}