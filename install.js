function loadDefaults(version){
	var xhr = new XMLHttpRequest();
	xhr.onload = function(){
		//chrome.storage.sync.set({'sites':xhr.response});
		chrome.storage.sync.get('sites', function(items){
			mergeDefaults(xhr.response, items.sites, version);
		});
	};
	xhr.open("GET", chrome.extension.getURL('defaults.json'), true);
	xhr.responseType = "json";
	xhr.send();
}

function mergeDefaults(defaults, userSettings, version){
	/* Merges any new site settings without overwriting any user-created settings.
	"defaults" example structure: {
		"0.1" : {
			"sinfest.net" : {
				"name" : "Sinfest",
				"path" : "/view.php",
				"shortcuts" : {
					"prev" : "img[src='../images/prev.gif']",
					"next" : "img[src='../images/prev.gif']"
				}
			},...
		},...
	*/
	if(typeof(userSettings)=="undefined"){
		userSettings = {};
	}
	var currentVersion = "";
	for(var i in defaults){
		if(Number(i)>Number(version)){
			var j = defaults[i];
			for(var k in j){
				if(!userSettings.hasOwnProperty(k)){
					userSettings[k] = j[k];
				}
			}
		}
		currentVersion = i;
	}
	chrome.storage.sync.set({
		'sites':userSettings,
		'version':currentVersion
	});
}
	

chrome.runtime.onInstalled.addListener(function() {
	chrome.storage.sync.get('version',function(items){
		if(items.version>0){
			loadDefaults(items.version);
		}else{
			chrome.storage.sync.set({'sites':{}});
			loadDefaults(0);
		}
	});
});