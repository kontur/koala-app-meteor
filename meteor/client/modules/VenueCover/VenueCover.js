if (Meteor.isClient) {

    Template.VenueCover.helpers({
        "venue_icon": function () {
            try {
                this.venue.icon = Meteor.settings.public["icons"] + "208,2,27/" +
                    encodeURIComponent(this.venue.categories[0].icon.prefix + "32" + this.venue.categories[0].icon.suffix);
            } catch (e) {
                this.venue.icon = null;
            }
            return this.venue.icon;
        }
    });

}