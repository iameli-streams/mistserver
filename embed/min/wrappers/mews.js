mistplayers.mews={name:"MSE websocket player",mimes:["ws/video/mp4","ws/video/webm"],priority:MistUtil.object.keys(mistplayers).length+1,isMimeSupported:function(e){return this.mimes.indexOf(e)==-1?false:true},isBrowserSupported:function(e,t,i){if(!("WebSocket"in window)||!("MediaSource"in window)){return false}if(location.protocol.replace(/^http/,"ws")!=MistUtil.http.url.split(t.url.replace(/^http/,"ws")).protocol){i.log("HTTP/HTTPS mismatch for this source");return false}if(navigator.platform.toUpperCase().indexOf("MAC")>=0){return false}function r(e){function t(t){return("0"+e.init.charCodeAt(t).toString(16)).slice(-2)}switch(e.codec){case"AAC":return"mp4a.40.2";case"MP3":return"mp4a.40.34";case"AC3":return"ec-3";case"H264":return"avc1."+t(1)+t(2)+t(3);case"HEVC":return"hev1."+t(1)+t(6)+t(7)+t(8)+t(9)+t(10)+t(11)+t(12);default:return e.codec.toLowerCase()}}var n={};for(var s in i.info.meta.tracks){if(i.info.meta.tracks[s].type!="meta"){n[r(i.info.meta.tracks[s])]=i.info.meta.tracks[s].codec}}var a=e.split("/")[2];function o(e){return MediaSource.isTypeSupported("video/"+a+';codecs="'+e+'"')}t.supportedCodecs=[];for(var s in n){var u=o(s);if(u){t.supportedCodecs.push(n[s])}}if(!i.options.forceType&&!i.options.forcePlayer){if(t.supportedCodecs.length<t.simul_tracks){i.log("Not enough playable tracks for this source");return false}}return t.supportedCodecs.length>0},player:function(){}};var p=mistplayers.mews.player;p.prototype=new MistPlayer;p.prototype.build=function(e,t){var i=document.createElement("video");i.setAttribute("playsinline","");var r=["autoplay","loop","poster"];for(var n in r){var s=r[n];if(e.options[s]){i.setAttribute(s,e.options[s]===true?"":e.options[s])}}if(e.options.muted){i.muted=true}if(e.info.type=="live"){i.loop=false}if(e.options.controls=="stock"){i.setAttribute("controls","")}i.setAttribute("crossorigin","anonymous");this.setSize=function(e){i.style.width=e.width+"px";i.style.height=e.height+"px"};var a=this;function o(){if(a.ws.readyState==a.ws.OPEN&&a.ms.readyState=="open"&&a.sb){t(i);if(e.options.autoplay){a.api.play()}return true}}this.msinit=function(){return new Promise(function(e,t){a.ms=new MediaSource;i.src=URL.createObjectURL(a.ms);a.ms.onsourceopen=function(){e()};a.ms.onsourceclose=function(e){if(a.debugging)console.error("ms close",e);u({type:"stop"})};a.ms.onsourceended=function(e){if(a.debugging)console.error("ms ended",e);if(a.debugging=="dl"){function t(e,t,r){var n,s;n=new Blob([e],{type:r});s=window.URL.createObjectURL(n);i(s,t);setTimeout(function(){return window.URL.revokeObjectURL(s)},1e3)}function i(e,t){var i;i=document.createElement("a");i.href=e;i.download=t;document.body.appendChild(i);i.style="display: none";i.click();i.remove()}var r=0;for(var n=0;n<a.sb.appended.length;n++){r+=a.sb.appended[n].length}var s=new Uint8Array(r);var r=0;for(var n=0;n<a.sb.appended.length;n++){s.set(a.sb.appended[n],r);r+=a.sb.appended[n].length}t(s,"appended.mp4.bin","application/octet-stream")}u({type:"stop"})}})};this.msinit().then(function(){if(a.sb){e.log("Not creating source buffer as one already exists.");return}o()});this.onsbinit=[];this.sbinit=function(t){if(!t){e.showError("Did not receive any codec: nothing to initialize.");return}a.sb=a.ms.addSourceBuffer("video/"+e.source.type.split("/")[2]+';codecs="'+t.join(",")+'"');a.sb.mode="segments";a.sb._codecs=t;a.sb._size=0;a.sb.queue=[];var r=[];a.sb.do_on_updateend=r;a.sb.appending=null;a.sb.appended=[];var n=0;a.sb.addEventListener("updateend",function(){if(!a.sb){e.log("Reached updateend but the source buffer is "+JSON.stringify(a.sb)+". ");return}if(a.debugging){if(a.sb.appending)a.sb.appended.push(a.sb.appending);a.sb.appending=null}if(n>=500){n=0;a.sb._clean(10)}else{n++}var t=r.slice();r=[];for(var s in t){if(!a.sb){if(a.debugging){console.warn("I was doing on_updateend but the sb was reset")}break}if(a.sb.updating){r.concat(t.slice(s));if(a.debugging){console.warn("I was doing on_updateend but was interrupted")}break}t[s](s<t.length-1?t.slice(s):[])}if(!a.sb){return}a.sb._busy=false;if(a.sb&&a.sb.queue.length>0&&!a.sb.updating&&!i.error){a.sb._append(this.queue.shift())}});a.sb.error=function(e){console.error("sb error",e)};a.sb.abort=function(e){console.error("sb abort",e)};a.sb._doNext=function(e){r.push(e)};a.sb._do=function(e){if(this.updating||this._busy){this._doNext(e)}else{e()}};a.sb._append=function(t){if(!t){return}if(!t.buffer){return}if(a.debugging){a.sb.appending=new Uint8Array(t)}if(a.sb._busy){if(a.debugging)console.warn("I wanted to append data, but now I won't because the thingy was still busy. Putting it back in the queue.");a.sb.queue.unshift(t);return}a.sb._busy=true;try{a.sb.appendBuffer(t)}catch(n){switch(n.name){case"QuotaExceededError":{if(i.buffered.length){if(i.currentTime-i.buffered.start(0)>1){e.log("Triggered QuotaExceededError: cleaning up "+Math.round((i.currentTime-i.buffered.start(0)-1)*10)/10+"s");a.sb._clean(1)}else{var r=i.buffered.end(i.buffered.length-1);e.log("Triggered QuotaExceededError but there is nothing to clean: skipping ahead "+Math.round((r-i.currentTime)*10)/10+"s");i.currentTime=r}a.sb._busy=false;a.sb._append(t);return}break}case"InvalidStateError":{a.api.pause();if(e.video.error){return}break}}e.showError(n.message)}};if(a.msgqueue){if(a.msgqueue[0]){var s=false;if(a.msgqueue[0].length){for(var o in a.msgqueue[0]){if(a.sb.updating||a.sb.queue.length||a.sb._busy){a.sb.queue.push(a.msgqueue[0][o])}else{a.sb._append(a.msgqueue[0][o])}}}else{s=true}a.msgqueue.shift();if(a.msgqueue.length==0){a.msgqueue=false}e.log("The newly initialized source buffer was filled with data from a seperate message queue."+(a.msgqueue?" "+a.msgqueue.length+" more message queue(s) remain.":""));if(s){e.log("The seperate message queue was empty; manually triggering any onupdateend functions");a.sb.dispatchEvent(new Event("updateend"))}}}a.sb._clean=function(e){if(!e)e=180;if(i.currentTime>e){a.sb._do(function(){a.sb.remove(0,Math.max(.1,i.currentTime-e))})}};if(a.onsbinit.length){a.onsbinit.shift()()}};this.wsconnect=function(){return new Promise(function(t,r){this.ws=new WebSocket(e.source.url);this.ws.binaryType="arraybuffer";this.ws.s=this.ws.send;this.ws.send=function(){if(this.readyState==1){return this.s.apply(this,arguments)}return false};this.ws.onopen=function(){this.wasConnected=true;t()};this.ws.onerror=function(t){e.showError("MP4 over WS: websocket error")};this.ws.onclose=function(t){e.log("MP4 over WS: websocket closed");if(this.wasConnected&&!e.destroyed&&e.state=="Stream is online"&&!e.video.error){e.log("MP4 over WS: reopening websocket");a.wsconnect().then(function(){if(!a.sb){var t=function(e){if(!a.sb){a.sbinit(e.data.codecs)}else{a.api.play()}a.ws.removeListener("codec_data",t)};a.ws.addListener("codec_data",t);u({type:"request_codec_data",supported_codecs:e.source.supportedCodecs})}else{a.api.play()}},function(){Mistvideo.error("Lost connection to the Media Server")})}};this.ws.timeOut=e.timers.start(function(){if(a.ws.readyState==0){e.log("MP4 over WS: socket timeout - try next combo");e.nextCombo()}},5e3);this.ws.listeners={};this.ws.addListener=function(e,t){if(!(e in this.listeners)){this.listeners[e]=[]}this.listeners[e].push(t)};this.ws.removeListener=function(e,t){if(!(e in this.listeners)){return}var i=this.listeners[e].indexOf(t);if(i<0){return}this.listeners[e].splice(i,1);return true};a.msgqueue=false;var n=1;var s=[];var o=[];this.ws.onmessage=function(t){if(!t.data){throw"Received invalid data"}if(typeof t.data=="string"){var r=JSON.parse(t.data);if(a.debugging&&r.type!="on_time"){console.log("ws message",r)}switch(r.type){case"on_stop":{var s;s=MistUtil.event.addListener(i,"waiting",function(e){a.sb.paused=true;MistUtil.event.send("ended",null,i);MistUtil.event.removeListener(s)});a.ws.onclose=function(){};break}case"on_time":{var c=r.data.current-i.currentTime*1e3;var f=a.ws.serverDelay.get();var l=Math.max(100+f,f*2);var p=l+(r.data.jitter?r.data.jitter:0);if(e.info.type!="live"){l+=2e3}if(a.debugging){console.log("on_time received",r.data.current/1e3,"currtime",i.currentTime,n+"x","buffer",Math.round(c),"/",Math.round(l),e.info.type=="live"?"latency:"+Math.round(r.data.end-i.currentTime*1e3)+"ms":"",a.monitor?"bitrate:"+MistUtil.format.bits(a.monitor.currentBps)+"/s":"","listeners",a.ws.listeners&&a.ws.listeners.on_time?a.ws.listeners.on_time:0,"msgqueue",a.msgqueue?a.msgqueue.length:0,"readyState",e.video.readyState,r.data)}if(!a.sb){e.log("Received on_time, but the source buffer is being cleared right now. Ignoring.");break}if(d!=r.data.end*.001){d=r.data.end*.001;MistUtil.event.send("durationchange",null,e.video)}e.info.meta.buffer_window=r.data.end-r.data.begin;a.sb.paused=false;if(e.info.type=="live"){if(n==1){if(r.data.play_rate_curr=="auto"){if(i.currentTime>0){if(c>p*2){n=1+Math.min(1,(c-p)/p)*.08;i.playbackRate*=n;e.log("Our buffer ("+Math.round(c)+"ms) is big (>"+Math.round(p*2)+"ms), so increase the playback speed to "+Math.round(n*100)/100+" to catch up.")}else if(c<0){n=.8;i.playbackRate*=n;e.log("Our buffer ("+Math.round(c)+"ms) is negative so decrease the playback speed to "+Math.round(n*100)/100+" to let it catch up.")}else if(c<l/2){n=1+Math.min(1,(c-l)/l)*.08;i.playbackRate*=n;e.log("Our buffer ("+Math.round(c)+"ms) is small (<"+Math.round(l/2)+"ms), so decrease the playback speed to "+Math.round(n*100)/100+" to catch up.")}}}}else if(n>1){if(c<p){i.playbackRate/=n;n=1;e.log("Our buffer ("+Math.round(c)+"ms) is small enough (<"+Math.round(p)+"ms), so return to real time playback.")}}else{if(c>p){i.playbackRate/=n;n=1;e.log("Our buffer ("+Math.round(c)+"ms) is big enough (>"+Math.round(p)+"ms), so return to real time playback.")}}}else{if(n==1){if(r.data.play_rate_curr=="auto"){if(c<l/2){if(c<-1e4){u({type:"seek",seek_time:Math.round(i.currentTime*1e3)})}else{n=2;e.log("Our buffer is negative, so request a faster download rate.");u({type:"set_speed",play_rate:n})}}else if(c-l>l){e.log("Our buffer is big, so request a slower download rate.");n=.5;u({type:"set_speed",play_rate:n})}}}else if(n>1){if(c>l){u({type:"set_speed",play_rate:"auto"});n=1;e.log("The buffer is big enough, so ask for realtime download rate.")}}else{if(c<l){u({type:"set_speed",play_rate:"auto"});n=1;e.log("The buffer is small enough, so ask for realtime download rate.")}}}if(e.reporting&&r.data.tracks){e.reporting.stats.d.tracks=r.data.tracks.join(",")}if(r.data.tracks&&o!=r.data.tracks){var b=e.info?MistUtil.tracks.parse(e.info.meta.tracks):[];for(var g in r.data.tracks){if(o.indexOf(r.data.tracks[g])<0){var h;for(var m in b){if(r.data.tracks[g]in b[m]){h=m;break}}if(!h){continue}MistUtil.event.send("playerUpdate_trackChanged",{type:h,trackid:r.data.tracks[g]},e.video)}}o=r.data.tracks}break}case"tracks":{function v(e,t){if(!t){return false}if(e.length!=t.length){return false}for(var i in e){if(t.indexOf(e[i])<0){return false}}return true}if(v(a.last_codecs?a.last_codecs:a.sb._codecs,r.data.codecs)){e.log("Player switched tracks, keeping source buffer as codecs are the same as before.");if(i.currentTime==0&&r.data.current!=0){i.currentTime=r.data.current}}else{if(a.debugging){console.warn("Different codecs!");console.warn("video time",i.currentTime,"switch startpoint",r.data.current*.001)}a.last_codecs=r.data.codecs;if(a.msgqueue){a.msgqueue.push([])}else{a.msgqueue=[[]]}var w=function(){currPos=i.currentTime.toFixed(3);if(a&&a.sb){a.sb._do(function(t){if(!a.sb.updating){if(!isNaN(a.ms.duration))a.sb.remove(0,Infinity);a.sb.queue=[];a.ms.removeSourceBuffer(a.sb);a.sb=null;var n=(r.data.current*.001).toFixed(3);i.src="";a.ms.onsourceclose=null;a.ms.onsourceended=null;if(a.debugging&&t&&t.length){console.warn("There are do_on_updateend functions queued, which I will re-apply after clearing the sb.")}a.msinit().then(function(){a.sbinit(r.data.codecs);a.sb.do_on_updateend=t;var s=MistUtil.event.addListener(i,"loadedmetadata",function(){e.log("Buffer cleared");var t=function(){if(currPos>n){n=currPos}if(!i.buffered.length||i.buffered.end(i.buffered.length-1)<n){if(a.debugging){console.log("Desired seeking position ("+MistUtil.format.time(n,{ms:true})+") not yet in buffer ("+(i.buffered.length?MistUtil.format.time(i.buffered.end(i.buffered.length-1),{ms:true}):"null")+")")}a.sb._doNext(t);return}i.currentTime=n;e.log("Setting playback position to "+MistUtil.format.time(n,{ms:true}));if(i.currentTime.toFixed(3)<n){a.sb._doNext(t);if(a.debugging){console.log("Could not set playback position")}}else{if(a.debugging){console.log("Set playback position to "+MistUtil.format.time(n,{ms:true}))}var r=function(){a.sb._doNext(function(){if(i.buffered.length){if(i.buffered.start(0)>i.currentTime){var e=i.buffered.start(0);i.currentTime=e;if(i.currentTime!=e){r()}}}else{r()}})};r()}};t();MistUtil.event.removeListener(s)})})}else{w()}})}else{if(a.debugging){console.warn("sb not available to do clear")}a.onsbinit.push(w)}};if(!r.data.codecs||!r.data.codecs.length){e.showError("Track switch does not contain any codecs, aborting.");e.options.setTracks=false;w();break}function y(t){if(a.debugging){console.warn("reached switching point",t.data.current*.001,MistUtil.format.time(t.data.current*.001))}e.log("Track switch: reached switching point");w()}if(i.currentTime==0){y(r)}else{if(r.data.current>=i.currentTime*1e3){e.log("Track switch: waiting for playback to reach the switching point ("+MistUtil.format.time(r.data.current*.001,{ms:true})+")");var k=MistUtil.event.addListener(i,"timeupdate",function(){if(r.data.current<i.currentTime*1e3){if(a.debugging){console.log("Track switch: video.currentTime has reached switching point.")}y(r);MistUtil.event.removeListener(k);MistUtil.event.removeListener(_)}});var _=MistUtil.event.addListener(i,"waiting",function(){if(a.debugging){console.log("Track switch: video has reached end of buffer.","Gap:",Math.round(r.data.current-i.currentTime*1e3),"ms")}y(r);MistUtil.event.removeListener(k);MistUtil.event.removeListener(_)})}else{e.log("Track switch: waiting for the received data to reach the current playback point");var k=function(e){if(e.data.current>=i.currentTime*1e3){y(e);a.ws.removeListener("on_time",k)}};a.ws.addListener("on_time",k)}}}}}if(r.type in this.listeners){for(var g=this.listeners[r.type].length-1;g>=0;g--){this.listeners[r.type][g](r)}}return}var T=new Uint8Array(t.data);if(T){if(a.monitor&&a.monitor.bitCounter){for(var g in a.monitor.bitCounter){a.monitor.bitCounter[g]+=t.data.byteLength*8}}if(a.sb&&!a.msgqueue){if(a.sb.updating||a.sb.queue.length||a.sb._busy){a.sb.queue.push(T)}else{a.sb._append(T)}}else{if(!a.msgqueue){a.msgqueue=[[]]}a.msgqueue[a.msgqueue.length-1].push(T)}}else{e.log("Expecting data from websocket, but received none?!")}};this.ws.serverDelay={delays:[],log:function(e){var t=false;switch(e){case"seek":case"set_speed":{t=e;break}case"request_codec_data":{t="codec_data";break}default:{return}}if(t){var i=(new Date).getTime();function r(){a.ws.serverDelay.add((new Date).getTime()-i);a.ws.removeListener(t,r)}a.ws.addListener(t,r)}},add:function(e){this.delays.unshift(e);if(this.delays.length>5){this.delays.splice(5)}},get:function(){if(this.delays.length){let e=0;let t=0;for(null;t<this.delays.length;t++){if(t>=3){break}e+=this.delays[t]}return e/t}return 500}}}.bind(this))};this.wsconnect().then(function(){var t=function(e){a.sbinit(e.data.codecs);o();a.ws.removeListener("codec_data",t)};this.ws.addListener("codec_data",t);u({type:"request_codec_data",supported_codecs:e.source.supportedCodecs})}.bind(this));function u(e){if(!a.ws){throw"No websocket to send to"}if(a.ws.readyState>=a.ws.CLOSING){a.wsconnect().then(function(){u(e)});return}if(a.debugging){console.log("ws send",e)}a.ws.serverDelay.log(e.type);a.ws.send(JSON.stringify(e))}a.findBuffer=function(e){var t=false;for(var r=0;r<i.buffered.length;r++){if(i.buffered.start(r)<=e&&i.buffered.end(r)>=e){t=r;break}}return t};this.api={play:function(t){return new Promise(function(r,n){var s=function(o){if(!a.sb){e.log("Attempting to play, but the source buffer is being cleared. Waiting for next on_time.");return}if(e.info.type=="live"){if(t||i.currentTime==0){var u=function(){if(i.buffered.length){var t=a.findBuffer(o.data.current*.001);if(t!==false){if(i.buffered.start(t)>i.currentTime||i.buffered.end(t)<i.currentTime){i.currentTime=o.data.current*.001;e.log("Setting live playback position to "+MistUtil.format.time(i.currentTime))}i.play().then(r).catch(n);a.sb.paused=false;a.sb.removeEventListener("updateend",u)}}};a.sb.addEventListener("updateend",u)}else{a.sb.paused=false;i.play().then(r).catch(n)}a.ws.removeListener("on_time",s)}else if(o.data.current>i.currentTime){a.sb.paused=false;i.currentTime=o.data.current*.001;i.play().then(r).catch(n);a.ws.removeListener("on_time",s)}};a.ws.addListener("on_time",s);var o={type:"play"};if(t){o.seek_time="live"}u(o)})},pause:function(){i.pause();u({type:"hold"});if(a.sb){a.sb.paused=true}},setTracks:function(e){if(!MistUtil.object.keys(e).length){return}e.type="tracks";e=MistUtil.object.extend({type:"tracks"},e);u(e)},unload:function(){a.api.pause();a.sb._do(function(){a.sb.remove(0,Infinity);try{a.ms.endOfStream()}catch(e){}});a.ws.close()}};Object.defineProperty(this.api,"currentTime",{get:function(){return i.currentTime},set:function(t){if(isNaN(t)||t<0){e.log("Ignoring seek to "+t+" because ewww.");return}MistUtil.event.send("seeking",t,i);u({type:"seek",seek_time:Math.round(Math.max(0,t*1e3-(250+a.ws.serverDelay.get())))});var r=function(n){a.ws.removeListener("seek",r);var s=function(r){a.ws.removeListener("on_time",s);t=r.data.current*.001;t=t.toFixed(3);var n=10;var o=function(){i.currentTime=t;if(i.currentTime.toFixed(3)<t){e.log("Failed to seek, wanted: "+t+" got: "+i.currentTime.toFixed(3));if(n>=0){n--;a.sb._doNext(o)}}};o()};a.ws.addListener("on_time",s)};a.ws.addListener("seek",r);i.currentTime=t;e.log("Seeking to "+MistUtil.format.time(t,{ms:true})+" ("+t+")")}});var d=1;Object.defineProperty(this.api,"duration",{get:function(){return d}});Object.defineProperty(this.api,"playbackRate",{get:function(){return i.playbackRate},set:function(e){var t=function(e){i.playbackRate=e.data.play_rate};a.ws.addListener("set_speed",t);u({type:"set_speed",play_rate:e==1?"auto":e})}});function c(e){Object.defineProperty(a.api,e,{get:function(){return i[e]},set:function(t){return i[e]=t}})}var f=["volume","buffered","muted","loop","paused",,"error","textTracks","webkitDroppedFrameCount","webkitDecodedFrameCount"];for(var n in f){c(f[n])}MistUtil.event.addListener(i,"ended",function(){if(a.api.loop){a.api.currentTime=0;a.sb._do(function(){a.sb.remove(0,Infinity)})}});var l=false;MistUtil.event.addListener(i,"seeking",function(){l=true;var e=MistUtil.event.addListener(i,"seeked",function(){l=false;MistUtil.event.removeListener(e)})});MistUtil.event.addListener(i,"waiting",function(){if(l){return}var t=a.findBuffer(i.currentTime);if(t!==false){if(t+1<i.buffered.length&&i.buffered.start(t+1)-i.currentTime<1e4){e.log("Skipped over buffer gap (from "+MistUtil.format.time(i.currentTime)+" to "+MistUtil.format.time(i.buffered.start(t+1))+")");i.currentTime=i.buffered.start(t+1)}}});MistUtil.event.addListener(i,"pause",function(){if(a.sb&&!a.sb.paused){e.log("The browser paused the vid - probably because it has no audio and the tab is no longer visible. Pausing download.");u({type:"hold"});a.sb.paused=true;var t=MistUtil.event.addListener(i,"play",function(){if(a.sb&&a.sb.paused){u({type:"play"})}MistUtil.event.removeListener(t)})}});if(a.debugging){MistUtil.event.addListener(i,"waiting",function(){var e=[];var t=false;for(var r=0;r<i.buffered.length;r++){if(i.currentTime>=i.buffered.start(r)&&i.currentTime<=i.buffered.end(r)){t=true}e.push([i.buffered.start(r),i.buffered.end(r)])}console.log("waiting","currentTime",i.currentTime,"buffers",e,t?"contained":"outside of buffer","readystate",i.readyState,"networkstate",i.networkState);if(i.readyState>=2&&i.networkState>=2){console.error("Why am I waiting?!",i.currentTime)}})}this.ABR={size:null,bitrate:null,generateString:function(e,t){switch(e){case"size":{return"~"+[t.width,t.height].join("x")}case"bitrate":{return"<"+Math.round(t)+"bps,minbps"}default:{throw"Unknown ABR type"}}},request:function(e,t){this[e]=t;var i=[];if(this.bitrate!==null){i.push(this.generateString("bitrate",this.bitrate))}if(this.size!==null){i.push(this.generateString("size",this.size))}else{i.push("maxbps")}return a.api.setTracks({video:i.join(",|")})}};this.api.ABR_resize=function(t){e.log("Requesting the video track with the resolution that best matches the player size");a.ABR.request("size",t)};this.monitor={bitCounter:[],bitsSince:[],currentBps:null,nWaiting:0,nWaitingThreshold:3,listener:e.options.ABR_bitrate?MistUtil.event.addListener(i,"waiting",function(){a.monitor.nWaiting++;if(a.monitor.nWaiting>=a.monitor.nWaitingThreshold){a.monitor.nWaiting=0;a.monitor.action()}}):null,getBitRate:function(){if(a.sb&&!a.sb.paused){this.bitCounter.push(0);this.bitsSince.push((new Date).getTime());var t,i;if(this.bitCounter.length>5){t=a.monitor.bitCounter.shift();i=this.bitsSince.shift()}else{t=a.monitor.bitCounter[0];i=this.bitsSince[0]}var r=(new Date).getTime()-i;this.currentBps=t/(r*.001)}e.timers.start(function(){a.monitor.getBitRate()},500)},action:function(){if(e.options.setTracks&&e.options.setTracks.video){return}e.log("ABR threshold triggered, requesting lower quality");a.ABR.request("bitrate",this.currentBps)}};this.monitor.getBitRate()};