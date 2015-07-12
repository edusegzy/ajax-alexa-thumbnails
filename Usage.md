# How to use the project #

Hopefully have you have an AWS account and have signed up for the Alexa Site Thumbnail service; otherwise you can't get much further here.

## 1) Configure `alexa_service.php` ##

Using your AWS Access Identifiers, configure the following variables ($default\_noimage is optional).
```
$access_key_id		= "[AWS ACCESS KEY ID]";
$secret_access_key	= "[AWS SECRET ACCESS KEY]";
$default_noimage	= "";
```

## 2) Add Required JavaScript files ##

Within the `<body></body>` tags add the YUI dependency scripts along with the thumbnail.js file.
```
<script type="text/javascript" src="http://yui.yahooapis.com/2.5.2/build/yahoo-dom-event/yahoo-dom-event.js"></script>
<script type="text/javascript" src="http://yui.yahooapis.com/2.5.2/build/connection/connection-min.js"></script>
<script type="text/javascript" src="thumbnail-min.js"></script>
```

## 3) Initialize and use the `EDF.Thumbnail` module ##

The following will initialize the `EDF.Thumbnail` module, point to the alexa\_service.php that will handle the Ajax requests, use the _large_ size images, and wrap the image element with an anchor. After the module is initialized `EDF.Thumbnail.getThumbnail` is called to fetch the thumbnail and pass the result to the callback.
```
<script type="text/javascript">
	(function(){
		YAHOO.util.Event.onDOMReady(function(){
			
			YAHOO.EDF.Thumbnail.init({
				source:	"alexa_service.php",
				size:	"large",
				anchor:	true
			});
			
			YAHOO.EDF.Thumbnail.getThumbnail("http://www.google.com", function(thumbnail){
				//alert(thumbnail);
			});
			
		});
	}());
</script>
```

**[Running example of using standard loading](http://eric.ferraiuolo.name/projects/ajax-alexa-thumbnails/0.4.1/usage-standard.html)**

# Advance usage with YUI Loader #

Another [recommended](recommended.md) option is to load and initialize the module using the [YUI Loader](http://developer.yahoo.com/yui/yuiloader/). The `EDF.Thumbnail` module registers itself as a YUI module, therefore it integrates with the YUI Loader.

```
<script type="text/javascript" src="http://yui.yahooapis.com/2.5.2/build/yuiloader-dom-event/yuiloader-dom-event.js"></script>
<script type="text/javascript">
	(function(){
		var loader = new YAHOO.util.YUILoader();
		loader.addModule({
			name: "EDF.Thumbnail",
			type: "js",
			requires: ["connection"],
			fullpath: "thumbnail-min.js"
		});
		loader.require(["EDF.Thumbnail"]);
		loader.insert({
			onSuccess: function(){
				YAHOO.util.Event.onDOMReady(function(){
					
					YAHOO.EDF.Thumbnail.init({
						source:	"alexa_service.php",
						size:	"large",
						anchor:	true
					});
					
					YAHOO.EDF.Thumbnail.getThumbnail("http://www.google.com", function(thumbnail){
						//alert(thumbnail);
					});
					
				});
			}
		});
	}());
</script>
```

**[Running of example using the YUI Loader](http://eric.ferraiuolo.name/projects/ajax-alexa-thumbnails/0.4.1/usage-loader.html)**