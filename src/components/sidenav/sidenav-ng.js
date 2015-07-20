
define( [ "ui/sidenav/sidenav" ], function() {

"use strict";

angular.module( "$ui.sidenav", [] )
    .directive( "sSidenav", [ "$rootScope", function( $rootScope ) {

        function link( $scope, $element, $attrs ) {

            var sidenav;

            if ( $scope.templateUrl ) {

            }

            /** Detach from the document root */
            $element.detach();

            sidenav = $.sidenav( {
                render  : function( deferred, loading, close ) {

                    this.html( $element );
                    deferred.resolve();
                },
                unload  : $scope.unload
            } );

            if ( "object" === typeof $scope.instance ) {
                angular.extend( $scope.instance, sidenav );
            } else
                $scope.instance = sidenav;

            $rootScope.$$phase || $scope.$apply();
        }

        return {

            scope           : {
                instance    : "=controller",
                templateUrl : "@",
                unload      : "&"
            },

            restric         : "E",

            transclude      : true,
            replace         : true,
            template        : "<div class='ui sidenav' ng-transclude></div>",
            link            : link
        };
    } ] );
} );
