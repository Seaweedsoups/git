
define( [ "ui/pagination/pagination-ng" ], function() {

    "use strict";

    angular
    .module( "demo.pagination", [ "$ui.pagination" ] )
    .controller( "paginationController", [ "$scope", function( $scope ) {

        $scope.init = function() {
            $.anchor( { offset: -60 } );
        };

        $scope.index = 7;

        $( ".ui.pagination:last" ).pagination( {
            max: 20,
            index: 1
        } );
    } ] );
} );

