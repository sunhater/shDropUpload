<?php

if (isset($_FILES['upload']) && count($_FILES['upload'])) {
    header("Content-Type: text/plain");
    echo json_encode(array('file' => $_FILES));
    die;
}

if (isset($_POST['url'])) {
    echo json_encode(array('url' => $_POST['url'], 'file' => tempnam(sys_get_temp_dir(), 'php')));
    die;
}

?><html>
<head>
<script src="http://code.jquery.com/jquery-2.0.3.min.js" type="text/javascript"></script>
<script src="shDropUpload.js" type="text/javascript"></script>
<script type="text/javascript">
$(function() {
    $('#dragHere').shDropUpload({
        success: function(e, xhr) {
            console.log(e);
            console.log(xhr);
        }
    }, {
        ajax: {
            success: function(response) {
                console.log(response);
            }
        }
    });*/
});
</script>
<style type="text/css">
#dragHere {
    width: 300px;
    height: 200px;
    background: #ddf;
    padding: 5px;
}
#dragHere.drag {
    background: #fdd;
}
</style>
</head>
<body>
<div id="dragHere">Drag here a file from your local file manager, a link or image from another web page</div>
<div id="response"></div>
</body>
</html>