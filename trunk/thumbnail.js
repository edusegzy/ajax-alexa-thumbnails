/**
 * Ajax Alexa Thumbnails
 * 
 * @author		Eric Ferraiuolo <eferraiuolo@gmail.com>
 * @copyright	2008 Eric Ferraiuolo
 * @license		GNU LGPL <http://www.gnu.org/licenses/lgpl.html>
 */


(function(){
	// Throw error if YAHOO Global Object isn't defined.
	if (typeof YAHOO == "undefined")
		throw "YAHOO Golbal Object is required.";
	
	
	// Create EDF namespace if it doesn't exist
	if (typeof EDF == "undefined")
		EDF = {};
	
	
	/**
	 * Thumbnail: Object containing the Thumbnail Server and Thumbnail Widgets.
	 */
	EDF.Thumbnail = {};
	
	
	/**
	 * Thumbnail Dependencies: Object to handle YUI dependency management.
	 * 
	 * @class		Dependencies
	 * @singleton
	 */
	EDF.Thumbnail.Dependencies = function() {
		// Object to hold each modules YUI dependencies.
		var _modules = {
			Service:	["dom", "event", "connection"],
			Tooltip:	["container"]
		};
		
		// YUI Loader object.
		var _loader = null;
		
		
		return {
			
			/**
			 * Determines whether the YUI dependencies have been loaded.
			 * 
			 * @param		{String}	module
			 * @return		{Boolean}	loaded
			 * @public
			 */
			loaded: function(module) {
				// Make sure module is a string.
				if (!YAHOO.lang.isString(module))
					throw new TypeError("module must be a String.");
					
				// Make sure module is valid.
				if (YAHOO.lang.isUndefined(_modules[module]))
					throw module + " isn't a valid Thumbnail module";
				
				// Check the modules dependencies.
				switch(module) {
					case "Service":
						// Return true if all the dependencies are loaded.
						if (YAHOO.util.Dom && YAHOO.util.Event && YAHOO.util.Connect)
							return true;
						
						break;
						
					case "Tooltip":
						// Return true if all the dependencies are loaded.
						if (YAHOO.widget.Tooltip)
							return true;
							
						break;
				};
					
				// Throw error if dependencies aren't loaded and YUI Loader is undefined.
				if (!YAHOO.util.YUILoader)
					throw "YAHOO.util.Dom, YAHOO.util.Event, and YAHOO.util.Connect are required unless YAHOO.util.YUILoader is provided.";
					
				return false;
			},
			
			/**
			 * Loads the required YUI dependencies.
			 *
			 * @param		{String}	module
			 * @param		{Function}	callback
			 * @return		{void}
			 * @public
			 */
			load: function(module, callback) {
				// Make sure module is a string.
				if (!YAHOO.lang.isString(module))
					throw new TypeError("module must be a String.");
				
				// Make sure module is valid.
				if (YAHOO.lang.isUndefined(_modules[module]))
					throw module + " isn't a valid Thumbnail module";
				
				// Make sure callback is a function.
				if (!YAHOO.lang.isFunction(callback))
					throw new TypeError("callback must be a function.");
				
				// If the required dependencies are loaded call the callback function.
				if (this.loaded(module))
					return callback();
					
				// Create new YUI Loader and load required dependencies.
				_loader = new YAHOO.util.YUILoader({
					require:	_modules[module],
					onSuccess:	callback
				});
				
				_loader.insert();
			}
		};
	}();
	
	
	/**
	 * Thumbnail Service: Object to handle async retrevial and caching of website thumbnails.
	 * 
	 * @class		Service
	 * @singelton
	 */
	EDF.Thumbnail.Service = function(){
		
		/**
		 * Hold the initialization state.
		 * 
		 * @property	{Boolean}	_initialized
		 * @private
		 */
		var _initialized = false;
		
		/**
		 * URL of server-side Thumbnail Get script.
		 * 
		 * @property	{String}	_sourceURL
		 * @private
		 */
		var _sourceURL = null;
		
		/**
		 * A cache of server-side requests and responses.
		 * 
		 * @property	{Array}		_cache
		 * @private
		 */
		var _cache = [];
		
		/**
		 * URL Root - Returns the hostname for a URL.
		 *
		 * @param		{String}	url
		 * @return		{String}	hostname
		 * @private
		 */
		var urlRoot = function(url) {
			// Make sure a URL exists and is a String
			if (!YAHOO.lang.isString(url)) 
				throw new TypeError("url must be a string.");
			
			// Helper function to determine if URL is a URI
			var isAbsolute = function(url) {
				if (url.indexOf("http://") == 0) 
					return true;
				else 
					return false;
			};
			
			// Return the hostname if URL is a URI
			if (isAbsolute(url)) 
				return url.substring(7, url.indexOf("/", 7) >= 0 ? url.indexOf("/", 7) : url.length);
			else 
				return url;
		};
		
		/**
		 * Get Cached - Checks the cache and returns the response if thumbnail for the URL is cached.
		 *
		 * @param		{String}	url
		 * @return		{String}	cachedResponse
		 * @private
		 */
		var getCached = function(url) {
			// Make sure a URL exists and is a String
			if (!YAHOO.lang.isString(url)) 
				throw new TypeError("url must be a string.");
			
			// Loop over the cache to check for an entry matching the URL
			for (var i in _cache) 
				if (urlRoot(url) == _cache[i].request) 
					return _cache[i].response;
			
			// No cache entry was found for the URL
			return null;
		};
		
		/**
		 * Set Cached - Saves a request-response pair to cache.
		 *
		 * @param		{String}	url
		 * @param		{String}	response
		 * @return		{String}	response
		 * @private
		 */
		var setCached = function(url, response) {
			// Make sure a URL exists and is a String
			if (!YAHOO.lang.isString(url)) 
				throw new TypeError("url must be a string.");
				
			// Make sure a response has been defined
			if (YAHOO.lang.isUndefined(response)) {
				throw new TypeError("response must be defined.");
				return null;
			}
			
			// Check if request is cached and update response
			for (var i in _cache) 
				if (urlRoot(url) == _cache[i].request) 
					return _cache[i].response = response;
			
			// Append request-response pair to the cache
			_cache.push({
				request:	urlRoot(url),
				response:	response
			});
			
			return response;
		};
		
		
		return {
			
			/**
			 * Initialize - Setup the Thumbnail object with a sourceURL.
			 *
			 * @param		{String}	sourceURL
			 * @return		{Boolean}	isInitialized
			 * @public
			 */
			init: function(sourceURL, callback) {
				// Wrap initialization to check dependencies first.
				var initialize = function() {
					// Make sure sourceURL is a String
					if (!YAHOO.lang.isString(sourceURL)) 
						throw new TypeError("sourceURL must be a string.");
						
					// Make sure callback is a function
					if (!YAHOO.lang.isFunction)
						throw new TypeError("callback must be a function.");
					
					// Set the sourceURL
					_sourceURL = sourceURL;
					
					// Set initialized flag
					_initialized = true;
					
					// Call the callback function
					callback();
				};
				
				// Make sure dependencies are loaded
				if (EDF.Thumbnail.Dependencies.loaded("Service"))
					initialize();
				else
					EDF.Thumbnail.Dependencies.load("Service", initialize);
			},
			
			/**
			 * Get Thumbnail - Retreives a thumbnail for a URL and caches the result.
			 *
			 * @param		{String}	url
			 * @param		{Function}	callback
			 * @return		void
			 * @public
			 */
			getThumbnail: function(url, callback) {
				// Make sure the Service is initialized
				if (!_initialized)
					throw "Thumbnail Service hasn't been initialized.";
				
				// Make sure a sourceURL exists and is a String
				if (!YAHOO.lang.isString(url))
					throw new TypeError("url must be a string.");
					
				// Make sure a callback exists and is a Function
				if (!YAHOO.lang.isFunction(callback))
					throw new TypeError("callback must be a function.");
				
				// Check the cache to avoid async call to server
				var thumbnail = getCached(url);
				if (YAHOO.lang.isValue(thumbnail)) 
					return callback(thumbnail);
				
				// Make sure a Source URL is set to lookup thumbnails from
				if (!YAHOO.lang.isString(_sourceURL))
					throw new Error("Thumbnail Service must be initialized.");
				
				// Async call to server to get and cache the thumbnail for a URL
				var request = YAHOO.util.Connect.asyncRequest("GET", _sourceURL + url, {
					success: function(response) {
						return callback(setCached(url, response.responseText));
					},
					
					failure: function(response) {
						return callback(null);
					}
				});
			}
		};
	}();
	
	
	/**
	 * Thumbnail Tooltip: Wrapper to provide a tooltip for a thumbnail image.
	 * 
	 * @param		{HTMLElement|String}	element
	 * @param		{Object}				config
	 * @return		{void}
	 * @constructor
	 * @public
	 */
	EDF.Thumbnail.Tooltip = function(element, config) {
		var setTooltip = function() {
			this.toolTip = new YAHOO.widget.Tooltip(element, config);
			
			this.toolTip.contextTriggerEvent.subscribe(function(type, args) {
				var toolTip = this;
				var context = args[0];
				var url = context.getAttribute("href");
				
				if (url) {
					toolTip.cfg.setProperty("text", '<img alt="Loading..." src="img/loading.gif" />');
				
					EDF.Thumbnail.Service.getThumbnail(url, function(thumbnail){
						toolTip.cfg.setProperty("text", thumbnail);
					});
				}
			});
		};
		
		// Make sure dependencies are loaded
		if (EDF.Thumbnail.Dependencies.loaded("Tooltip"))
			setTooltip();
		else
			EDF.Thumbnail.Dependencies.load("Tooltip", setTooltip);
	};
})();
