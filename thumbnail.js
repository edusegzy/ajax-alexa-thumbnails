/**
 * 
 */

(function() {
	// YUI shorthands
	var Lang	= YAHOO.lang;
	var Dom		= YAHOO.util.Dom;
	var Event	= YAHOO.util.Event;
	var Connect	= YAHOO.util.Connect;
	var Overlay	= YAHOO.widget.Overlay;
	
	
	// Create EDF namespace if it doesn't exist
	if (typeof EDF == "undefined")
		EDF = {};

		
	/**
	 * Thumbnail: Object containing the Thumbnail Server and Thumbnail Viewer.
	 */
	EDF.Thumbnail = {};
	
	
	/**
	 * Thumbnail Service: Object to handle async retrevial and caching of website thumbnails.
	 */
	EDF.Thumbnail.Service = function() {
		// Private members
		var _sourceURL;
		var _cache = [];
		
		
		// Private methods
		/**
		 * URL Root (Private) - Returns the hostname for a URL.
		 *
		 * @param {String} url
		 * @return {String} hostname
		 */
		var urlRoot = function(url) {
			// Make sure a URL exists and is a String
			if (!Lang.isString(url)) 
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
				return url.substring(7, url.indexOf("/", 7));
			else 
				return url;
		};
		
		/**
		 * Get Cached (Private) - Checks the cache and returns the response if thumbnail for the URL is cached.
		 *
		 * @param {String} url
		 * @return {String} cachedResponse
		 */
		var getCached = function(url) {
			// Make sure a URL exists and is a String
			if (!Lang.isString(url)) 
				throw new TypeError("url must be a string.");
			
			// Loop over the cache to check for an entry matching the URL
			for (var i in _cache) 
				if (urlRoot(url) == _cache[i].request) 
					return _cache[i].response;
			
			// No cache entry was found for the URL
			return null;
		};
		
		/**
		 * Set Cached (Private) - Saves a request-response pair to cache.
		 *
		 * @param {String} url
		 * @param {String} response
		 * @return {String} response
		 */
		var setCached = function(url, response) {
			// Make sure a URL exists and is a String
			if (!Lang.isString(url)) 
				throw new TypeError("url must be a string.");
				
			// Make sure a response has been defined
			if (Lang.isUndefined(response)) {
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
		
		
		// Public methods
		return {
			/**
			 * Initialize - Setup the Thumbnail object with a sourceURL.
			 *
			 * @param {String} sourceURL
			 * @return {Boolean} isInitialized
			 */
			init: function(sourceURL) {
				// Make sure a sourceURL exists and is a String
				if (!Lang.isString(sourceURL)) 
					throw new TypeError("sourceURL must be a string.");
					
				// Set the sourceURL
				_sourceURL = sourceURL;
			},
			
			/**
			 * Get Thumbnail - Retreives a thumbnail for a URL and caches the result.
			 *
			 * @param {String} url
			 * @param {Function} callback
			 */
			getThumbnail: function(url, callback) {
				// Make sure a sourceURL exists and is a String
				if (!Lang.isString(url))
					throw new TypeError("url must be a string.");
					
				// Make sure a callback exists and is a Function
				if (!Lang.isFunction(callback))
					throw new TypeError("callback must be a function.");
				
				// Check the cache to avoid async call to server
				var thumbnail = getCached(url);
				if (Lang.isValue(thumbnail)) 
					return callback(thumbnail);
				
				// Make sure a Source URL is set to lookup thumbnails from
				if (!Lang.isString(_sourceURL))
					throw new Error("Thumbnail Service must be initialized.");
				
				// Async call to server to get and cache the thumbnail for a URL
				var request = Connect.asyncRequest("GET", _sourceURL + url, {
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
	 * Thumbnail Viewer: Class constructor to create presentation wrapper around Thumbnail object's functionality.
	 * 
	 * @param {string} id
	 */
	EDF.Thumbnail.Viewer = function(id) {
		// Make sure an ID exists and is a String
		if (!Lang.isString(id))
			throw new TypeError("id must be a string.");
		
		// YUI Overlay configuration
		var config = {
			visible:	false,
			width:		"201px",
			height:		"147px",
			zIndex:		1000
		};
		
		// Create ThumbnailViewer's instance overlay as a YUI Overlay
		this._overlay = new Overlay(id, config);
		this._overlay.setBody("");
		this._overlay.render(document.body);
		
		// Create ThumbnailViewer's instance timer
		this._timer = null;
	};
	
	
	/**
	 * Thumbnail Viewer - Show: Make the instance Overlay visible and retreive a URL's thumbnail.
	 * 
	 * @param {String} url
	 * @param {HTMLElement} context (optional)
	 * @param {Number} delay (optional)
	 */
	EDF.Thumbnail.Viewer.prototype.show = function(url, context, delay) {
		// Make sure a URL exists and is a String
		if (!Lang.isString(url))
			throw new TypeError("url must be a string.");
			
		// Set context for overlay
		var _overlay = this._overlay;
		
		// Retrieves thumbnail for URL and displays it in the instance overlay		
		var loadThumbnail = function() {
			_overlay.setBody('<div class="loading"></div>');
			
			// Set instance overlay's contextual
			if (Lang.isValue(context))
				_overlay.cfg.setProperty("context", [context, "tl", "bl"]);
			
			// Callback function after retrieving thumbnail
			var callback = function(thumbnail) {
				_overlay.setBody(thumbnail);
				_overlay.align("tl", "bl");
			};
			
			// Retreive the Thumbnail for the URL from the Service and set as the Overlay's body
			EDF.Thumbnail.Service.getThumbnail(url, callback);
			_overlay.show();
		};
		
		// Set intance timer to Load Thumbnail after Delay
		this._timer = setTimeout(loadThumbnail, Lang.isNumber(delay) ? delay : 500);
	};
	
	
	/**
	 * Thumbnail Viewer - Hide: Make the instance Overlay hidden.
	 */
	EDF.Thumbnail.Viewer.prototype.hide = function() {
		clearTimeout(this._timer);
		this._overlay.hide();
	};
}());
