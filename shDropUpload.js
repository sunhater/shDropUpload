/*!
 * jQuery shDropUpload v1.0
 * 2014-07-14
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

        // Options about local files drag & drop
        var lo = {

            // URL to upload handler script
            url: "",

            // File field name
            param: "upload",

            // Maximum filesize in bytes. If a dragged file is too big, the browser crashes
            maxFilesize: 10485760,

            // Called before all uploads. Useful for implementing some checks before uploads begins
            // If it returns false, the uploading will be canceled.
            precheck: function(evt) {
                console.log("shDropUpload: Upload process started");
                return true;
            },

            // Called when an upload begins
            begin: function(xhr, currentFile, filesCount) {
                console.log("shDropUpload:     Uploading file " + currentFile + " of " + filesCount + " (" + xhr.file.name + ")");
            },

            // Called after successful upload request
            success: function(xhr, currentFile, filesCount) {
                console.log("shDropUpload:     Upload success (" + xhr.file.name + ")");
            },

            // Called when an upload request fails
            error: function(xhr, currentFile, filesCount) {
                console.log("shDropUpload:     Upload request failed (" + xhr.file.name + ")");
            },

            // Called when a file exceeds the maxFilesize option
            filesizeCallback: function(xhr, currentFile, filesCount) {
                console.log("shDropUpload:     File is too big (" + xhr.file.name + ")");
            },

            // Called when all files are proceeded
            finish: function() {
                console.log("shDropUpload: Upload process finished");
            }
        },

        // Options about remote images and links drag & drop
        ro = {

            // Ajax options
            ajax: {
                url: "",
                type: "post",
                dataType: "json",
                data: {
                    url: "{url}",  // {url} marks the URL from dragged object
                    type: "{type}" // {type} marks the tag type ("a" or "img")
                },
                success: function(response) {
                    console.log("shDropUpload: URL has been passed to the server.");
                },
                error: function() {
                    console.log("shDropUpload: Request failed!");
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

        $.extend(true, ro, remoteOptions);
        $.extend(true, lo, localOptions);

        if (!XMLHttpRequest.prototype.sendAsBinary) {
            XMLHttpRequest.prototype.sendAsBinary = function(datastr) {
                var ords = Array.prototype.map.call(datastr, function(x) {
                        return x.charCodeAt(0) & 0xff;
                    }),
                    ui8a = new Uint8Array(ords);
                this.send(ui8a);
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
                            );

                    if (!url)
                        return false;

                    var opts = $.extend(true, {}, ro.ajax);
                    if (opts.data) {
                        $.each(opts.data, function(i, j) {
                            if (j == "{url}")
                                opts.data[i] = url;
                            if (j == "{type}")
                                opts.data[i] = el.prop("tagName").toLowerCase();
                        });
                    }
                    opts.url.replace('{url}', encodeURIComponent(url))
                            .replace('{type}', el.prop("tagName").toLowerCase());
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
                        currentNum = filesCount - uploadQueue.length,
                        reader = new FileReader();

                    currentFile = reader.file = file;

                    reader.onload = function(evt) {
                        uploadInProgress = true;

                        var xhr = new XMLHttpRequest(),
                            postbody = '--' + boundary + '\r\nContent-Disposition: form-data; name="' + lo.param + '"';

                        xhr.file = evt.target.file;

                        lo.begin(xhr, currentNum, filesCount);

                        if (lo.maxFilesize && (xhr.file.size > lo.maxFilesize)) {
                            uploadInProgress = false;
                            lo.filesizeCallback(xhr, currentNum, filesCount);
                            uploadNext();
                            return;
                        }

                        if (xhr.file.name)
                            postbody += '; filename="' + utf8encode(xhr.file.name) + '"';
                        postbody += '\r\n';
                        if (xhr.file.size)
                            postbody += "Content-Length: " + xhr.file.size + "\r\n";
                        postbody += "Content-Type: " + xhr.file.type + "\r\n\r\n" + evt.target.result + "\r\n--" + boundary + "\r\nContent-Disposition: form-data;\r\n--" + boundary + "--\r\n";

                        xhr.open('post', lo.url, true);
                        xhr.setRequestHeader('Content-Type', "multipart/form-data; boundary=" + boundary);

                        xhr.onload = function() {
                            uploadInProgress = false;
                            lo.success(xhr, currentNum, filesCount);
                            uploadNext();
                        };

                        xhr.onerror = function() {
                            uploadInProgress = false;
                            lo.error(xhr, currentNum, filesCount);
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
