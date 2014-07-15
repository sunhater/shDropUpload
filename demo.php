<?php

if (count($_FILES)) {
    header("Content-Type: text/plain");
    die(json_encode(array('file' => $_FILES)));
}

if (!empty($_POST)) {
    header("Content-Type: text/plain");
    die(json_encode(array('post' => $_POST)));
}

?><html>
<head>
<script src="http://code.jquery.com/jquery-2.0.3.min.js" type="text/javascript"></script>
<script src="shDropUpload.js" type="text/javascript"></script>
<script type="text/javascript">

function htmlData(string) {
    return string.replace(/\&/g, "&amp;").replace(/\</g, "&lt;").replace(/\>/g, "&gt;").replace(/\ /g, "&nbsp;").replace(/\"/g, "&quot;").replace(/\'/g, "&#39;");
}

function updateBar(current, files) {
    $('#progress .bar').css({width: Math.round((310 * (current - 1)) / files)});
}

$(function() {

    $('#dragHere').shDropUpload({

        url: "demo.php",

        precheck: function() {
            $('#progress').css({visibility: "visible"});
            $('#response').html('');
            return true;
        },

        begin: function(xhr, current, files) {
            $('#progress .text').html("Uploading file " + current + " of " + files + "!");
            $('#response').append("Upload started. " + htmlData(xhr.file.name) + '<br />');
        },

        success: function(xhr, current, files) {
            updateBar(current, files);

            var response = xhr.responseText;

            try {
                response = $.parseJSON(response);
            } catch(e) {
                $('#response').append("Response error! " + htmlData(xhr.file.name) + '<br /><br />');
                return;
            }

            if (response.file)
                $('#response').append("Upload success! " + htmlData(xhr.file.name) + '<br /><br />');
            else
                $('#response').append("Response error! " + htmlData(xhr.file.name) + '<br /><br />');
        },

        error: function(xhr, current, files) {
            updateBar(current, files);
            $('#response').append("Request error! " + htmlData(xhr.file.name) + '<br /><br />');
        },

        abort: function(xhr, current, files) {
            updateBar(current, files);
            $('#response').append("Request aborted! " + htmlData(xhr.file.name) + '<br /><br />');
        },

        filesizeCallback: function(xhr, current, files) {
            updateBar(current, files);
            $('#response').append("File is too big! " + htmlData(xhr.file.name) + '<br /><br />');
        },

        finish: function() {
            $('#response').append("---> Upload complete <---");
            $('#progress').css({visibility: "hidden"}).find('.bar').css({width: 0}).parent().find('.text').html('');
        }

    }, {
        ajax: {
            url: "demo.php",

            success: function(response) {

                if ($.isArray(response.post.url)) {
                    $('#response').html('');
                    $.each(response.post.url, function(i) {
                        var type = response.post.type[i],
                            url = response.post.url[i]

                        if (!$('#response .' + type).get(0))
                            $('#response').append('<div class="' + type + '" style="margin:15px 0">Passed URLs, type "<b>' + type + '</b>":<br /></div>');

                        var div = $('#response .' + type);

                        div.append('<a href="' + url + '">' + htmlData(url) + '</a><br />');
                    });

                } else {

                    if (response.post.type == "img")
                        $('#response').html('Image URL has been passed to the server!<br /><img src="' + response.post.url + '" />');

                    else
                        $('#response').html('URL has been passed to the server!<br /><a href="' + response.post.url + '">' + htmlData(response.post.url) + '</a>');
                }
            }
        }
    });
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
#progress {
    height: 24px;
    width: 310px;
    background: #bbb;
    visibility: hidden;
}
#progress .bar {
    position: absolute;
    height: 24px;
    background: #777;
}
#progress .text {
    position: absolute;
    text-align: center;
    width: 310px;
    height: 24px;
}
</style>
</head>
<body>
<div id="dragHere">Drop here file(s) from your local file manager, or image from another web page</div>
<div id="progress"><div class="bar"></div><div class="text"></div></div>
<div id="response"></div>
</body>
</html>