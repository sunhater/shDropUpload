/*!
 * jQuery shDropUpload v1.1
 * http://jquery.sunhater.com/shDropUpload
 * 2014-07-17
 *
 * Copyright (c) 2010-2014 Pavel Tzonkov <sunhater@sunhater.com>
 * Dual licensed under the MIT and GPL licenses.
 */
(function(a){a.fn.shDropUpload=function(e,b){if((typeof XMLHttpRequest=="undefined")||(typeof document.addEventListener=="undefined")||(typeof File=="undefined")||(typeof FileReader=="undefined")){return}var c={url:"",param:"upload",maxFilesize:10485760,precheck:function(g){console.log("shDropUpload: Upload process started");return true},begin:function(i,h,g){console.log("shDropUpload:     Uploading file "+h+" of "+g+" ("+i.file.name+")")},success:function(i,h,g){console.log("shDropUpload:     Upload success ("+i.file.name+")")},error:function(i,h,g){console.log("shDropUpload:     Upload request failed ("+i.file.name+")")},abort:function(i,h,g){console.log("shDropUpload:     Upload request aborted ("+i.file.name+")")},filesizeCallback:function(i,h,g){console.log("shDropUpload:     File is too big ("+i.file.name+")")},finish:function(){console.log("shDropUpload: Upload process finished")}},d={selectors:"img[src]",unique:true,ajax:{url:"",type:"post",dataType:"json",data:{url:"{url}",type:"{type}"},success:function(g){console.log("shDropUpload: URL has been passed to the server.")},error:function(){console.log("shDropUpload: Request failed!")}}},f=function(h){h=h.replace(/\r\n/g,"\n");var j,g="";for(var i=0;i<h.length;i++){j=h.charCodeAt(i);if(j<128){g+=String.fromCharCode(j)}else{if((j>127)&&(j<2048)){g+=String.fromCharCode((j>>6)|192);g+=String.fromCharCode((j&63)|128)}else{g+=String.fromCharCode((j>>12)|224);g+=String.fromCharCode(((j>>6)&63)|128);g+=String.fromCharCode((j&63)|128)}}}return g};a.extend(true,d,b);a.extend(true,c,e);if(!XMLHttpRequest.prototype.sendAsBinary){XMLHttpRequest.prototype.sendAsBinary=function(h){var i=Array.prototype.map.call(h,function(j){return j.charCodeAt(0)&255}),g=new Uint8Array(i);this.send(g)}}a(this).each(function(){var q=this,p=[],g=false,m=0,j="------multipartdropuploadboundary"+new Date().getTime(),i,o=function(r){if(r.preventDefault){r.preventDefault()}a(q).addClass("drag");return false},l=function(r){if(r.preventDefault){r.preventDefault()}return false},n=function(r){if(r.preventDefault){r.preventDefault()}a(q).removeClass("drag");return false},k=function(y){if(y.preventDefault){y.preventDefault()}if(y.stopPropagation){y.stopPropagation()}a(q).removeClass("drag");try{var v=y.dataTransfer.getData("text/html")}catch(y){var v=false}if(v){if(!b){return false}v="<div>"+v.toString()+"</div>";var x=[],u=[];var t=a.isArray(d.selectors)?d.selectors:d.selectors.split(/\s*,\s*/g);a.each(t,function(B,A){if(!/^[a-z0-9]+\[[a-z]+\]$/gi.test(A)){return true}var C=A.split("[")[0],z=A.split("[")[1].split("]")[0];a(v).find(A).each(function(){var D=a(this).attr(z);if(d.unique){for(var E=0;E<x.length;E++){if((x[E]==D)&&(u[E]==C)){return true}}}x.push(D);u.push(C)})});if(!x.length){return false}if(x.length==1){x=x[0];u=u[0]}var w=a.extend(true,{},d.ajax);if(w.data){a.each(w.data,function(A,z){if(z=="{url}"){w.data[A]=x}if(z=="{type}"){w.data[A]=u}})}a.ajax(w)}else{if(!e){return false}m+=y.dataTransfer.files.length;if(!m||!c.precheck(y)){return false}for(var s=0;s<m;s++){var r=y.dataTransfer.files[s];p.push(r)}h()}return false},h=function(){if(g){return false}if(p&&p.length){var t=p.shift(),u=m-p.length,r=new FileReader(),v=(typeof r.readAsBinaryString=="undefined");i=r.file=t;r.onload=function(x){g=true;var A=new XMLHttpRequest(),z="--"+j+'\r\nContent-Disposition: form-data; name="'+c.param+'"';A.file=x.target.file;c.begin(A,u,m);if(c.maxFilesize&&(A.file.size>c.maxFilesize)){g=false;c.filesizeCallback(A,u,m);h();return}if(v){var B="",w=new Uint8Array(x.target.result);for(var y=0;y<w.byteLength;y++){B+=String.fromCharCode(w[y])}}if(A.file.name){z+='; filename="'+f(A.file.name)+'"'}z+="\r\n";if(A.file.size){z+="Content-Length: "+A.file.size+"\r\n"}z+="Content-Type: "+A.file.type+"\r\n\r\n"+(v?B:x.target.result)+"\r\n--"+j+"\r\nContent-Disposition: form-data;\r\n--"+j+"--\r\n";A.open("post",c.url,true);A.setRequestHeader("Content-Type","multipart/form-data; boundary="+j);A.onload=function(){g=false;c.success(A,u,m);h()};A.onerror=function(){g=false;c.error(A,u,m);h()};A.onabort=function(){g=false;c.abort(A,u,m);h()};A.sendAsBinary(z)};if(v){r.readAsArrayBuffer(t)}else{r.readAsBinaryString(t)}}else{m=0;var s=setInterval(function(){if(g){return}j="------multipartdropuploadboundary"+new Date().getTime();p=[];clearInterval(s);c.finish()},333)}};q.removeEventListener("dragover",o,false);q.removeEventListener("dragenter",l,false);q.removeEventListener("dragleave",n,false);q.removeEventListener("drop",k,false);q.addEventListener("dragover",o,false);q.addEventListener("dragenter",l,false);q.addEventListener("dragleave",n,false);q.addEventListener("drop",k,false)})}})(jQuery);