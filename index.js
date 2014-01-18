var Promise = require('es6-promise').Promise;

var Importer = require( __dirname + '/lib/Importer' );

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

var promises = [
  getAllUsersPromise,
  loadPracticesPromise,
  loadLocumsPromise
];

var existingUsers = null;
var practicesFromCsv = null;
var locumsFromCsv = null;

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

  } )
  .catch( function( err ) {
    console.error( err );
  } );




// // To create a user
// intercom.createUser({
//   "email" : "ben@intercom.io",
//   "user_id" : "7902",
//   "name" : "Ben McRedmond",
//   "created_at" : 1257553080,
//   "custom_data" : {"plan" : "pro"},
//   "last_seen_ip" : "1.2.3.4",
//   "last_seen_user_agent" : "ie6",
//   "companies" : [
//     {
//       "id" : 6,
//       "name" : "Intercom",
//       "created_at" : 103201,
//       "plan" : "Messaging",
//       "monthly_spend" : 50
//     }
//   ],
//   "last_request_at" : 1300000000
// }, function(err, res) {
//   // err is an error object if there was an error
//   // res is **JSON** response
//   // In this case:
//   // {
//   //   "intercom_id": "52322b3b5d2dd84f23000169",
//   //   "email": "ben@intercom.io",
//   //   "user_id": "7902",
//   //   "name": "Ben McRedmond",
//   //   "created_at": 1257553080,
//   //   "last_impression_at": 1300000000,
//   //   "custom_data": {
//   //     "plan": "pro"
//   //   },
//   // ...
//   // ...
//   // ...
//   //   "session_count": 0,
//   //   "last_seen_ip": "1.2.3.4",
//   //   "last_seen_user_agent": "ie6",
//   //   "unsubscribed_from_emails": false
//   // }
// });