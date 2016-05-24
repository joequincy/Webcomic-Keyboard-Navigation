function installDefaults(){
	/*  Restructuring for v1.0
	    Defaults are now kept on local storage, and sync storage is only
		used for user-created settings.
	*/
	var xhr = new XMLHttpRequest();
	xhr.onload = function(){
		var defaults = {
			'version':chrome.app.getDetails().version
		};
		for(var i in xhr.response){
			var j = xhr.response[i];
			for(var k in j){
				defaults[k] = j[k];
			}
		}
		chrome.storage.local.set(defaults);
		chrome.storage.sync.get('pageAction',function(items){
			if(!items.hasOwnProperty('pageAction')){
				chrome.storage.sync.set({'pageAction':true});
			}
		});
	};
	xhr.open("GET", chrome.extension.getURL('defaults.json')+"?"+(new Date()).getTime(), true);
	xhr.responseType = "json";
	xhr.send();
}

function wipeSettings(){
	chrome.storage.sync.clear(function(){
		installDefaults();
	});
}

chrome.runtime.onInstalled.addListener(function(){
	chrome.storage.sync.get('version',function(items){
		if(items.version){
			wipeSettings();
		} else {
			installDefaults();
		}
	});
});

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
	if (message == "show_page_action") {
		chrome.pageAction.show(sender.tab.id);
		chrome.pageAction.setTitle(sender.tab.id, chrome.i18n.getMessage("extIconHover"));
	} else if(message == "factoryReset"){
		wipeSettings();
		sendResponse("done");
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
