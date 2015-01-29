

// http://stackoverflow.com/questions/1714786/querystring-encoding-of-a-javascript-object
serializeQueryString = function (obj) {
    var str = [];
    for (var p in obj)
        if (obj.hasOwnProperty(p)) {
            str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
        }
    return str.join("&");
};

if (Meteor.isClient) {

    Meteor.subscribe("users");

    console.log("startup", Meteor.user());


    Template.Explore.created = function () {
        console.log("created");
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
        console.log("rendered");

        var tpl = Template.instance();

        navigator.geolocation.getCurrentPosition(function (position) {
            Session.set("geolocation", position);

            Meteor.call("venues", position.coords.latitude, position.coords.longitude, { category: 'food' }, function (err, res) {
                console.log("venues call food example", JSON.parse(res.content));
                tpl.food.set(JSON.parse(res.content));
            });
            Meteor.call("venues", position.coords.latitude, position.coords.longitude, { category: 'nightlife', limit: 2 }, function (err, res) {
                tpl.nightlife.set(JSON.parse(res.content));
            });
            Meteor.call("venues", position.coords.latitude, position.coords.longitude, { category: 'cafes' }, function (err, res) {
                tpl.cafes.set(JSON.parse(res.content));
            });
            Meteor.call("venues", position.coords.latitude, position.coords.longitude, { category: 'hotels' }, function (err, res) {
                tpl.hotels.set(JSON.parse(res.content));
            });
        });
    };

    Template.ExploreCategory.rendered = function () {
        var category = this.data.category;
        console.log("cate", category);
        navigator.geolocation.getCurrentPosition(function (position) {
            Session.set("geolocation", position);
            Meteor.call("venues", position.coords.latitude, position.coords.longitude, { category: category, limit: 10 }, function (err, res) {
                $.each(JSON.parse(res.content), function (index, elem) {
                    Venues.insert($.extend(elem, {type: category, cover: elem.instagram}));
                });
            });
        })
    };


    Template.Venue.rendered = function () {

    };

}


if (Meteor.isServer) {
    console.log("Meteor.settings", Meteor.settings);

    Meteor.publish("users", function () {
        return Meteor.users.find(this.userId, {fields: {"services.instagram.accessToken": 1}});
    });


    Meteor.methods({
        "venues": function (lat, lng, opt) {
            var category = null;
            if (opt.category) {
                category = opt.category;
                delete opt.category;
            }
            var defaults = {
                limit: 3
            };
            var options = _.extend(defaults, opt);
            console.log(options);
            console.log("Meteor.methods venues ", getApiRoute("venues/show/" + lat + "/" + lng +
                (category ? "/" + category : "") + "?" + serializeQueryString(options)));

            return Meteor.http.call("GET", getApiRoute("venues/show/" + lat + "/" + lng +
                (category ? "/" + category : "") + "?" + serializeQueryString(options)));
        }
    });


    function getApiRoute(endpoint) {
        return Meteor.settings['api'] + endpoint + "&access_token=" +
            (Meteor.user().services ? Meteor.user().services.instagram.accessToken : null);
    }
}


