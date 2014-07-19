/** WcKS Framework */
wckf = {
	'bind':function(shortcuts){
		function closure(e){
			var cf = document.activeElement.nodeName;
			var element = (e.keyCode==wckf.direction.l)?shortcuts.prev:(e.keyCode==wckf.direction.r)?shortcuts.next:null;
			if((e.keyCode==37||e.keyCode==39)&&!(cf=="INPUT"||cf=="TEXTAREA")){
				e.preventDefault();
				$(element)[0].click();
			}
		}
		callback = function(e){
			e = e || window.event;
			closure(e);
		}
		document.addEventListener('keydown', callback);
	},
	'apply':function(){
		var storage = chrome.storage.sync;
		storage.get(null,function(stuff){
			var unbound = true;
			for(var p in stuff){
				var reg = new RegExp(wckf.escape(p)+"$");
				if(reg.test(document.domain)){
					if(!(stuff[p].hasOwnProperty("path")) || document.location.pathname.indexOf(stuff[p]['path'])==0){
						storage.get('direction',function(items){
							if(items.direction=="r"){
								wckf.direction.l = 39;
								wckf.direction.r = 37;
							}
						});
						unbound = false;
						wckf.bind(stuff[p]['shortcuts']);
						storage.get('pageAction',function(items){
							if(!items.pageAction==false){
								chrome.runtime.sendMessage("show_page_action");
							}
						});
					}
				}
			}
			if(unbound){
				var siteRules = $("var[wkn-title]")[0];
				if(typeof(siteRules)!="undefined"){
					var siteTitle = $(siteRules).attr("wkn-title");
					var siteAddress = $(siteRules).attr("wkn-address");
					var siteNext = $(siteRules).attr("wkn-next");
					var sitePrev = $(siteRules).attr("wkn-prev");
					if(typeof(siteTitle)!="undefined"&&typeof(siteAddress)!="undefined"){
						var details = {
							"type":"basic",
							"title":chrome.i18n.getMessage("extName"),
							"message":chrome.i18n.getMessage("notification"),
							"iconUrl":"icon-128.png",
							"buttons":[
								{"title":"Accept"},
								{"title":"Decline"}
							],
							"priority":2,
							"eventTime":Date.now()+5000
						}
						var obj = {};
						obj[siteAddress] = {
							"name":siteTitle,
							"shortcuts":{
								"prev":sitePrev,
								"next":siteNext
							}
						}
						chrome.runtime.sendMessage({
							"notification":details,
							"details":obj
						});
					}
				}
			}
		});
	},
	'escape':function(s){
		return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
	},
	'direction':{
		'l':37,
		'r':39
	}
}
wckf.apply();