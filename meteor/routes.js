Router.configure({
    layoutTemplate: 'ApplicationLayout',
    loadingTemplate: 'Loading'
//    notFoundTemplate: 'notFound',
});

Router.route('/', function () {
    this.render('Home', {
        to: 'main'
    });
});



Router.route('/explore', function () {
    this.render('Explore', {
        to: 'main'
    });
});

Router.route('/explore/:category', function () {
    this.render('ExploreCategory', {
        to: 'main',
        data: {
            'category': this.params.category
        }
    });
});


Router.route('/venue/:id', function () {
    console.log("venue", this.params.id);
    this.render('Venue', {
        to: 'main',
        data: {
            id: this.params.id
        }
    });
});


Router.route('/search', function () {
    this.render('Search', {
        to: 'main'
    });
});