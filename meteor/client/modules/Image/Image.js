if (Meteor.isClient) {
    Template.Image.events({
        "click .image-comments .view-comments": function (e) {
            var tpl = Template.instance();

            Meteor.call("image_comments", Template.instance().data.instagram_id, function (err, res) {
                if (err) {
                    Session.set("errors", _.union(Session.get("errors"), [err]));
                    return;
                }
                tpl.comments.set(JSON.parse(res.content));
            });
        }
    });

    Template.Image.created = function () {
        this.comments = new ReactiveVar();
    };

    Template.Image.rendered = function () {
        console.log("image", this);

        var tpl = this;

        Meteor.call("image_comments", Template.instance().data.instagram_id, function (err, res) {
            if (err) {
                Session.set("errors", _.union(Session.get("errors"), [err]));
                return;
            }
            tpl.comments.set(JSON.parse(res.content));
        });
    };

    Template.Image.helpers({
        "comments": function () {
            return Template.instance().comments.get();
        }
    });
}