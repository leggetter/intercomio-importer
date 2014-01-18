var UsersFetcher = require( __dirname + '/UserFetcher' );
var CSVLoader = require( __dirname + '/CSVLoader' );

function Importer( options ) {
  this.options = options;
}

Importer.prototype.getAllUsers = function( resolve, reject ) {
  var usersFetcher = new UsersFetcher( { intercom: this.options.intercom } );
  usersFetcher.getUsers( new Resolver( resolve, reject ) );
};

Importer.prototype.loadPractices = function( resolve, reject ) {
  var practiceLoader = new CSVLoader();
  practiceLoader.load( {
      filePath: this.options.practiceCSVPath,
      mapFromFirstRow: true
    },
    new Resolver( resolve, reject ) );
};

Importer.prototype.loadLocums = function( resolve, reject ) {
  var locumLoader = new CSVLoader();
  locumLoader.load( {
    filePath: this.options.locumCSVPath,
    mapFromFirstRow: true
  },
  new Resolver( resolve, reject ) );
};

/* Object definitinos */
function Resolver( resolve, reject ) {
  this.resolve = resolve;
  this.reject = reject;
}

function createPracticeUsers() {}

function createLocumUsers() {}

module.exports = Importer;