

Router.route('/', function () {
    this.render('Home');
});

Router.route('/explore', function () {
    this.render('Explore');
});

Router.route('/search', function () {
    this.render('Search');
});