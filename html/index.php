<?php

session_cache_expire(60);
session_start();
ob_start();
ini_set('arg_separator.output', '&amp;');
date_default_timezone_set('UTC');
mb_internal_encoding('UTF-8');
error_reporting(E_ERROR | E_PARSE);


include_once ('functions.inc.php');

$pages = sysPagesGet();

printHeader($pages);

foreach ($pages as $page) {
		echo $page->description;
}

printFooter();
