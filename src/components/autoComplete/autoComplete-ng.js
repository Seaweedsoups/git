
define( [ "ui/autoComplete/autoComplete" ], function() {

"use strict";

/**
 * example:
 *
 <s-autoComplete items="items" value-key="value" text-key="text">
     {{ $name }} - {{ $value }}
 </s-autoComplete>
 * */

angular.module( "$ui.autoComplete", [] )
    .directive( "sAutocomplete", [ "$rootScope", "$compile", function( $rootScope, $compile ) {

        function link( $scope, $element, $attrs, undefined, link ) {

            var
            options = {},
            autoComplete,
            transclude,
            markup,
            html,
            inProgress = false,
            isolateBindings = $scope.$$isolateBindings;

            for ( var key in isolateBindings ) {

                var attr = isolateBindings[ key ];

                if ( attr.attrName in $attrs.$attr ) {
                    options[ key ] = $scope[ key ];
                }
            }

            transclude = link( $scope );
            markup = transclude.parent().html().trim();
            transclude.remove();

            if ( markup ) {
                options.formatter = function( value, text, index, highlightText, query, settings ) {

                    html = markup
                        .replace( /\{\{\s*\$value\s*\}\}/g, value )
                        .replace( /\{\{\s*\$text\s*\}\}/g, highlightText )
                        ;

                    html = $compile( html )( $scope.$parent );
                    $scope.$parent.$apply();
                    html = html[0][ "innerHTML" ];

                    return "<li value='" + value + "' data-index='" + index + "'>" + html + "</li>";
                };
            }

            options.set = function( data, settings ) {

                if ( !$rootScope.$$phase ) {

                    inProgress = !inProgress;

                    $scope.value = data;
                    $scope.$apply();

                    inProgress = !inProgress;
                }
            };

            autoComplete = $( $element ).autoComplete( options ).val( $scope.value );

            $scope.$watch( "value", function( value ) {
                !inProgress && autoComplete.val( value );
            } );
        }

        return {
            scope: {
                lookup          : "=data",
                minChars        : "@",
                valueKey        : "@",
                textKey         : "@",
                breaksize       : "@",
                inputAnything   : "@",
                highlight       : "@",
                showHint        : "@",
                fuzzy           : "@",
                localMatch      : "@",
                autoSelect      : "@",
                tabComplete     : "@",
                placeholder     : "@",
                value           : "=ngModel"
            },

            transclude          : true,
            replace             : true,
            template            : '<div class="ui autoComplete">' +
                                    '<input class="ui text front" type="text" />' +
                                    '<input class="ui text hint" type="text" tabindex="-1" />' +
                                    '<i class="icon"></i>' +
                                  '</div>',
            link                : link
        };
    } ] );
} );
