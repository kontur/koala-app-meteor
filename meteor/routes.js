Router.route('/', function () {
    this.render('Home');
});



Router.route('/explore', function () {
    this.render('Explore', {
        data: {
            'top_nightlife': Venues.find({type: 'nightlife'}, { limit: 3 }),
            'top_hotels': Venues.find({type: 'hotels'}, { limit: 3}),
            'top_food': Venues.find({type: 'food'}, {limit: 3}),
            'top_cafes': Venues.find({type: 'cafes'}, {limit: 3})
        }
    });
});

Router.route('/explore/:category', function () {
    this.render('ExploreCategory', {
        data: {
            'category': this.params.category,
            'venues': Venues.find({type: this.params.category}, { limit: 10})
        }
    });
});


Router.route('/search', function () {
    this.render('Search');
});