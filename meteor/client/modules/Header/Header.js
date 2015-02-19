if (Meteor.isClient) {

    Template.Header.events({
        "click .menu-toggle": function (e) {
            $("#menu").toggleClass("open");
        },
        "click #menu a": function (e) {
            $("#menu").removeClass("open");
        }
    });


    Template.HeaderDiscover.inheritsEventsFrom("Header");
    Template.HeaderDiscover.events({
        "click #menu-discover .drop-down-current": function (e) {
            $("#menu-discover").toggleClass("open");
        },
        "click #menu-discover a": function (e) {
            $("#menu-discover").removeClass("open");
            $("#menu-discover .label").html($(e.target).html());
//            Session.set("category", $("#menu-discover .label").html($(e.target).html()));
        }
    });
    Template.HeaderDiscover.rendered = function () {
        $("#menu-discover .label").html($("#menu-discover .active").html());
    };


    Template.HeaderStub.inheritsEventsFrom("Header");
    Template.HeaderStub.events({
        "click .menu-back": function (e) {
            history.back();
        }
    });

}
