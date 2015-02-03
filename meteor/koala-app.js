if (Meteor.isClient) {

    Meteor.subscribe("users");
    console.log("startup", Meteor.user());

    Template.Shell.helpers({
        username: function () {
            return Meteor.user().services.instagram.username;
        },
        errors: function () {
            return Session.get("errors");
        }
    });


    Template.Shell.events({
        "click #header .menu-toggle": function (e) {
            $("#nav").toggleClass("open");
        },
        "click #nav a": function (e) {
            $("#nav").removeClass("open");
        },
        "click .user-logout": function (e) {
            Meteor.logout();
        },
        "click .user-login": function (e) {
            console.log("hello login");
            Meteor.loginWithInstagram(function (err, res) {
                console.log(err, res);
                if (err !== undefined)
                    console.log('sucess ' + res)
                else
                    console.log('login failed ' + err)
            });
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
        },

        "image_comments": function (id) {
            return Meteor.http.call("GET", getApiRoute("image_comments/" + id + "?"))
        },

        "trendsetters": function (lat, lng, opt) {
            var options = {};
            var defaults = {
                limit: 4
            };
            options = _.extend(defaults, opt);
            return Meteor.http.call("GET", getApiRoute("trendsetters/" + lat + "/" + lng + "?" + serializeQueryString(options)));
        },

        "network": function () {
            return Meteor.http.call("GET", getApiRoute("user/network/feed?"));
        }
    });


    // Helpers

    // TODO refactor this to automatically check if to add ? or not so calls will be easier
    function getApiRoute(endpoint) {
        console.log("getApiRoute", endpoint);
        return Meteor.settings["api"] + endpoint + "&access_token=" +
            (Meteor.user().services ? Meteor.user().services.instagram.accessToken : null);
    }


    // http://stackoverflow.com/questions/1714786/querystring-encoding-of-a-javascript-object
    function serializeQueryString(obj) {
        var str = [];
        for (var p in obj)
            if (obj.hasOwnProperty(p)) {
                str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
            }
        return str.join("&");
    };

}


