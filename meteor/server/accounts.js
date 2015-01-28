ServiceConfiguration.configurations.remove({service: "instagram"});
ServiceConfiguration.configurations.insert({
    service: "instagram",
    clientId: Meteor.settings['instagramClientId'],
    scope: "basic",
    secret: Meteor.settings['instagramClientSecret']
});