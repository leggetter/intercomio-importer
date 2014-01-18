var csv = require('csv');

function CSVLoader() {
  this.rows = [];
  this.listener = null;
}

CSVLoader.prototype.load = function( options, listener ) {
  var self = this;

  self.options = options || {};
  self.listener = listener;

  self.firstRow = null;

  csv()
    .from.path( options.filePath, options.csvOptions )
    .on('record', function( row, index ) {
      if( self.options.mapFromFirstRow ) {
        if( index === 0 ) {
          self.firstRow = row;
        }
        else {
          var map = {};
          for( var i = 0, l = row.length; i < l; ++i ) {
            map[ self.firstRow[ i ] ] = row[ i ];
          }

          self.rows.push( map );
        }
      }
      else {
        // console.log('#'+index+' '+JSON.stringify(row));
        self.rows.push( row );
      }
    })
    .on('end', function( count ) {
      console.log( 'Rows (%s):', count );
      console.log( self.rows );
      self.listener.resolve( self.rows );
    })
    .on('error', function(error){
      self.listener.reject( error );
    });
}

module.exports = CSVLoader;