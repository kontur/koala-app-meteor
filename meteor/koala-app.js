if (Meteor.isClient) {

    Meteor.subscribe("users");

    console.log("startup", Meteor.user());

    Tracker.autorun(function () {
        var foo = Meteor.user();
        console.log("autorun", Meteor.user(), foo ? foo.services.instagram.accessToken : null);

    });

    console.log(Meteor.call("test", function (err, res) {
        console.log("err", err, "res", res);
        console.log(JSON.parse(res.content));
    }));

}

if (Meteor.isServer) {
    Meteor.publish("users", function () {
        return Meteor.users.find(this.userId, {fields: {"services.instagram.accessToken": 1}});
    });

    Meteor.methods({
        "test": function () {
            return Meteor.http.call("GET", "http://0.0.0.0:5000/api/venues/show/60.1896861/24.8386975?access_token=" +
            (Meteor.user().services ? Meteor.user().services.instagram.accessToken : null));
        }
    });
}


