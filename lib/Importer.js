var UsersFetcher = require( __dirname + '/UserFetcher' );
var CSVLoader = require( __dirname + '/CSVLoader' );
var moment = require( 'moment' );
var Intercom = require('intercom.io');

/**
 * Main class for importing of data into intercom.io from BeeFound
 */
function Importer( options ) {
  this.options = options;

  this.intercom = new Intercom( options.intercom );
}

/**
 * gets all users from intercom.io
 */
Importer.prototype.getAllUsers = function( resolve, reject ) {
  var usersFetcher = new UsersFetcher( { intercom: this.options.intercom } );
  usersFetcher.getUsers( new Resolver( resolve, reject ) );
};

/**
 * Load practices from a CSV file
 */
Importer.prototype.loadPractices = function( resolve, reject ) {
  var practiceLoader = new CSVLoader();
  practiceLoader.load( {
      filePath: this.options.practiceCSVPath,
      mapFromFirstRow: true
    },
    new Resolver( resolve, reject ) );
};

/**
 * Load locums from a CSV file
 */
Importer.prototype.loadLocums = function( resolve, reject ) {
  var locumLoader = new CSVLoader();
  locumLoader.load( {
    filePath: this.options.locumCSVPath,
    mapFromFirstRow: true
  },
  new Resolver( resolve, reject ) );
};

/**
 * Syncs Locum users in intercom.io based on the passed in `users`.
 * Will not create users if a user with the same email is found in `existingUsers`.
 */
Importer.prototype.syncLocumUsers = function( users, existingUsers ) {
  this._createUsers( users, existingUsers, createIntercomUserFromLocum );
};

/**
 * Syncs Practice users in intercom.io based on the passed in `users`.
 * Will not create users if a user with the same email is found in `existingUsers`.
 */
Importer.prototype.syncPracticeUsers = function( users, existingUsers ) {
  this._createUsers( users, existingUsers, createIntercomUserFromPractice );
};

/**
 * Function that creates the users in intercom.io.
 * The `intercomUserWrapper` is a function used to do the mapping of CSV data to
 * a map as expected by the intercom.io API.
 */
Importer.prototype._createUsers = function( users, existingUsers, intercomUserWrapper ) {
  var self = this;

  var existingUserIds = getUserIds( existingUsers );

  console.log( 'Existing user emails: ', existingUserIds );

  users.forEach( function( user ) {
    var intercomUser = intercomUserWrapper( user );

    // Only create if user is not already in intercom.io
    if( existingUserIds.indexOf( intercomUser.user_id ) >= 0 ) {
     console.log( 'Updating user %s', intercomUser.email );
      self.intercom.updateUser( intercomUser, function() {
        self.apiResponse.apply( self, arguments );
      } );
    }
    else {
      console.log( 'Creating user %s', intercomUser.email );
      self.intercom.createUser( intercomUser, function() {
        self.apiResponse.apply( self, arguments );
      } );
    }

  } );
};

/**
 * Handle API response
 */
Importer.prototype.apiResponse = function( err, res ) {
  if( err ) {
    console.error( 'Error creating user' );
    console.error( err );
  }
};

/**
 * Map locum CSV map to intercom.io map.
 */
function createIntercomUserFromLocum( user ) {
// Locum columns:
// user_id,first_name,last_name,email,postcode,profile_completed,profile_completed_at,created_at,last_login
  var intercomUser = {
    "email" : user.email,
    "user_id" : user.user_id,
    "name" : user.first_name + ' ' + user.last_name,
    "created_at" : moment( user.created_at, 'DD/MM/YYYY HH:mm' ).unix(),
    "custom_data" : {
      "user_group" : "locum",
      "profile_completed_at": moment( user.profile_completed_at, 'DD/MM/YYYY HH:mm' ).unix(),
      "postcode": user.postcode
    },
    "last_request_at" : moment( user.last_login, 'DD/MM/YYYY HH:mm' ).unix()
  };
  return intercomUser;
}

/**
 * Map practice CSV map to intercom.io map.
 */
function createIntercomUserFromPractice( user ) {
// Practice columns:
// user_id,practice name,unique_id,contact_name,contact_email,nhs_board_name,last_login,
// activated_at,profile_completed,profile_completed_at
  var intercomUser = {
    "email" : user.contact_email,
    "user_id" : user.user_id,
    "name" : user.contact_name,
    "created_at" : moment( user.activated_at, 'DD/MM/YYYY HH:mm' ).unix(),
    "custom_data" : {
      "user_group" : "practice",
      "profile_completed_at": moment( user.profile_completed_at, 'DD/MM/YYYY HH:mm' ).unix(),
      "practice_name": user[ 'practice name' ],
      "nhs_board_name": user.nhs_board_name
    },
    "last_request_at" : moment( user.last_login, 'DD/MM/YYYY HH:mm' ).unix()
  };
  return intercomUser;
}

function getUserIds( users ) {
  var userIds = [];
  users.forEach( function( user ) {
    userIds.push( user.user_id );
  } );
  return userIds;
}

/* Object definitinos */
function Resolver( resolve, reject ) {
  this.resolve = resolve;
  this.reject = reject;
}

module.exports = Importer;