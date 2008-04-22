<?php

require("alexa-service.php");


$access_key_id		= "[AWS ACCESS KEY ID]";
$secret_access_key	= "[AWS SECRET ACCESS KEY]";
$default_noimage	= "";


$url = isset($_GET['url']) ? $_GET['url'] : null;

$link = $url ? get_thumbnail_link($access_key_id, $secret_access_key, "Large", $default_noimage, $url) : '';

echo "$link";

?>
