**This project is being deprecated because Amazon's AWS Alexa Site Thumbnail service is being deprecated.**

# [Webpage Thumbnails — Screenshots via Page Glimpse in JavaScript](http://925html.com/code/webpage-thumbnails/) #

# Ajax Alexa Thumbnails #

A JavaScript module built on the Yahoo! User Interface library that allow asynchronous (Ajax) usage of Amazon's Alexa Site Thumbnail web service.

The project consists of a server-side component written in PHP which makes the cross-domain request to Amazon's Alexa Site Thumbnail web service, and a JavaScript component which makes Ajax requests to configured server-side component and caches the results.

## Features ##

  * **Uses YUI library** and registers itself as a module
  * **1.4kb** minified version
  * **Caching** to reduce number of server and web service requests
  * **Ajax request queue** to prevent multiple request for the same resource
  * **Configurable** (in JavaScript) for small/large thumbnails, and wrap with anchor (link)
  * **YUI Logging** support for development and testing

## Examples ##

  * [Resume's Projects with thumbnail tooltips](http://eric.ferraiuolo.name/resume/)
    * Hovering on a listed Project link shows a tooltip that fetches a thumbnail of the website.
    * Uses the YUI Tooltip Widget
  * Simple examples showing how to load and initialize the project
    * [Usage with standard loading](http://eric.ferraiuolo.name/projects/ajax-alexa-thumbnails/0.4.1/usage-standard.html)
    * [Usage with YUI Loader](http://eric.ferraiuolo.name/projects/ajax-alexa-thumbnails/0.4.1/usage-loader.html)

## Requires ##

  * [Amazon Web Services account](http://aws.amazon.com/)
  * [YAHOO! User Interface (YUI) 2.5.2](http://developer.yahoo.com/yui/)+
  * Running web server with PHP

It is required for you to have an Amazon Web Services account signed-up with the Alexa Site Thumbnail service. The AWS configuration resides in the alexa\_service.php file; here is where your AWS Access Identifiers are set.

## [Usage Overview](Usage.md) ##