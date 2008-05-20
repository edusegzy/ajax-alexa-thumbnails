/**
 * Ajax Alexa Thumbnails - 0.3
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
		 * @private
		 */
		var _loader = null;
		
		
		var Public = {
			
			/**
			 * Registers a module with it's YUI dependencies.
			 * 
			 * @param		{String}	module
			 * @param		{Object}	dependencies
			 * @return		{void}
			 */
			addModule: function(module, dependencies) {
				// Make sure module is a String.
				if (!YAHOO.lang.isString(module))
					throw new TypeError("module must be a String.");
					
				// Make sure the module isn't already defined.
				if (!YAHOO.lang.isUndefined(_modules[module]))
					throw new TypeError("Module: " + module + " is already defined.");
					
				// Make sure dependencies.requires is a String or Array.
				if (!YAHOO.lang.isString(dependencies.requires) && !YAHOO.lang.isArray(dependencies.requires))
					throw new TypeError("dependencies.requires must be a String or an Array.");
					
				// Make sure dependencies.check is a Function.
				if (!YAHOO.lang.isFunction(dependencies.check))
					throw new TypeError("dependencies.check must be a Function.");
					
				// Register module and it's dependencies.
				_modules[module] = dependencies;
			},
			
			/**
			 * Checks for and loads (if needed) the required YUI dependencies.
			 *
			 * @param		{String}	module
			 * @param		{Function}	callback
			 * @return		{void}
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
				if (_modules[module].check()) {
					return callback();
					
				} else if (!YAHOO.util.YUILoader) {
					
					throw "YUI dependencies: " + _modules[module].requires + " are required unless YAHOO.util.YUILoader is provided.";
					
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
		 * Object holding module's YUI required dependencies and check [if they're loaded] function.
		 * 
		 * @property	{Object}	_dependencies
		 * @private
		 */
		var _dependencies = {
			requires:	["dom", "event", "connection"],
			check:		function() {
							return (YAHOO.util.Dom && YAHOO.util.Event && YAHOO.util.Connect) ? true : false;
						}
		};
		
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
			// Use just the URL's root.
			url = _urlRoot(url);
			
			// Loop over the cache to check for an entry matching the URL
			for (var i in _cache) 
				if (url == _cache[i].request) 
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
			// Use just the URL's root.
			url = _urlRoot(url);
			
			// Check if request is cached and update response
			for (var i in _cache) 
				if (url == _cache[i].request) {
					_cache[i].response = response
					return response;
				}
			
			// Append request-response pair to the cache
			_cache.push({
				request:	url,
				response:	response
			});
			
			// Return the response that was passed.
			return response;
		};
		
		
		var Public = {
			
			/**
			 * Initialize - Setup the Thumbnail object with a sourceURL.
			 *
			 * @param		{String}	sourceURL
			 * @return		{Boolean}	isInitialized
			 */
			init: function(sourceURL, callback) {
				// Call the callback function if Services is already initialized.
				if (_initialized)
					return callback();
					
				// Make sure sourceURL is a String
				if (!YAHOO.lang.isString(sourceURL)) 
					throw new TypeError("sourceURL must be a string.");
					
				// Make sure callback is a function
				if (!YAHOO.lang.isFunction)
					throw new TypeError("callback must be a function.");
				
				// Make sure dependencies are loaded then initialize
				EDF.Thumbnail.Dependencies.load("Service", function(){
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
			 * @param		{Object}	options (optional)
			 * @return		void
			 */
			getThumbnail: function(url, callback, options) {
				// Make sure the Service is initialized
				if (!_initialized)
					throw "Thumbnail Service hasn't been initialized.";
				
				// Make sure a sourceURL exists and is a String
				if (!YAHOO.lang.isString(url))
					throw new TypeError("url must be a string.");
					
				// Make sure a callback exists and is a Function
				if (!YAHOO.lang.isFunction(callback))
					throw new TypeError("callback must be a function.");
				
				// Check the cache first, if no result make async call to the server
				var thumbnail = _getCached(url);
				
				if (YAHOO.lang.isValue(thumbnail)) {
					return callback(thumbnail);
					
				} else {
					
					var defaults = {
						size:	"Small"
					};
					
					options = YAHOO.lang.merge(defaults, (options || {}));
					
					var requestURL = _sourceURL
								   + "?url=" + url
								   + "&size=" + options.size.substr(0,1).toUpperCase() + options.size.substr(1);
					
					var request = YAHOO.util.Connect.asyncRequest("GET", requestURL, {
						success: 	function(response) {
										thumbnail = _setCached(url, response.responseText);
										return callback(thumbnail);
									},
						failure:	function(response) {
										return callback(null);
									}
					});
				}
			}
		};
		
		
		// Register Service's YUI dependencies.
		EDF.Thumbnail.Dependencies.addModule("Service", _dependencies);
		
		return Public;
	}();
})();
