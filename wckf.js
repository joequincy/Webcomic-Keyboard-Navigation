/** WcKS Framework */
ksf = {
	'bind':function(shortcuts){
		function closure(e){
			var cf = document.activeElement.nodeName;
			var element = (e.keyCode==37)?shortcuts.Left:(e.keyCode==39)?shortcuts.Right:null;
			if((e.keyCode==37||e.keyCode==39)&&!(cf=="INPUT"||cf=="TEXTAREA")){
				e.preventDefault();
				element.click();
			}
		}
		callback = function(e){
			e = e || window.event;
			closure(e);
		}
		document.addEventListener('keydown', callback);
	},
	'apply':function(stuff){
		for(var p in stuff){
			var reg = new RegExp(ksf.escape(stuff[p]['domain'])+"$");
			if(reg.test(document.domain)){
				if(!(stuff[p].hasOwnProperty("path")) || document.location.pathname.indexOf(stuff[p]['path'])==0){
					ksf.bind(stuff[p]['shortcuts']);
				}
			}
		}
	},
	'escape':function(s){
		return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
	}
}