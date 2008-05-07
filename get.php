<?php

require("alexa_service.php");


$access_key_id		= "[AWS ACCESS KEY ID]";
$secret_access_key	= "[AWS SECRET ACCESS KEY]";
$default_noimage	= "";


$url = isset($_GET['url']) ? $_GET['url'] : null;
$size = (isset($_GET['size']) && ($_GET['size']=="Small" || $_GET['size']=="Large")) ? $_GET['size'] : "Small";

$link = $url ? get_thumbnail_link($access_key_id, $secret_access_key, $size, $default_noimage, $url) : '';

echo "$link";

?>
