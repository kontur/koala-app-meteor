if (Meteor.isClient) {

    Template.Home.created = function () {
        this.popular = new ReactiveVar();
        this.trending = new ReactiveVar();
        this.trendsetters = new ReactiveVar();
        this.network = new ReactiveVar();
    };

    Template.Home.helpers({
        "popular": function () {
            return Template.instance().popular.get();
        },
        "trending": function () {
            return Template.instance().trending.get();
        },
        "trendsetters": function () {
            return Template.instance().trendsetters.get();
        },
        "network": function () {
            return Template.instance().network.get();
        }
    });

    Template.Home.rendered = function () {
        var tpl = Template.instance();

        navigator.geolocation.getCurrentPosition(function (position) {
            Session.set("geolocation", position);

            Meteor.call("venues", position.coords.latitude, position.coords.longitude, { limit: 2 }, function (err, res) {
                if (err) {
                    Session.set("errors", _.union(Session.get("errors"), [err]));
                    return;
                }
                tpl.popular.set(JSON.parse(res.content));
            });

            Meteor.call("trendsetters", position.coords.latitude, position.coords.longitude, { limit: 4 }, function (err, res) {
                if (err) {
                    Session.set("errors", _.union(Session.get("errors"), [err]));
                    return;
                }
                tpl.trendsetters.set(JSON.parse(res.content));
            });
        });

        // hard coded new york for demo :O
        Meteor.call("venues", 40.7033121, -73.979681, { limit: 2 }, function (err, res) {
            if (err) {
                Session.set("errors", _.union(Session.get("errors"), [err]));
                return;
            }
            tpl.trending.set(JSON.parse(res.content));
        });

        Meteor.call("network", function (err, res) {
            console.log(err, res, JSON.parse(res.content));
            if (err) {
                Session.set("errors", _.union(Session.get("errors"), [err]));
                return;
            }
            tpl.network.set(JSON.parse(res.content));
        });
    };
}