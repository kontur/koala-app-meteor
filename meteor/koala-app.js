

if (Meteor.isClient) {

    Meteor.subscribe("users");

    console.log("startup", Meteor.user());

    //Tracker.autorun(function () {
    //    var user = Meteor.user();
    //    console.log("autorun", Meteor.user(), user ? user.services.instagram.accessToken : null);
    //
    //});
}


if (Meteor.isServer) {
    console.log("Meteor.settings", Meteor.settings);

    Meteor.publish("users", function () {
        return Meteor.users.find(this.userId, {fields: {"services.instagram.accessToken": 1}});
    });



    Meteor.methods({
        "test": function () {
            return Meteor.http.call("GET", getApiRoute("venues/show/60.1896861/24.8386975"));
        },

        "top_bars": function () {
            return Meteor.http.call("GET", getApiRoute("venues/show/60.1896861/24.8386975"));
        }
    });



    function getApiRoute(endpoint) {
        return Meteor.settings['api'] + endpoint + "?access_token=" +
            (Meteor.user().services ? Meteor.user().services.instagram.accessToken : null);
    }
}


