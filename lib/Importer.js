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
 * Create Locum users in intercom.io based on the passed in `users`.
 * Will not create users if a user with the same email is found in `existingUsers`.
 */
Importer.prototype.createLocumUsers = function( users, existingUsers ) {
  this._createUsers( users, existingUsers, createIntercomUserFromLocum );
};

/**
 * Create Practice users in intercom.io based on the passed in `users`.
 * Will not create users if a user with the same email is found in `existingUsers`.
 */
Importer.prototype.createPracticeUsers = function( users, existingUsers ) {
  this._createUsers( users, existingUsers, createIntercomUserFromPractice );
};

/**
 * Function that creates the users in intercom.io.
 * The `intercomUserWrapper` is a function used to do the mapping of CSV data to
 * a map as expected by the intercom.io API.
 */
Importer.prototype._createUsers = function( users, existingUsers, intercomUserWrapper ) {
  var self = this;

  var existingEmails = getAllEmails( existingUsers );

  console.log( 'Existing user emails: ', existingEmails );

  users.forEach( function( user ) {
    var intercomUser = intercomUserWrapper( user );

    // Only create if user is not already in intercom.io
    if( !intercomUser.email || intercomUser.email === 'NULL' ) {
      console.error( 'User must have an email: ', intercomUser );
    }
    else if( existingEmails.indexOf( intercomUser.email ) >= 0 ) {
      console.log( 'User with email %s already found in intercom.io', user.email );
    }
    else {
      console.log( 'creating user %s', intercomUser.email );
      self.intercom.createUser( intercomUser, function() {
        self.createUserResponse.apply( self, arguments );
      } );
    }

  } );
};

/**
 * Handle API response
 */
Importer.prototype.createUserResponse = function( err, res ) {
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
      "user_group" : "locum"
    },
    // "last_seen_ip" : "1.2.3.4",
    // "last_seen_user_agent" : "ie6",
    // "companies" : [
    //   {
    //     "id" : 6,
    //     "name" : "Intercom",
    //     "created_at" : 103201,
    //     "plan" : "Messaging",
    //     "monthly_spend" : 50
    //   }
    // ],
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
    "name" : user[ 'practice name' ],
    "created_at" : moment( user.activated_at, 'DD/MM/YYYY HH:mm' ).unix(),
    "custom_data" : {
      "user_group" : "practice"
    },
    // "last_seen_ip" : "1.2.3.4",
    // "last_seen_user_agent" : "ie6",
    // "companies" : [
    //   {
    //     "id" : 6,
    //     "name" : "Intercom",
    //     "created_at" : 103201,
    //     "plan" : "Messaging",
    //     "monthly_spend" : 50
    //   }
    // ],
    "last_request_at" : moment( user.last_login, 'DD/MM/YYYY HH:mm' ).unix()
  };
  return intercomUser;
}

function getAllEmails( users ) {
  var emails = [];
  users.forEach( function( user ) {
    emails.push( user.email );
  } );
  return emails;
}

/* Object definitinos */
function Resolver( resolve, reject ) {
  this.resolve = resolve;
  this.reject = reject;
}

module.exports = Importer;