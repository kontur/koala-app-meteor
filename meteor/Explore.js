if (Meteor.isClient) {

    Template.Explore.created = function () {
        this.food = new ReactiveVar();
        this.nightlife = new ReactiveVar();
        this.cafes = new ReactiveVar();
        this.hotels = new ReactiveVar();
    };

    Template.Explore.helpers({
        'top_food': function () {
            return Template.instance().food.get();
        },
        'top_nightlife': function () {
            return Template.instance().nightlife.get();
        },
        'top_cafes': function () {
            return Template.instance().cafes.get();
        },

        'top_hotels': function () {
            return Template.instance().hotels.get();
        }
    });

    Template.Explore.rendered = function () {
        var tpl = Template.instance();

        navigator.geolocation.getCurrentPosition(function (position) {
            Session.set("geolocation", position);

            Meteor.call("venues", position.coords.latitude, position.coords.longitude, { category: 'food' }, function (err, res) {
                if (err) {
                    Session.set('errors', _.union(Session.get('errors'), [err]));
                    return;
                }
                tpl.food.set(JSON.parse(res.content));
            });
            Meteor.call("venues", position.coords.latitude, position.coords.longitude, { category: 'nightlife', limit: 2 }, function (err, res) {
                if (err) {
                    Session.set('errors', _.union(Session.get('errors'), [err]));
                    return;
                }
                tpl.nightlife.set(JSON.parse(res.content));
            });
            Meteor.call("venues", position.coords.latitude, position.coords.longitude, { category: 'cafes' }, function (err, res) {
                if (err) {
                    Session.set('errors', _.union(Session.get('errors'), [err]));
                    return;
                }
                tpl.cafes.set(JSON.parse(res.content));
            });
            Meteor.call("venues", position.coords.latitude, position.coords.longitude, { category: 'hotels' }, function (err, res) {
                if (err) {
                    Session.set('errors', _.union(Session.get('errors'), [err]));
                    return;
                }
                tpl.hotels.set(JSON.parse(res.content));
            });
        });
    };
}