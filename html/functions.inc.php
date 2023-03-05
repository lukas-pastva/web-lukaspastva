<?php

function sysPagesGet(){
	return sysDataUrlGet($_ENV['API_URL']);
}

function debug($var = null, $return = false)
{
    if(!$return){
        echo '
        xxx: 
        ';
    }
    print_r($var, $return);
}

function sysPrintMenuPublic($pages)
{
    echo '<div class="navbar-collapse collapse"><ul class="nav navbar-nav">';
            foreach ($pages as $page) {
                echo '<li> <a href="#' . $page->name . '" class="smoothScroll">' . $page->fullname . '</a></li>
			';
            }
    echo '</ul></div>';
}


function printHeader($pages)
{

    echo '<!DOCTYPE html><html lang="en">
  <head>
    <!-- Google tag (gtag.js) -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-1495H9FDT5"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag(\'js\', new Date());
    
      gtag(\'config\', \'G-1495H9FDT5\');
    </script>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>LukasPastva | Lukas Pastva personal web page</title>
    <link href="css/bootstrap.css" rel="stylesheet">
    <link href="css/style.css" rel="stylesheet">
    <link rel="stylesheet" href="css/elusive-webfont.css">
    <link href="css/animate.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css?family=Open+Sans:300,400,700,300italic,400italic" rel="stylesheet" type="text/css">
    <script src="js/jquery.min.js"></script>
	<script type="text/javascript" src="js/modernizr.custom.js"></script>
    <!-- HTML5 shim and Respond.js IE8 support of HTML5 elements and media queries -->
    <!--[if lt IE 9]>
      <script src="js/html5shiv.js"></script>
      <script src="js/respond.min.js"></script>
    <![endif]-->
  </head>  
  <body data-spy="scroll" data-offset="0" data-target="#navbar-main">
  <div id="navbar-main">
	    <div class="navbar navbar-default navbar-fixed-top">
	      <div class="container">
	        <div class="navbar-header">
	          <button type="button" class="navbar-toggle" data-toggle="collapse" data-target=".navbar-collapse">
	          	<i class="el-icon-lines"></i>
	          </button>
	          <a class="navbar-brand hidden-xs hidden-sm" href="#home"><h1> LukasPastva</h1></a>
	        </div>';
    
    sysPrintMenuPublic($pages);

    echo '
			</div>
	    </div>
    </div>';
}

function printFooter() {
		echo '		<div id="footerwrap">
			<div class="container">
				<div class="btt-wrapper fade-down"><a class="btt-link smoothScroll" href="#home"><i class="el-icon-chevron-up"></i></a></div>
				<h3>Visit me at:</h3>				
				<ul id="footer-social" class="fade-down">
					<li><a href="https://gitlab.com/lukas-pastva" target="_blank" title="GitLab"><i class="el-icon-github"></i></a></li>
					<li><a href="https://github.com/lukas-pastva" target="_blank" title="GitHub"><i class="el-icon-github"></i></a></li>
					<li><a href="https://www.facebook.com/pastva.lukas/" target="_blank" title="Facebook"><i class="el-icon-facebook"></i></a></li>
					<li><a href="https://www.youtube.com/channel/UCQYdiBtSsOUu7oKWa3y_2Wg/videos" target="_blank" title="Youtube"><i class="el-icon-youtube"></i></a></li>
					<li><a href="https://www.instagram.com/tronic.sk/" target="_blank" title="Instagram"><i class="el-icon-instagram"></i></a></li>
					<li><a href="https://www.linkedin.com/in/lukas-pastva/" target="_blank" title="Linked in"><i class="el-icon-linkedin"></i></a></li>
					<li><a href="https://vimeo.com/user5812042" target="_blank" title="Vimeo"><i class="el-icon-vimeo"></i></a></li>					
				</ul>
				
				<h6 class="fade-up">Design by Free Template Stock</h6>
				<h6 class="fade-up">Photo by Tronic.sk</h6>
				<h6 class="fade-up">Back end by Tronic.sk</h6>
			</div>
		</div>

	<script type="text/javascript" src="js/bootstrap.js"></script>
    <script type="text/javascript" src="js/plugins.js"></script>
	<script type="text/javascript" src="js/init.js"></script>
  </body>
</html>';
}

function sysDataUrlGet($url)
{
    return json_decode(sysUrlContentGet($url));
}

function sysUrlContentGet($url, $recursiveCount = 0)
{
    $return = sysCallCurl($url);
    if ($return['err']['redirect_url'] != '' && strlen($return['data']) < 50) {
        if ($recursiveCount <= 2) {
            $recursiveCount ++;
            return getUrlContent($return['err']['redirect_url'], $recursiveCount);
        }
    }
    return $return['data'];
}

function sysCallCurl($url){
    $return = Array();
  
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1; .NET CLR 1.1.4322)');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 5);
    curl_setopt($ch, CURLOPT_TIMEOUT, 5);
    $return['data'] = curl_exec($ch);
    $return['err'] = curl_getinfo($ch);
    curl_close($ch);

    return $return;
}