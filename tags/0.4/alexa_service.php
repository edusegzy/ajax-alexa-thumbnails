<?php

/**
 * Alexa Site Thumbnail Utility Package for PHP
 *
 * Notes: Requires PHP 5. Your PHP installation must include the libcurl module for these methods to work.
 */


$access_key_id		= "[AWS ACCESS KEY ID]";
$secret_access_key	= "[AWS SECRET ACCESS KEY]";
$default_noimage	= "";


// Get a thumbnail URL from the thumbnail service
function get_thumbnail_image($access_key_id, $secret_access_key, $size, $default_image, $url) {
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
		return $image_url;
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


$url = isset($_GET['url']) ? $_GET['url'] : null;
$size = (isset($_GET['size']) && ($_GET['size']=="Small" || $_GET['size']=="Large")) ? $_GET['size'] : "Small";
$image_url = $url ? get_thumbnail_image($access_key_id, $secret_access_key, $size, $default_noimage, $url) : '';
echo "$image_url";

?>
