
define( [ "ui/lavalamp/lavalamp", "ui/ripple/ripple" ], function() {

    "use strict";

    var
    namespace = "$ui.tab",

    Tab = function( target, settings ) {

        var
        instance = this,

		/** Recent actived item */
		currentNav, currentTab;

		this.settings = settings;
		this.$node = target;

		this.$navs = target.find( "> div.nav > .item" );
		this.$tabs = target.find( "> div.content > .item" );

        /**
         * Set current tab
         * Priorty:
         *  .selected > settings.selected > :first
         * */
		currentNav = this.$navs.filter( ".selected:first" );
		if ( currentNav.length ) {

		    if ( settings.selected !== undefined ) {

		        currentNav = this.$navs.filter( "[" + settings.rule + "=" + settings.selected + "]" );
		    } else {
                currentNav = this.$navs.first();
		    }

		    currentNav.addClass( "selected" );
		}

		currentTab = this.$tabs.filter( "[" + settings.rule + "=" + currentNav.attr( settings.rule ) + "]" ).addClass( "selected" );

		this.$navs.not( currentNav ).removeClass( "selected" );
		this.$tabs.not( currentTab ).removeClass( "selected" );

        setTimeout( function() {

            var options = {
                selector4item   : ".item",
                indicator       : "<div class='indicator' />",
                animation       : settings.duration
            };

            if ( settings.vertical ) {

                options.properties = function( position, ele ) {

                    ele = ele[0];

                    return {
                        left    : position.left + "px",
                        top     : ele[ "offsetTop" ] + "px",
                        width   : ele.innerWidth() + "px",
                        height  : ele[ "offsetHeight" ] + "px"
                    };
                };
            }

            if ( settings.lavalamp ) {
                instance.lavalamp = target.find( "> div.nav" ).lavalamp( options );
            }

        }, 300 );

        if ( settings.ripple ) {
            this.$navs.each( function() {

                $( this ).addClass( "ui ripple" ).ripple();
            } );
        }

        target
		.delegate( ".nav > .item", "click", function( e ) {

			var
			self = $( this ),

			tab,

			/** Show page after the ajax has been completed */
			startup,

			index = self.attr( settings.rule ),

			/** Loaded page via ajax */
			page = self.attr( "data-page" ),

			dispatch = function() {

				var onSelect = settings.onSelect || {};

				if ( "function" === typeof onSelect
					|| typeof (onSelect = onSelect[ index ]) === "function" ) {

					onSelect.call( self, tab, settings );
				}
			},

			/** Shortcuts */
			navs = instance.$navs,
			tabs = instance.$tabs,
			class4success = settings.class4success, class4error = settings.class4error, class4loading = settings.class4loading;

            if ( self.is( "[disabled]" ) || self.hasClass( "selected" ) ) { return; }

			/** Generate index */
			undefined === index && page && self.attr( settings.rule, index = "tab" + +new Date());

			if ( !self.hasClass( "selected" ) && index !== undefined ) {

				tab = tabs.filter( "[" + settings.rule + "=" + index + "]:first" );

				/** Has been loaded */
				if ( tab.length ) {

					/** Clear the queue */
					startup = undefined;

					currentNav && currentNav.removeClass( "selected" );
					currentNav = self.removeClass( class4success ).addClass( "selected" );

					if ( currentTab ) {
						/** Disable slidedown */
						currentTab.removeClass( "selected" );
					}

					currentTab = tab.addClass( "selected" );
					dispatch( index, tab, settings );

					return;
				}

				if ( instance.render && instance.render[ index ] ) {

					var
					render = instance.render[ index ];

					startup = index;

					delete instance[ "render" ][ "index" ];

					tab = $( "<section class='item' " + settings.rule + "='" + index + "'>" )
						.attr( settings.rule, index )
						.html( typeof render === "string" ? render : render.call( self, settings ) );
				}

				/** Do Ajax call */
				else if ( page = page && page.replace( /^\s+|\s+$/g, "" ), page ) {

					if ( self.hasClass( class4loading ) ) {
						startup = index;
					} else {

						var callbacks = (instance[ "callbacks" ] || {}) [ index ] || {};

						/** Delete the references */
						delete (instance[ "callbacks" ] || {})[ index ];

						$.ajax( {

							url: page,
							dataType: "html",
							beforeSend: function() {
								startup = index;
								self.removeClass( class4error + " " + class4success ).addClass( class4loading );
							}
						} )
						.always( callbacks.always )
						.done( function( responseText ) {

							tab = $( "<section class='item'>" ).attr( settings.rule, index ).html( responseText );

							self.removeClass( class4loading );

							"function" === typeof callbacks.done && callbacks.done( tab );

							self.addClass( class4success );
						} )
						.fail( callbacks.fail, function( xhr ) {
							self.removeClass( [ class4loading, class4success ].join( " " ) ).addClass( class4error );
						} );
					}
				} else
				/** Invalid tab */
				self.removeClass( [ class4loading, class4success ].join( " " ) ).addClass( class4error );

				if ( tab.length ) {

					tabs.length
						? tabs.last().after( tab )
						: target.find( "> div.content" ).append( tab )
						;

					instance.$tabs = tabs = tabs.add( tab );
					instance.active( startup );
				}
			}
		} );
    };

	Tab.prototype = {

		add: function( items ) {

			var

			navs = this.$navs, tabs = this.$tabs,

			settings = this.settings,

			/** Active the tab */
			actived;

			items = items instanceof Array ? items : [ items ];

			for ( var i = 0, length = items.length; i < length; ++i ) {

				var item = items[ i ];

				if ( item.index &&
						/** Duplicate */
						!navs.filter( "[" + settings.rule + "=" + (item.name || item.index) + "]" ).length ) {

					var nav = $( [ "<div class='item' ", settings.rule, "='", item.index, "'>",
							item.name || item.index,
							"</div>" ].join( "" ) );

					item.page && nav.attr( "data-page", item.page );

					if ( "string function".indexOf( typeof item.render ) > -1 ) {

						if ( item.immediate ) {
							var
							tab,
							html = "",
							render = item.render;

							html = typeof render === "string" ? render : render.call( nav, settings );

							tab = $( "<section class='item' " + settings.rule + "='" + item.index + "'>" ).html( html );

							tabs.length
								? tabs.last().after( tab )
								: this.$node.find( "> div.content" ).append( tab )
								;

							tabs = this.$tabs = tabs.add( tab );
						} else {

							(this.render = this.render || {})

								/** Render tab content by HTML string or a function */
								[ item.index ] = item.render;
						}
					}

					/** Render the content by an ajax call */
					else if ( item.page ) {
						nav.attr( "data-page", item.page );

						(this.callbacks = this.callbacks || {})[ item.name ] = item.callbacks;
					}

					/** Update index */
					if ( !navs.length ) {
						this.$node.find( "> div.nav" ).append( nav );
					} else {
						navs.last().after( nav );
					}

					navs = this.$navs = navs.add( nav );

                    /** Add ink ripple effect */
					settings.ripple && nav.ripple();

                    /** Set the default selected */
					if ( settings.selected == item.index ) {
					    item.actived = true;
					}

					/** Set startup tab */
					actived = item.actived ? item.index : actived;
				}
			}

			actived && this.active( actived );

			return this;
		},

		remove: function( index ) {

			var
			settings = this.settings,
			navs = this.$navs,
			tabs = this.$tabs,

			selector;

			try {

				selector = "[" + settings.rule + "=" + index + "]";

				if ( index ) {
					navs.add( tabs ).filter( selector ).remove();

					this.callbacks && (delete this.callbacks[ index ]);
				}
			} catch( e ) {}
		},

		getTab: function( index ) {

			var settings = this.settings;

			try {
				if ( index ) {
					return this.$tabs.filter( "[" + settings.rule + "=" + index + "]" );
				} else {
					return this.$tabs.filter( "section.selected" );
				}
			} catch ( ex ) {}
		},

		active: function( index ) {

			var
			nav,
			settings = this.settings;

			try {
				nav = this.$navs.filter( "[" + settings.rule + "=" + index + "]" ).trigger( "click" );
				settings.lavalamp && this.lavalamp.move( nav );
			} catch( ex ) {
				/** Invalid selector */
			}
			return this;
		},

		isActive: function( index ) {

			var settings = this.settings;

			try {
				return this.$navs.filter( "[" + settings.rule + "=" + index + "]" ).is( ".selected" );
			} catch( ex ) {}
		},

		disabled: function( indexes ) {

		    var
		    navs = this.$navs,
		    settings = this.settings;

		    if ( indexes ) {

		        indexes = indexes instanceof Array ? indexes : [ indexes ];

		        while ( indexes.length ) {
		            navs.filter( "[" + settings.rule + "=" + indexes.pop() + "]" ).attr( "disabled", true );
		        }
		    } else {
		        navs.attr( "disabled", true );
		    }
		},

		enabled: function( indexes ) {

		    var
		    navs = this.$navs,
		    settings = this.settings;

		    if ( indexes ) {
		        indexes = indexes instanceof Array ? indexes : [ indexes ];

		        while ( indexes.length ) {
		            navs.filter( "[" + settings.rule + "=" + indexes.pop() + "]" ).removeAttr( "disabled" );
		        }
		    } else {
		        navs.removeAttr( "disabled" );
		    }
		}
	};

	$.fn.tab = function( options ) {

		var instance = this.data( namespace );

		if ( !instance ) {

			instance = new Tab( this, $.extend( {}, $.fn.tab.defaults, options || {} ) );

			this.data( namespace, instance );
		}
		return instance;
	};

	$.fn.tab.defaults = {

		rule 		    : "data-index",
		class4loading 	: "loading",
		class4error 	: "error",
		class4success 	: "success",

		selected        : 0,

		ripple          : true,
		vertical 	    : false,
		lavalamp 	    : true,

		duration 	    : 300
	};
} );
