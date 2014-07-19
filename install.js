function loadDefaults(version){
	var xhr = new XMLHttpRequest();
	xhr.onload = function(){
		chrome.storage.sync.get(null, function(items){
			mergeDefaults(xhr.response, items, version);
		});
	};
	xhr.open("GET", chrome.extension.getURL('defaults.json'), true);
	xhr.responseType = "json";
	xhr.send();
}

function mergeDefaults(defaults, items, version){
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
	var userSettings = {};
	for(var i in items){
		if(i!="version"&&i!="direction"&&i!="pageAction"){
			userSettings[i] = items[i];
		}
	}
	var pageAction = (typeof(items.pageAction)==undefined)?true:items.pageAction;
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
	userSettings.version = currentVersion;
	userSettings.pageAction = pageAction;
	chrome.storage.sync.set(userSettings);
}

chrome.runtime.onInstalled.addListener(function() {
	chrome.storage.sync.get('version',function(items){
		if(items.version>0){
			loadDefaults(items.version);
		}else{
			loadDefaults(0);
		}
	});
});
chrome.runtime.onMessage.addListener(function (message, sender) {
	if (message == "show_page_action") {
		chrome.pageAction.show(sender.tab.id);
	} else if(message.notification){
		function removeNotification(tabId, changes, tab){
			chrome.notifications.clear("siteRule",function(yes){});
		}
		chrome.notifications.onButtonClicked.addListener(function(notification, button){
			if(button==0){
				chrome.storage.sync.set(message.details,function(){
					location.reload();
				});
			} else {
				removeNotification();
			}
		});
		chrome.notifications.create("siteRule",message.notification, function(){
			chrome.tabs.onUpdated.addListener(removeNotification);
			chrome.tabs.onRemoved.addListener(removeNotification);
		});
	}
});
