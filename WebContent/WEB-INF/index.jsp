<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html>
	<head>
		<title>Mangala</title>
		<style>
			canvas {
			  border: 1px solid;
			  padding: 0;
			  margin: auto;
			  display: block;
			  position: absolute;
			  top: 0;
			  bottom: 0;
			  left: 0;
			  right: 0;
			}
			.image-detail-canvas {
			  -moz-user-select: none;
			  -webkit-user-select: none;
			  max-width: 100% !important;
			  max-height: 100% !important;
			}
		</style>
	</head>
	<body>
		<div class="image-detail">
			<canvas id="mangala"></canvas>
		</div>
		<script type="text/javascript" src="/websocket.js"></script>
		<script type="text/javascript" src="/mangala.js"></script>
		
		<!-- Global site tag (gtag.js) - Google Analytics -->
		<script async src="https://www.googletagmanager.com/gtag/js?id=UA-114862287-1"></script>
		<script>
		  window.dataLayer = window.dataLayer || [];
		  function gtag(){dataLayer.push(arguments);}
		  gtag('js', new Date());
		
		  gtag('config', 'UA-114862287-1');
		</script>
		
	</body>
</html>