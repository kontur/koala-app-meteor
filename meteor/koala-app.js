

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

    Template.Venue.created = function () {
        this.venue = new ReactiveVar();
        this.images = new ReactiveVar();
    };
    Template.Venue.helpers({
        'venue': function () {
            return Template.instance().venue.get();
        },
        'images': function () {
            return Template.instance().images.get();
        }
    });
    Template.Venue.rendered = function () {
        var tpl = Template.instance();
        console.log("hello venue", this.data);
        Meteor.call("venue", this.data.id, function (err, res) {
            console.log("err", err, "res", res);
            console.log(JSON.parse(res.content));
            var contents = JSON.parse(res.content);

            tpl.venue.set(contents.venue);
            tpl.images.set(contents.images)
        });
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
        },

        "venue": function (id) {
            return Meteor.http.call("GET", getApiRoute("venue/" + id + "?"));
        }
    });


    function getApiRoute(endpoint) {
        console.log("getApiRoute", endpoint);
        return Meteor.settings['api'] + endpoint + "&access_token=" +
            (Meteor.user().services ? Meteor.user().services.instagram.accessToken : null);
    }
}


