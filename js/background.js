// Learn more about poke v3 here:
// https://github.com/NewTabPage/Awesome-New-Tab-Page/wiki/Poke-v3
var info = {
    "poke"    :   3,              // poke version 2
    "width"   :   1,              // 406 px default
    "height"  :   2,              // 200 px default
    "path"    :   "GoogleEvents.html",
    "v2"      :   {
        "resize"    :   true,  // Set to true ONLY if you create a range below.
        "min_width" :   1,
        "max_width" :   2,
        "min_height":   1,
        "max_height":   2
    },
    "v3"      :   {
        "multi_placement": false // Allows the widget to be placed more than once
        // Set to false unless you allow users to customize each one
    }
};

// Below is the required poke listener
// DO NOT MODIFY ANY OF THE BELOW CODE
chrome.extension.onMessageExternal.addListener(function(request, sender, sendResponse) {
    if(request === "mgmiemnjjchgkmgbeljfocdjjnpjnmcg-poke") {
        chrome.extension.sendMessage(
            sender.id,
            {
                head: "mgmiemnjjchgkmgbeljfocdjjnpjnmcg-pokeback",
                body: info,
            }
        );
    }
});
// Above is the required poke listener
// DO NOT MODIFY ANY OF THE ABOVE CODE

ShayJS.antp.Widget.init();

// Do a one-time initial fetch on load.
ShayJS.Google.Calendar.fetch();

// Fetch every x minutes
setInterval(function(){
	ShayJS.Google.Calendar.fetch();
}, ShayJS.get('fetch_interval')*1000);

//Plug into the Calendar events
ShayJS.extend(ShayJS.Google.Calendar, {

	onFetchStart: function(){
        console.log("Fetching Events...");
		ShayJS.antp.Widget.fetching(true);
	},

	onFetchComplete: function(events) {
		console.log("Fetch Complete! " + events.length + " Events.");
		ShayJS.set("events", JSON.stringify(events));
        ShayJS.antp.Widget.notification("FETCHING");
        ShayJS.antp.Widget.alert("NO_SESSION", "");
		ShayJS.antp.Widget.fetching(false);
		ShayJS.antp.Widget.shouldUpdate(true);
	},	
	
	onRequireLogin: function(response) {
		ShayJS.antp.Widget.alert("NO_SESSION", l("SESSION_ERROR_ALERT", ["https://www.google.com/calendar/"]));
        ShayJS.antp.Widget.fetching(false);
	},
	
	onGetCalendarFail: function() {
		ShayJS.antp.Widget.alert("FETCH_FAIL", l("NOTHING_CALENDARLIST"));
        ShayJS.antp.Widget.fetching(false);
	}
});

ShayJS.extend(ShayJS.antp.Widget, {
    onShouldFetch: function(){
        ShayJS.Google.Calendar.fetch();
    }
});

/* Watch for when the user logs in */
chrome.tabs.onUpdated.addListener(onTabUpdated);
function onTabUpdated(tabId, changeInfo) {
    var url = changeInfo.url;
    if (!url) return;
    if ((url.indexOf('//www.google.com/calendar/') != -1) ||
            ((url.indexOf('//www.google.com/a/') != -1) && (url.lastIndexOf('/acs') == url.length - 4)) ||
            (url.indexOf('//www.google.com/accounts/') != -1))
    {
        // The login screen isn't helpful
        if (url.indexOf('https://www.google.com/accounts/ServiceLogin?') == 0) {
            return;
        }
        ShayJS.log("background.onTabUpdated: loginStatusChanged");
        ShayJS.Google.Calendar.fetch();
    }
}