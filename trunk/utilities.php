<?php

/**
 * Alexa Site Thumbnail Utility Package for PHP
 *
 * Notes: Requires PHP 5. Your PHP installation must include the libcurl module for these methods to work.
 */

// Get a thumbnail URL from the thumbnail service. The returned image is enclosed in an achor tag (<a> <img/> </a>).

function get_thumbnail_link($access_key_id, $secret_access_key, $size, $default_image, $url) {
        $timestamp =  generate_timestamp();
        $url_enc = urlencode($url);
        $timestamp_enc = urlencode($timestamp);
        $signature_enc = urlencode (
            calculate_RFC2104HMAC
                    ("AlexaSiteThumbnail" . "Thumbnail" . $timestamp, $secret_access_key)
            );

        $request_url =  "http://ast.amazonaws.com/xino/?"
                        . "Service=".           "AlexaSiteThumbnail"
                        . "&Action=".           "Thumbnail"
                        . "&AWSAccessKeyId=".   $access_key_id
                        . "&Timestamp=" .       $timestamp_enc
                        . "&Signature=" .       $signature_enc
                        . "&Size=" .            $size
                        . "&Url=" .             $url;

        $result = make_http_request($request_url);
        $response_doc = new DOMDocument();
        $response_doc->loadXML($result);
        $thumbnail = $response_doc->getElementsByTagName("Thumbnail")->item(0);

        $image_url = $default_image;
        $has_default_image = ($default_image != NULL) && (strlen($default_image) > 0);

		if ($thumbnail != NULL) {
			if (($thumbnail->getAttribute("Exists") == "true") || !$has_default_image) {
				$image_url = $thumbnail->firstChild->nodeValue;
			}
		}
		return get_html_snippet($url, $image_url);
}

// Get an array of thumbnail URLs. The order of thumbnail URLs in the returned object is the same as that of $url_array.
// For thumbnail URLs that are missing from the service-response object, the value returned by the method is NULL.

function get_thumbnail_links($access_key_id, $secret_access_key, $size, $default_image, $url_array) {

        if (!is_array($url_array)) {
        	throw new Exception("url_array parameter is not an array.");
		}

        $urls_param = "";
        for ($i = 0; $i < count($url_array); $i++){
                $urls_param = $urls_param . "&Thumbnail." . ($i+1) . ".Url=" . urlencode($url_array[$i]);
        }
        $timestamp =  generate_timestamp();
        $timestamp_enc = urlencode($timestamp);
        $signature_enc = urlencode (
            calculate_RFC2104HMAC
                    ("AlexaSiteThumbnail" . "Thumbnail" . $timestamp, $secret_access_key)
            );

        $request_url =  "http://ast.amazonaws.com/xino/?"
                        . "Service=".           "AlexaSiteThumbnail"
                        . "&Action=".           "Thumbnail"
                        . "&AWSAccessKeyId=".   $access_key_id
                        . "&Timestamp=" .       $timestamp_enc
                        . "&Signature=" .       $signature_enc
                        . "&Shared.Size=" .     $size
                        . $urls_param;

        $result = make_http_request($request_url);
        $response_doc = new DOMDocument();
        $response_doc->loadXML($result);
        $has_default_image = ($default_image != NULL) && (strlen($default_image)> 0);

        $responses = $response_doc->getElementsByTagName("Response");
        $return_array = array();
        for ($i = 0; $i < count($url_array); $i++) {

        	$image_url = $default_image;
            $response = $responses->item($i);
            $thumbnail = $response->getElementsByTagName("Thumbnail")->item(0);
            if ($thumbnail != NULL) {
            	if (($thumbnail->getAttribute("Exists") == "true") || !$has_default_image) {
                	$image_url = $thumbnail->firstChild->nodeValue;
                }
            }
            $return_array[$i] = get_html_snippet($url_array[$i], $image_url);
        }
        return $return_array;
}


// Returns an HTML snippet which will display the thumbnail image url and link to the website.  Returns an empty string if the image is null or empty.
function get_html_snippet($url, $image) {
	$link = "";
	$navigable_url = (stristr($url,"http://") == $url ) ? $url : "http://".$url;
	if ($image) {
		$link = "<a href='$navigable_url'><img border='0' src='$image' alt='$url'/></a>";
	}
	return $link;
}


// Calculate signature using HMAC: http://www.faqs.org/rfcs/rfc2104.html

function calculate_RFC2104HMAC ($data, $key) {
    return base64_encode (
        pack("H*", sha1((str_pad($key, 64, chr(0x00))
        ^(str_repeat(chr(0x5c), 64))) .
        pack("H*", sha1((str_pad($key, 64, chr(0x00))
        ^(str_repeat(chr(0x36), 64))) . $data))))
     );
}

// Timestamp format: yyyy-MM-dd'T'HH:mm:ss.SSS'Z'

function generate_timestamp () {
    return gmdate("Y-m-d\TH:i:s.\\0\\0\\0\\Z", time());
}

// Make an http request to the specified URL and return the result

function make_http_request($url){
       $ch = curl_init($url);
       curl_setopt($ch, CURLOPT_TIMEOUT, 2);
	   curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
       $result = curl_exec($ch);
       if (curl_errno($ch)) {

       }
       curl_close($ch);
       return $result;
}

?>

