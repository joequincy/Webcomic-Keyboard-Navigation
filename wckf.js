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
		chrome.storage.sync.get('pageAction',function(items){
			if(!items.pageAction==false){
				chrome.runtime.sendMessage("show_page_action");
			}
		});
	},
	'getRules':function(){
		var key = document.domain.match(/^(?:www\.)?(.*)$/)[1];
		var s = chrome.storage;
		s.sync.get(key,function(response){
			if(response.hasOwnProperty(key)){
				wckf.apply(response);
			} else {
				s.local.get(key,function(response){
					if(response.hasOwnProperty(key)){
						wckf.apply(response);
					} else {
						wckf.checkHTMLForRules();
					}
				});
			}
		});
	},
	'apply':function(stuff){
		for(var p in stuff){
			var reg = new RegExp(wckf.escape(p)+"$");
			if(reg.test(document.domain)){
				if(!(stuff[p].hasOwnProperty("path")) || document.location.pathname.indexOf(stuff[p]['path'])==0){
					chrome.storage.sync.get('direction',function(items){
						if(typeof(items.direction)=="undefined"){
							wckf.setDirection(stuff[p].dir);
						} else {
							wckf.setDirection(items.direction);
						}
					});
					wckf.bind(stuff[p]['shortcuts']);
				}
			}
		}
	},
	'checkHTMLForRules':function(){
		var siteRules = $("var[wkn-title]")[0];
		if(typeof(siteRules)!="undefined"){
			var siteTitle = $(siteRules).attr("wkn-title");
			var siteAddress = $(siteRules).attr("wkn-address");
			var siteNext = $(siteRules).attr("wkn-next");
			var sitePrev = $(siteRules).attr("wkn-prev");
			var siteDir = $(siteRules).attr("wkn-dir");
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
				if(siteDir=="rtl"){
					obj[siteAddress]["dir"] = siteDir;
				}
				chrome.runtime.sendMessage({
					"notification":details,
					"details":obj
				});
			}
		} else {
			/* Test for common comic platforms
			   As an added bonus, this will add keyboard navigation
			   to a lot of blogs and news sites!

			   This also removes the need for nearly half the default
			   rules. Those sites are now supported by these common rules.
			*/
			var common = [
				{
					"prev":"a[rel='prev']",
					"next":"a[rel='next']"
				},
				{
					"prev":"a.navi-prev",
					"next":"a.navi-next"
				},
				{
					"prev":"a.prev",
					"next":"a.next"
				},
				{
					"prev":"img[alt='previous']",
					"next":"img[alt='next']"
				},
				{
					"prev":"a:contains('Previous')",
					"next":"a:contains('Next')"
				},
				{
					"prev":"a#prev",
					"next":"a#next"
				},
				{
					"prev":"a[title='prev']",
					"next":"a[title='next']"
				}
			];
			common.some(function(a,b,c){
				if($(a.prev).length>0){
					wckf.bind(a);
					return true;
				} else {
					//console.dir($(a.prev));
				}
			});
		}
	},
	'escape':function(s){
		return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
	},
	'direction':{
		'l':37,
		'r':39
	},
	'setDirection':function(dir){
		if(dir=="rtl"){
			wckf.direction.l = 39;
			wckf.direction.r = 37;
		} else {
			wckf.direction.l = 37;
			wckf.direction.r = 39;
		}
	}
}
wckf.getRules();
