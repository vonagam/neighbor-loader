'use strict';

var loaderUtils = require( 'loader-utils' );

var SourceMap = require( 'source-map' );


var SourceNode = SourceMap.SourceNode;

var SourceMapConsumer = SourceMap.SourceMapConsumer;


var Combine = {

  withoutMap: {

    top: function ( source, addition ) { return addition + source; },

    bottom: function ( source, addition ) { return source + addition; },

  },

  withMap: {

    top: function ( sourceNode, addition ) { sourceNode.prepend( addition ); },

    bottom: function ( sourceNode, addition ) { sourceNode.add( addition ); },

  },

};


module.exports = function ( source, map ) {

  var callback = this.async();

  var config = loaderUtils.getLoaderConfig( this, 'neighborLoader' );


  var interpolatePath = config.interpolatePath || function ( path, loaderContext ) {

    return loaderUtils.interpolateName( loaderContext, path, {} );

  };

  var path = interpolatePath( config.path, this );


  this.resolve( this.context, path, function ( error, result ) {

    if ( error ) return callback( null, source, map );


    var interpolateRequiring = config.interpolateRequiring || function ( requiring, path, loaderContext, result ) {

      return loaderUtils.interpolateName( loaderContext, requiring.replace( '[neighbor]', path ), {} );

    };

    var requiring = interpolateRequiring( config.requiring || 'require("[neighbor]");\n\n', path, this, result );

    var position = config.position || 'top';


    if ( ! map ) return callback( null, Combine.withoutMap[ position ]( source, requiring ) );


    var currentRequest = loaderUtils.getCurrentRequest( this );

    var sourceNode = SourceNode.fromStringWithSourceMap( source, new SourceMapConsumer( map ) );


    Combine.withMap[ position ]( sourceNode, requiring );


    var result = sourceNode.toStringWithSourceMap( { file: currentRequest } );

    callback( null, result.code, result.map.toJSON() );

  }.bind( this ) );

};
