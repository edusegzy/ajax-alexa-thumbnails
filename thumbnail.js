/**
 * Ajax Alexa Thumbnails - 0.4
 * 
 * @author		Eric Ferraiuolo <eferraiuolo@gmail.com>
 * @copyright	2008 Eric Ferraiuolo
 * @license		GNU LGPL <http://www.gnu.org/licenses/lgpl.html>
 */


// Create YUI namespace for module.
YAHOO.namespace('EDF.Thumbnail');


/**
 * Thumbnail: Object to handle async retrevial and caching of website thumbnails.
 * 
 * @class		Thumbnail
 * @singelton
 */
YAHOO.EDF.Thumbnail = function() {
	// Setup YUI shorthands
	var Lang = YAHOO.lang;
	var Connect = YAHOO.util.Connect;
	
	/**
	 * Default thumbnail options.
	 * 
	 * @property	{Object}	_defaults
	 * @private
	 */
	var _defaults = {
		source:	null,
		size:	"Small",
		anchor:	true
	};
	
	/**
	 * Object to hold the configured options.
	 * 
	 * @property	{Object}	_config
	 * @private
	 */
	var _config = null;
	
	/**
	 * Hold the initialization state.
	 * 
	 * @property	{Boolean}	_initialized
	 * @private
	 */
	var _initialized = false;
	
	/**
	 * A queue of requests waiting response from the server.
	 * 
	 * @property	{Object}	_queue
	 * @private
	 */
	var _queue = null;
	
	/**
	 * A cache of server-side requests and responses.
	 * 
	 * @property	{Object}	_cache
	 * @private
	 */
	var _cache = null;
	
	/**
	 * Hostname - Returns the hostname for a URL.
	 *
	 * @param		{String}	url
	 * @return		{String}	hostname
	 * @private
	 */
	function _hostname(url) {
		// Helper function to determine if URL is a URI
		function isAbsolute(url) {
			return (url.indexOf("http://") === 0 ? true : false);
		}
		
		// Return the hostname of the URL
		var startIndex = isAbsolute(url) ? 7 : 0;
		return url.substring(startIndex, url.indexOf("/", startIndex) >= startIndex ? url.indexOf("/", startIndex) : url.length);
	}
	
	/**
	 * Create Elements - Creates the DOM img and optional anchor elements for a thumbnail.
	 * 
	 * @param		{String}		url
	 * @param		{String}		imgSrc
	 * @return		{HTMLElement}	element
	 * @private
	 */
	function _createElements(url, imgSrc) {
		var img = document.createElement("img");
		img.setAttribute("alt", url);
		img.setAttribute("src", imgSrc);
		
		var element;
		if (_config.anchor) {
			element = document.createElement("a");
			element.setAttribute("href", url);
			element.appendChild(img);
			
		} else {
			
			element = img;
		}
		
		return element;
	}
	
	
	var Public = {
		
		/**
		 * Initialize - Setup the Thumbnail object with a sourceURL.
		 *
		 * @param		{Object}	config
		 * @return		{Self}		this
		 */
		init: function(config) {
			// Make sure config.source is a String
			if (Lang.isString(config.source)) {
				// Setup a new queue
				_queue = {};
				
				// Setup a new cache
				_cache = {};
				
				// Set the configuration options merging with the defaults
				_config = Lang.merge(_defaults, (config || {}));
				
				// Set initialized flag
				_initialized = true;
				
			} else {
				
				YAHOO.log("source must be of type String, the URL to the server-side lookup service.", "error", "EDF.Thumbnail.init");
				_initialized = false;
			}
			
			return this;
		},
		
		/**
		 * Get Thumbnail - Retreives a thumbnail for a URL and caches the result.
		 *
		 * @param		{String}	url
		 * @param		{Function}	callback
		 * @return		{Self}		this
		 */
		getThumbnail: function(url, callback) {
			// Make sure the module has been initialized
			if (!_initialized) {
				YAHOO.log("EDF.Thumbnail hasn't been initialized.", "error", "EDF.Thumbnail.get");
				return this;
			}
			
			// Type-check parameters
			if (!Lang.isString(url)) {
				YAHOO.log("url must be a string.", "error", "EDF.Thumbnail.get");
				return this;
			}
			if (!Lang.isFunction(callback)) {
				YAHOO.log("callback must be a function.", "error", "EDF.Thumbnail.get");
				return this;
			}
			
			// Get the hostname of the URL
			var hostname = _hostname(url);
			
			// Check the cache then the queue; if no result make async call to the server
			if (hostname in _cache) {
				callback(_createElements(url, _cache[hostname]));
				
			} else if (hostname in _queue) {
				
				_queue[hostname].push(callback);
				
			} else {
				
				// Add the hostname to the queue with the callback
				_queue[hostname] = [callback];
				
				// Build the request URL
				var requestURL = _config.source
							   + "?url=" + url
							   + "&size=" + _config.size.substr(0,1).toUpperCase() + _config.size.substr(1);
				
				// Do the Ajax request
				Connect.asyncRequest("GET", requestURL, {
					success: 	function(response) {
									// Cache the thumbnail's img url.
									_cache[hostname] = response.responseText;
									
									// Dequeue the hostname and call all added functions
									while (_queue[hostname].length > 0) {
										_queue[hostname].shift()(_createElements(url, _cache[hostname]));
									}
									delete _queue[hostname];
								},
					failure:	function(response) {
									YAHOO.log("Connection with server could not be established.", "error", "EDF.Thumbnail.get");
									callback(null);
								}
				});
			}
			
			return this;
		}
	};
	
	
	return Public;
}();


// Register module with YUI
YAHOO.register("EDF.Thumbnail", YAHOO.EDF.Thumbnail, { version:"0.4", build:"1" });
