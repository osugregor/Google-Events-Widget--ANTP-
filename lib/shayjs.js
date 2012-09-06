if (typeof (ShayJS) == "undefined") { ShayJS = {}; }

ShayJS.extend = function (a, c) {
	for (var b in c) {
		a[b] = c[b];
	}
	return a;
}

/*|*******************************************|
 *|			    Shay JS Library	              |
 *|*******************************************|*/
ShayJS.extend(ShayJS, {

	defaults: {
		fetch_interval: 10*60 // seconds
	},
	DEBUG: false,
	LOCAL_PREFIX: "shayJS",
	
	/* Looks in the locales for a formatted string */
	l: function(b, a) {
		if (typeof (chrome) != "undefined" && typeof (chrome.i18n) != "undefined") {
			return chrome.i18n.getMessage(b, a)
		}
		return b
	},
	
	set: function (a, b) {
        try {
            if (window.localStorage) {
                localStorage[this.LOCAL_PREFIX + '_' + a] = b
            }
        } catch (c) { this.error(c); }
    },
	
    get: function (a, namespace) {
        var b = "";
        try {
            if (window.localStorage) {
                b = localStorage[this.LOCAL_PREFIX + '_' + a]
            }
        } catch (c) { this.error(c); }
		
        if(b === undefined){
			if(namespace == undefined){
				namespace = this;
			}
			if(namespace.defaults != undefined){
				b = namespace.defaults[a];	
			}else{
				b = namespace.defaults;
			}
					
		}
        return b
    },
	
	remove: function(a) {
		try {
            if (window.localStorage) {
                b = localStorage.removeItem(this.LOCAL_PREFIX + '_' + a);
            }
        } catch (c) { this.error(c); }
	},

	/**
	 * A function that logs all its arguments if background.DEBUG_ is true.
	 * @param {string} message The message to log.
	 * @param {*=} opt_dump An optional set of parameters to show in the console.
	 */
	log: function(message, opt_dump) {
	  if (ShayJS.DEBUG) {
		if (opt_dump) {
		  window.console.log(message, opt_dump);
		} else {
		  window.console.log(message);
		}
	  }
	},
	
	/**
	 * A function that logs all its arguments if background.DEBUG_ is true.
	 * @param {string} message The message to log.
	 * @param {*=} opt_dump An optional set of parameters to show in the console.
	 */
	error: function(message, opt_dump) {
		if (opt_dump) {
		  window.console.log("ERROR: " + message, opt_dump);
		} else {
		  window.console.log("ERROR: " + message);
		}
	}	
	
})