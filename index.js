'use strict';

var loaderUtils = require( 'loader-utils' );

var SourceMap = require( 'source-map' );


var SourceNode = SourceMap.SourceNode;

var SourceMapConsumer = SourceMap.SourceMapConsumer;


module.exports = function ( source, map ) {

  var callback = this.async();

  var config = loaderUtils.getLoaderConfig( this, 'neighborLoader' );


  var interpolatePath = config.interpolatePath || function ( path, loaderContext ) {

    return loaderUtils.interpolateName( loaderContext, path, {} );

  };

  var path = interpolatePath( config.path, this );


  this.resolve( this.context, path, function ( error, result ) {

    if ( error ) return callback( null, source, map );


    var interpolatePrefix = config.interpolatePrefix || function ( prefix, path, loaderContext, result ) {

      return loaderUtils.interpolateName( loaderContext, prefix.replace( '[neighbor]', path ), {} );

    };

    var prefix = interpolatePrefix( config.prefix || 'require("[neighbor]");\n\n', path, this, result );


    if ( ! map ) return callback( null, prefix + source );


    var currentRequest = loaderUtils.getCurrentRequest( this );

    var node = SourceNode.fromStringWithSourceMap( source, new SourceMapConsumer( map ) );


    node.prepend( prefix );


    var result = node.toStringWithSourceMap( { file: currentRequest } );


    callback( null, result.code, result.map.toJSON() );

  }.bind( this ) );

};
