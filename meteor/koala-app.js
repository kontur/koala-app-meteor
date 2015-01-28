Venues = new Meteor.Collection(null);


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


    Template.Explore.rendered = function () {
        navigator.geolocation.getCurrentPosition(function (position) {
            Session.set("geolocation", position);
            Meteor.call("venues", position.coords.latitude, position.coords.longitude, { category: 'nightlife' }, function (err, res) {
                $.each(JSON.parse(res.content), function (index, elem) {
                    Venues.insert($.extend(elem.instagram, elem.venue, {type: 'nightlife'}));
                });
            });
            Meteor.call("venues", position.coords.latitude, position.coords.longitude, { category: 'food' }, function (err, res) {
                $.each(JSON.parse(res.content), function (index, elem) {
                    Venues.insert($.extend(elem.instagram, elem.venue, {type: 'food'}));
                });
            });
            Meteor.call("venues", position.coords.latitude, position.coords.longitude, { category: 'cafes' }, function (err, res) {
                $.each(JSON.parse(res.content), function (index, elem) {
                    Venues.insert($.extend(elem.instagram, elem.venue, {type: 'cafes'}));
                });
            });
            Meteor.call("venues", position.coords.latitude, position.coords.longitude, { category: 'hotels' }, function (err, res) {
                $.each(JSON.parse(res.content), function (index, elem) {
                    Venues.insert($.extend(elem.instagram, elem.venue, {type: 'hotels'}));
                });
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
                    Venues.insert($.extend(elem.instagram, elem.venue, {type: category}));
                });
            });
        })
    }

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
            var options = _.extend(defaults, options);
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


