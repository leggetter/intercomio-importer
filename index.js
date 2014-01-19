var Promise = require('es6-promise').Promise;
var Importer = require( __dirname + '/lib/Importer' );

// See config.json for details
var options = require( __dirname + '/config.json' );

/* Run the script */
var importer = new Importer( options );

var getAllUsersPromise = new Promise( function() {
  importer.getAllUsers.apply( importer, arguments );
} );
var loadPracticesPromise = new Promise( function() {
  importer.loadPractices.apply( importer, arguments );
} );
var loadLocumsPromise = new Promise( function() {
  importer.loadLocums.apply( importer, arguments );
} );

// Define that we can:
// 1. fetch all the users from intercom.io
// 2. load the practices from the CSV file
// 3. load the locums from the CSV file
// in any order.
var promises = [
  getAllUsersPromise,
  loadPracticesPromise,
  loadLocumsPromise
];

var existingUsers = null;
var practicesFromCsv = null;
var locumsFromCsv = null;

// Once all promises have been fulfiled...
Promise.all( promises )
  .then( function ( results ) {

    existingUsers = results[ 0 ];
    practicesFromCsv = results[ 1 ];
    locumsFromCsv = results[ 2 ];

    console.log( 'Existing Users:' );
    console.log( existingUsers.length );

    console.log( 'Practices from CSV' );
    console.log( practicesFromCsv.length );

    console.log( 'Locums from CSV' );
    console.log( locumsFromCsv.length );

    // ...we have all the data we need to create the Locum and Practices users on intercom.io
    importer.syncLocumUsers( locumsFromCsv, existingUsers );
    importer.syncPracticeUsers( practicesFromCsv, existingUsers );

  } )
  .catch( function( err ) {
    console.error( err );
  } );
