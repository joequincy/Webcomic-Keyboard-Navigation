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
		storage.get('sites',function(items){
			var stuff = items.sites;
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
						wckf.bind(stuff[p]['shortcuts']);
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