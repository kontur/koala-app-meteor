
if (Meteor.isClient) {
    Template.ExploreCategory.created = function () {
        this.venues = new ReactiveVar();
    };

    Template.ExploreCategory.helpers({
        'venues': function () {
            return Template.instance().venues.get();
        }
    });

    Template.ExploreCategory.rendered = function () {
        var tpl = Template.instance();

        navigator.geolocation.getCurrentPosition(function (position) {
            Session.set("geolocation", position);

            Meteor.call("venues", position.coords.latitude, position.coords.longitude, { category: tpl.data.category, limit: 5 }, function (err, res) {
                console.log("venues call food example", JSON.parse(res.content));
                tpl.venues.set(JSON.parse(res.content));
            });
        })
    };
}