<?php

require("utilities.php");

$access_key_id = "0ED8NTP4WAHQ9TMJSF82";
$secret_access_key = "C7yeKhFkqHayCRHtNlNTyduKhJYhyru/JzCZlc/H";
$default_noimage = "";

$url = isset($_GET['url']) ? $_GET['url'] : null;

$link = $url ? get_thumbnail_link($access_key_id, $secret_access_key, "Large", $default_noimage, $url) : '';

echo "$link";

?>
