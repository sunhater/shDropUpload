/*!
 * jQuery shDropUpload v0.9
 *
 * Copyright (c) 2010-2014 Pavel Tzonkov <sunhater@sunhater.com>
 * Dual licensed under the MIT and GPL licenses.
 */

(function($) {
    $.fn.shDropUpload = function(localOptions, remoteOptions) {

        // Compatibility check
        if ((typeof XMLHttpRequest == "undefined") ||
            (typeof document.addEventListener == "undefined") ||
            (typeof File == "undefined") ||
            (typeof FileReader  == "undefined")
        )
            return;

        // Dragging local files options
        var lo = {

            // URL to upload handler script
            url: "",

            // File field name
            param: "upload",

            // This function will be called before uploading
            precheck: function(e) {
                return true;
            },

            // Updating progress callback
            progress: function(filesCount, currentFile, progress, e1, e2, xhr) {},

            // Called after successful upload request
            success: function(response, statusText, xhr, e) {},

            // Called when an upload request fails
            error: function(xhr, textStatus, e) {
                alert('Failed to upload ' + e.target.file.name + '!');
            },

            // This function will be called when all files are proceeded
            finish: function() {}
        },

        // Dragging Remote Images and Links Options
        ro = {

            // Ajax options
            ajax: {
                url: "",
                type: "post",
                dataType: "json",
                data: {url: "{url}"}, // {url} marks the URL from dragged object
                success: function(response) {},
                error: function() {
                    alert("Response error!");
                }
            }
        },

        utf8encode = function(string) {
            string = string.replace(/\r\n/g, "\n");
            var c, utftext = "";

            for (var n = 0; n < string.length; n++) {

                c = string.charCodeAt(n);

                if (c < 128) {
                    utftext += String.fromCharCode(c);
                } else if((c > 127) && (c < 2048)) {
                    utftext += String.fromCharCode((c >> 6) | 192);
                    utftext += String.fromCharCode((c & 63) | 128);
                } else {
                    utftext += String.fromCharCode((c >> 12) | 224);
                    utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                    utftext += String.fromCharCode((c & 63) | 128);
                }
            }

            return utftext;
        };

        if (remoteOptions && remoteOptions.ajax) {
            var opts = ro.ajax;
            $.extend(opts, remoteOptions.ajax)
            remoteOptions.ajax = opts;
        }
        $.extend(ro, remoteOptions);
        $.extend(lo, localOptions);

        if (!XMLHttpRequest.prototype.sendAsBinary) {
            XMLHttpRequest.prototype.sendAsBinary = function(datastr) {
                var ords = Array.prototype.map.call(datastr, function(x) {
                        return x.charCodeAt(0) & 0xff;
                    }),
                    ui8a = new Uint8Array(ords);
                this.send(ui8a.buffer);
            }
        }

        $(this).each(function() {
            var t = this,
                uploadQueue = [],
                uploadInProgress = false,
                filesCount = 0,
                boundary = "------multipartdropuploadboundary" + new Date().getTime(),
                currentFile,

            dragOver = function(e) {
                if (e.preventDefault) e.preventDefault();
                $(t).addClass('drag');
                return false;
            },

            dragEnter = function(e) {
                if (e.preventDefault) e.preventDefault();
                return false;
            },

            dragLeave = function(e) {
                if (e.preventDefault) e.preventDefault();
                $(t).removeClass('drag');
                return false;
            },

            drop = function(e) {
                if (e.preventDefault) e.preventDefault();
                if (e.stopPropagation) e.stopPropagation();
                $(t).removeClass('drag');

                var remote = e.dataTransfer.getData('text/html');

                // Remote drag
                if (remote) {
                    if (!remoteOptions)
                        return false;

                    var el = $($(remote)[1]),
                        url = el.is('img')
                            ? el.attr('src')
                            : (el.is('a')
                                ? el.attr('href')
                                : false
                            )
                    if (!url)
                        return false;

                    var opts = ro.ajax;
                    if (opts.data) {
                        $.each(opts.data, function(i, j) {
                            if (j == "{url}")
                                opts.data[i] = url;
                        });
                    }
                    opts.url.replace('{url}', encodeURIComponent(url));

                    $.ajax(opts);

                // Local drag
                } else {
                    if (!localOptions)
                        return false;

                    if (!lo.precheck(e))
                        return false;

                    filesCount += e.dataTransfer.files.length;

                    for (var i = 0; i < filesCount; i++) {
                        var file = e.dataTransfer.files[i];
                        uploadQueue.push(file);
                    }

                    uploadNext();
                    return false;
                }
            },

            uploadNext = function() {
                if (uploadInProgress)
                    return false;

                if (uploadQueue && uploadQueue.length) {

                    var file = uploadQueue.shift(),
                        reader = new FileReader();

                    currentFile = reader.file = file;

                    reader.onload = function(evt) {
                        uploadInProgress = true;

                        var xhr = new XMLHttpRequest(),
                            postbody = '--' + boundary + '\r\nContent-Disposition: form-data; name="' + lo.param + '"';

                        if (evt.target.file.name)
                            postbody += '; filename="' + utf8encode(evt.target.file.name) + '"';
                        postbody += '\r\n';
                        if (evt.target.file.size)
                            postbody += "Content-Length: " + evt.target.file.size + "\r\n";
                        postbody += "Content-Type: " + evt.target.file.type + "\r\n\r\n" + evt.target.result + "\r\n--" + boundary + "\r\nContent-Disposition: form-data;\r\n--" + boundary + "--\r\n";
                        xhr.filaname = evt.target.file.name;

                        if (xhr.upload) {
                            var progress = function(e) {
                                var progress = e.lengthComputable
                                    ? Math.round((e.loaded * 100) / evt.total) + '%'
                                    : Math.round(e.loaded / 1024) + " KB";
                                lo.progress(filesCount - uploadQueue.length, filesCount, progress, e, evt, xhr);
                            };
                            progress();
                            xhr.upload.filaname = evt.target.file.name;
                            xhr.upload.addEventListener("progress", progress, false);
                        }

                        xhr.open('post', lo.url, true);
                        xhr.setRequestHeader('Content-Type', "multipart/form-data; boundary=" + boundary);

                        xhr.onload = function() {
                            uploadInProgress = false;
                            lo.success(xhr.responseText, xhr.statusText, xhr, evt);
                            uploadNext();
                        };

                        xhr.onerror = function() {
                            uploadInProgress = false;
                            lo.error(xhr, xhr.statusText, evt);
                            uploadNext();
                        };

                        xhr.sendAsBinary(postbody);
                    };

                    reader.readAsBinaryString(file);

                } else {
                    filesCount = 0;
                    var loop = setInterval(function() {
                        if (uploadInProgress) return;
                        boundary = "------multipartdropuploadboundary" + new Date().getTime();
                        uploadQueue = [];
                        clearInterval(loop);
                        lo.finish();
                    }, 333);
                }
            };

            t.removeEventListener('dragover', dragOver, false);
            t.removeEventListener('dragenter', dragEnter, false);
            t.removeEventListener('dragleave', dragLeave, false);
            t.removeEventListener('drop', drop, false);

            t.addEventListener('dragover', dragOver, false);
            t.addEventListener('dragenter', dragEnter, false);
            t.addEventListener('dragleave', dragLeave, false);
            t.addEventListener('drop', drop, false);
        });
    }
})(jQuery);
