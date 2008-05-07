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
	var Dependencies = function() {
		/**
		 * Holds each modules YUI dependencies.
		 * 
		 * @property	{Object}	_modules
		 * @private
		 */
		var _modules = {};
		
		/**
		 * YUI Loader object.
		 * 
		 * @property	{Object}	loader
		 */
		var _loader = null;
		
		
		var Public = {
			
			/**
			 * Registers a module with it's YUI dependencies.
			 * 
			 * @param		{String}	module
			 * @param		{Object}	data
			 * @return		{void}
			 */
			addModule: function(module, data) {
				// Make sure module is a String.
				if (!YAHOO.lang.isString(module))
					throw new TypeError("module must be a String.");
					
				// Make sure the module isn't already defined.
				if (!YAHOO.lang.isUndefined(_modules[module]))
					throw new TypeError("Module: " + module + " is already defined.");
					
				// Make sure requires is a String or Array.
				if (!YAHOO.lang.isObject(data))
					throw new TypeError("data must be an Object.");
					
				// Register module and it's dependencies.
				_modules[module] = data;
			},
			
			/**
			 * Checks for and loads (if needed) the required YUI dependencies.
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
					
				// Check if required dependencies are loaded and loaded them if needed.
				if (_modules[module].loaded()) {
					return callback();
					
				} else if (!YAHOO.util.YUILoader) {
					
					throw "YUI dependencies: " + _modules[module] + " are required unless YAHOO.util.YUILoader is provided.";
					
				} else {
					
					// Create new YUI Loader and load required dependencies.
					_loader = new YAHOO.util.YUILoader({
						require:	_modules[module].requires,
						onSuccess:	callback
					});
					
					_loader.insert();
				}
			}
		};
		
		
		return Public;
	}();
	
	
	/**
	 * Thumbnail Service: Object to handle async retrevial and caching of website thumbnails.
	 * 
	 * @class		Service
	 * @singelton
	 */
	EDF.Thumbnail.Service = function(){
		
		/**
		 * List of required YUI dependencies.
		 * 
		 * @property	{Array}		requires
		 * @private
		 */
		var _requires = ["dom", "event", "connection"];
		
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
		var _urlRoot = function(url) {
			// Make sure a URL exists and is a String
			if (!YAHOO.lang.isString(url)) 
				throw new TypeError("url must be a string.");
			
			// Helper function to determine if URL is a URI
			var isAbsolute = function(url) {
				if (url.indexOf("http://") === 0) 
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
		var _getCached = function(url) {
			// Make sure a URL exists and is a String
			if (!YAHOO.lang.isString(url)) 
				throw new TypeError("url must be a string.");
			
			// Loop over the cache to check for an entry matching the URL
			for (var i in _cache) 
				if (_urlRoot(url) == _cache[i].request) 
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
		var _setCached = function(url, response) {
			// Make sure a URL exists and is a String
			if (!YAHOO.lang.isString(url)) 
				throw new TypeError("url must be a string.");
				
			// Make sure a response has been defined
			if (YAHOO.lang.isUndefined(response))
				throw new TypeError("response must be defined.");
			
			// Check if request is cached and update response
			for (var i in _cache) 
				if (_urlRoot(url) == _cache[i].request) 
					return (_cache[i].response = response);
			
			// Append request-response pair to the cache
			_cache.push({
				request:	_urlRoot(url),
				response:	response
			});
			
			return response;
		};
		
		
		var Public = {
			
			/**
			 * Initialize - Setup the Thumbnail object with a sourceURL.
			 *
			 * @param		{String}	sourceURL
			 * @return		{Boolean}	isInitialized
			 * @public
			 */
			init: function(sourceURL, callback) {
				// Call the callback function if Services is already initialized.
				if (_initialized)
					return callback();
					
				// Make sure dependencies are loaded then initialize
				Dependencies.load("Service", function(){
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
				});
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
				var thumbnail = _getCached(url);
				if (YAHOO.lang.isValue(thumbnail)) 
					return callback(thumbnail);
				
				// Make sure a Source URL is set to lookup thumbnails from
				if (!YAHOO.lang.isString(_sourceURL))
					throw new Error("Thumbnail Service must be initialized.");
				
				// Async call to server to get and cache the thumbnail for a URL
				var request = YAHOO.util.Connect.asyncRequest("GET", _sourceURL + url, {
					success: 	function(response) {
									return callback(_setCached(url, response.responseText));
								},
								
					failure:	function(response) {
									return callback(null);
								}
				});
			}
		};
		
		
		// Register Service's YUI dependencies.
		Dependencies.addModule("Service", {
			requires:	_requires,
			loaded:		function() {
							if (YAHOO.util.Dom && YAHOO.util.Event && YAHOO.util.Connect)
								return true;
							else
								return false;
						}
		});
		
		return Public;
	}();
})();
