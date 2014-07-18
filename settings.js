var storage = chrome.storage.sync;
var loadedSites = {};

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
		if(items.direction=="r"){
			f.direction.value = "r";
			f.forceDir.checked = true;
		} else {
			f.direction.value = "l";
		}
	});
}
function saveSettings(){
	var f = document.forms[0].elements;
	if(f.forceDir.checked){
		storage.set({'direction':f.direction.value});
	} else {
		storage.remove('direction');
	}
	storage.set({'pageAction':f.pageAction.checked});
}
function factoryReset(){
	if(confirm("This will reset all settings, including user-created site rules. Are you sure you want to continue?")){
		storage.remove('version');
		storage.remove('sites');
		storage.remove('direction');
		storage.remove('pageAction');
		chrome.runtime.reload();
	}
}
function loadSites(){
	storage.get('sites',function(items){
		var sites = items.sites;
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
			printSite(sites,sub[key]);
		}
		loadedSites = sites;
		var tempHash = location.hash;
		location.hash = "";
		location.hash = tempHash;
	});
}

function editSite(site, form){
	loadedSites[site].shortcuts.prev = form.elements[0].value;
	loadedSites[site].shortcuts.next = form.elements[1].value;
	storage.set({'sites':loadedSites});
	location.hash = loadedSites[site].name;
	location.reload();
}
function addSite(){
	var form = document.forms.newSite.elements;
	if(form.name.value==""||form.url.value==""){
		alert("Both the comic's title and its URL are required!");
		return;
	}
	var temp = {
		'name':form.name.value,
		'shortcuts':{
			'prev':form.prev.value,
			'next':form.next.value
		}
	};
	loadedSites[form.url.value] = temp;
	storage.set({'sites':loadedSites});
	location.hash = form.name.value;
	location.reload();
}
function removeSite(site){
	delete loadedSites[site];
	storage.set({'sites':loadedSites});
	location.reload();
}

function printSite(sites, key){
	var site = sites[key];
	var newSite = document.createElement("article");
	var heading = document.createElement("h1");
	var legend = document.createElement("legend");
	var form = document.createElement("form");
	var list = document.createElement("ul");
	var change = document.createElement("input");
	var remove = document.createElement("input");
	var prevItem = document.createElement("li");
	var nextItem = document.createElement("li");
	var prevLabel = document.createElement("label");
	var nextLabel = document.createElement("label");
	var prev = document.createElement("input");
	var next = document.createElement("input");
	form.name = site.name;
	prev.value = site.shortcuts.prev;
	prev.name = "prev";
	prev.size = 100;
	next.value = site.shortcuts.next;
	next.name = "next";
	next.size = 100;
	prevLabel.appendChild(document.createTextNode("Previous:"));
	prevItem.appendChild(prevLabel);
	prevItem.appendChild(prev);
	nextLabel.appendChild(document.createTextNode("Next:"));
	nextItem.appendChild(nextLabel);
	nextItem.appendChild(next);
	list.appendChild(prevItem);
	list.appendChild(nextItem);
	form.appendChild(list);
	change.type = "button";
	change.value = "Change";
	change.onclick = function(){
		editSite(key, form);
	};
	remove.type = "button";
	remove.value = "Remove";
	remove.onclick = function(){
		removeSite(key);
	};
	heading.innerHTML = site.name;
	legend.innerHTML = key;
	newSite.id = site.name;
	newSite.appendChild(heading);
	newSite.appendChild(legend);
	newSite.appendChild(form);
	newSite.appendChild(change);
	newSite.appendChild(remove);
	document.getElementById("wckf-main").appendChild(newSite);
}
document.getElementById('wckf-save').addEventListener('click',saveSettings);
document.getElementById('wckf-factory').addEventListener('click',factoryReset);
document.getElementById('wckf-addNew').addEventListener('click',addSite);
loadSites();
loadSettings();