Router.route('/', function () {
    this.render('Home');
});


Venues = new Meteor.Collection(null);

Router.route('/explore', function () {
    Meteor.call("test", function (err, res) {
        console.log("err", err, "res", res);
        $.each(JSON.parse(res.content), function (index, elem) {
            console.log(elem, elem.instagram);
            console.log($.extend(elem.instagram, elem.venue, {type: 'bars'}));
            Venues.insert($.extend(elem.instagram, elem.venue, {type: 'bars'}));
        });
    });

    this.render('Explore', {
        data: {
            'top_bars': Venues.find({type: 'bars'}, { limit: 3 })
        }
    });
});

Router.route('/explore/:category', function () {
    this.render('ExploreCategory', {
        data: {
            foo: 'bar'
        }
    });
});


Router.route('/search', function () {
    this.render('Search');
});