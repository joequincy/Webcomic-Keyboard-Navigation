var storage = chrome.storage.sync;

function loadSettings(){
	var keys = [
		"direction",
		"pageAction"
	]
	storage.get(keys, function(items){
		var f = document.forms[0].elements;
		if(items.pageAction!="undefined"){
			f.pageAction.checked = items.pageAction;
		}
		if(items.direction=="rtl"){
			f.direction.value = "rtl";
			f.forceDir.checked = true;
		} else {
			f.direction.value = "ltr";
		}
	});
}
function saveSettings(){
	var f = document.forms[0].elements;
	storage.set({'pageAction':f.pageAction.checked},function(){
		if(f.forceDir.checked){
			storage.set({'direction':f.direction.value},function(){
				location.reload();
			});
		} else {
			storage.remove('direction',function(){
				location.reload();
			});
		}
	});
}
function factoryReset(){
	if(confirm(chrome.i18n.getMessage("resetWarning"))){
		storage.clear(function(){
			storage.set({'pageAction':true},function(){
				chrome.runtime.sendMessage("factoryReset",function(){
					location.reload();
				});
			});
		});
	}
}
function loadSites(){
	storage.get(null,function(items){
		var sites = {};
		var defDir = "ltr";
		for(var i in items){
			if(i!="version"&&i!="direction"&&i!="pageAction"){
				sites[i] = items[i];
			} else if(i=="direction"&&items.direction=="rtl"){
				defDir = "rtl";
			}
		}
		var sub = {};
		for(var i in sites){
			sub[sites[i].name] = i;
		}
		var sort = [];
		for(var j in sub){
			sort.push(j);
		}
		sort.sort(function(a, b){
			return a.toLowerCase().localeCompare(b.toLowerCase());
		});
		for(var k=0; k<sort.length; k++){
			var key = sort[k];
			printSite(sites,sub[key],defDir);
		}
		var tempHash = location.hash;
		location.hash = "";
		location.hash = tempHash;
	});
}

function editSite(site, form){
	storage.set(formatSite(
		form.name,
		site,
		form.elements[0].value,
		form.elements[1].value,
		form.dir.value
	),function(){
		location.hash = form.name;
		location.reload();
	});
}
function addSite(){
	var form = document.forms.newSite.elements;
	if(form.name.value==""||form.url.value==""){
		alert(chrome.i18n.getMessage("siteAddError"));
		return;
	}
	storage.set(formatSite(
		form.name.value,
		form.url.value,
		form.prev.value,
		form.next.value,
		form.dir.value
	),function(){
		location.hash = form.name.value;
		location.reload();
	});
}
function removeSite(site){
	storage.remove(site);
	location.reload();
}
function formatSite(name,address,prev,next,dir){
	var obj = {};
	obj[address] = {
		'name':name,
		'dir':dir,
		'shortcuts':{
			'prev':prev,
			'next':next
		}
	};
	return obj;
}

function printSite(sites, key, defDir){
	var name = sites[key].name;
	var prev = sites[key].shortcuts.prev;
	var next = sites[key].shortcuts.next;
	var dir = sites[key].dir || "ltr";
	var site = document.querySelectorAll("#editSite")[0].content;
	site.children[0].id = name;
	site.children[name].children[0].href = "http://"+key;
	site.children[name].children[0].children[0].innerText = name;
	if(defDir!=dir){
		site.children[name].children[0].children[0].className = dir;
		site.children[name].children[0].title = chrome.i18n.getMessage("dirHover")+" "+((dir=="ltr")?chrome.i18n.getMessage("dirLtR"):chrome.i18n.getMessage("dirRtL"));
	} else {
		site.children[name].children[0].children[0].className = "";
		site.children[name].children[0].title = "";
	}
	site.children[name].children[1].innerText = key;
	site.children[name].children[2].name = name;
	site.children[name].children[2].elements.prev.value = prev;
	site.children[name].children[2].elements.next.value = next;
	site.children[name].children[2].elements.dir.value = dir;
	site.children[name].children[3].value = chrome.i18n.getMessage("changeButton");
	site.children[name].children[4].value = chrome.i18n.getMessage("removeButton");
	var newSite = document.importNode(site, true);
	document.getElementById("wckf-main").appendChild(newSite);
	document.getElementById(name).children[3].onclick = function(){
		editSite(key, document.forms[name]);
	};
	document.getElementById(name).children[4].onclick = function(){
		removeSite(key);
	};
}
function translate(messageID, args) {
  return chrome.i18n.getMessage(messageID, args);
};

function localizePage(lang) {
	if(lang!="en-US"){
		//translate a page into the users language
		$("[i18n]:not(.i18n-replaced)").each(function() {
			$(this).html(translate($(this).attr("i18n")));
		});
		$("[i18n_value]:not(.i18n-replaced)").each(function() {
			$(this).val(translate($(this).attr("i18n_value")));
		});
		$("[i18n_title]:not(.i18n-replaced)").each(function() {
			$(this).attr("title", translate($(this).attr("i18n_title")));
		});
		$("[i18n_placeholder]:not(.i18n-replaced)").each(function() {
			$(this).attr("placeholder", translate($(this).attr("i18n_placeholder")));
		});
	}
};
document.getElementById('wckf-save').addEventListener('click',saveSettings);
document.getElementById('wckf-factory').addEventListener('click',factoryReset);
document.getElementById('wckf-addNew').addEventListener('click',addSite);
document.forms["settings"].elements["direction"][1].onchange = function(){
	if(this.checked == true){
		document.forms["settings"].elements["forceDir"].checked = true;
	}
};
loadSites();
loadSettings();
localizePage(chrome.i18n.getUILanguage());