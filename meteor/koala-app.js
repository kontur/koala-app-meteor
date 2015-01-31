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

    Template.ApplicationLayout.helpers({
        username: function () {
            return Meteor.user().services.instagram.username;
        },
        errors: function () {
            return Session.get('errors');
        }
    });


}


if (Meteor.isServer) {
    console.log("Meteor.settings", Meteor.settings);

    Meteor.publish("users", function () {
        console.log(Meteor.users.find(this.userId));
        return Meteor.users.find(this.userId, {fields: {
            "services.instagram.accessToken": 1,
            "services.instagram.profile_picture": 1,
            "services.instagram.username": 1
        }});
    });

    Meteor.methods({
        "venues": function (lat, lng, opt) {
            var category = null;
            var options = {};
            var defaults = {
                limit: 3
            };

            if (opt.category) {
                category = opt.category;
                delete opt.category;
            }
            options = _.extend(defaults, opt);

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


