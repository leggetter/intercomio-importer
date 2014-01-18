var Intercom = require('intercom.io');

/**
 * Fetches all users from intercom.io.
 * By default the intercom.io API only gets 500 at a time.
 */
function UsersFetcher( options ) {
  this.options = options;

  this.allUsers = [];

  this.intercom = new Intercom( options.intercom );
}

/**
 * Kicks of the get users process.
 */
UsersFetcher.prototype.getUsers = function( listener ) {
  this.listener = listener;
  this._getNextUsers( 1 );
};

/**
 * Used for paging through the users.
 */
UsersFetcher.prototype._getNextUsers = function( page ) {
  var self = this;

  this.intercom.getUsers( {
    page: page
  }, function() {
    self.handleUsersResponse.apply( self, arguments );
  } );
};

/**
 * Handle response from the intercom.io API.
 */
UsersFetcher.prototype.handleUsersResponse = function( err, res ) {
  if( err ) {
    this.listener.reject( err );
    return;
  }
  else {
    var logging = 'Response: \n' +
                  'total_count: %s,\n' +
                  'page: %s,\n' +
                  'next_page: %s,\n' +
                  'previous_page: %s,\n' +
                  'total_pages: %s';
    console.log( logging,
                  res.total_count,
                  res.page,
                  res.next_page,
                  res.previous_page,
                  res.total_pages );

    this.allUsers = this.allUsers.concat( res.users );

    if( res.next_page ) {
      // todo: call with next page
      this.getNextUsers( res.next_page );
    }
    else {
      console.log( 'Got all users:' );
      console.log( this.allUsers );

      this.listener.resolve( this.allUsers );
    }
  }
};

module.exports = UsersFetcher;