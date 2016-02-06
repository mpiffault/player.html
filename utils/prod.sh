#!/bin/bash
echo '<!DOCTYPE HTML>
<html>
<head>
<meta charset="UTF-8" />
<script>
'
cat script.js
echo '
</script>
<style>
'
cat colors.css reset.css style.css
echo '
</style>
</head>
<body>
</body>
</html>'
