
define( [ "ui/modal/modal" ], function( undefined ) {

"use strict";

angular.module( "$ui.modal", [] )
	.factory( "$modal", [ "$rootScope", "$controller", "$q", "$http", "$templateCache", "$compile",

function( $rootScope, $controller, $q, $http, $templateCache, $compile ) {

	var
	defaults = {

		scope 		    : undefined,
		template        : undefined,
		templateUrl     : undefined
		/** Overwrite the jQuery plugin default settings */
	},

	Modal = function( options ) {

		var
		$modal,
		scope,
        settings,
		html,
		deferred;

		if ( !options.template && !options.templateUrl ) {
			throw new Error( "Expected modal to have exacly one of either 'template' or 'templateUrl'" );
		}

		if ( options.template ) {
            html = options.template;
		} else {

            deferred = $.Deferred();

            html = function( deferred, loading, close ) {
                var
                self = $( this );

                $.ajax( {
                    url: options.templateUrl,
                    dataType: "html"
                } )
                .done( function( data ) {
                    self.html( data );
                    deferred.resolve();
                } );
            };
		}

        settings = angular.extend( {}, defaults, options, {

            /** Overwite the jQuery plugin default settings */
            render 	: html,
            autoShow: true
        } );

        $modal = $.modal( settings );

        $.when( deferred ).done( function() {
            $compile( $modal.$node )( scope );
        } );

        return $modal;
	};

	return {
		open: function( options ) {
			return Modal( options );
		}
	};
} ] );

} );
