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
        "max_height":   3
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

var gCal = ShayJS.Google.Calendar;

ShayJS.DEBUG = true;
ShayJS.antp.Widget.init();

//Set the fetch interval to 10 min by default
ShayJS.set('fetch_interval', 10*60);

// Do a one-time initial fetch on load.
gCal.fetch();

// Fetch every x minutes
setInterval(function(){
	console.log("RELOAD");
	ShayJS.Google.Calendar.fetch();
}, ShayJS.get('fetch_interval')*1000);

//Plug into the Calendar events
ShayJS.extend(ShayJS.Google.Calendar, {

	onFetchStart: function(){
		ShayJS.set("fetching", true);
		ShayJS.antp.Widget.fetching(true);
	},

	onFetchComplete: function(events) {
		ShayJS.log("Fetch Complete!!!!!!!!!!!!");
		ShayJS.set("events", JSON.stringify(events));
		ShayJS.antp.Widget.fetching(false);
		ShayJS.antp.Widget.update();
		console.log("Events: " + events.length, events);
		console.log(localStorage);
	},	
	
	onRequireLogin: function(response) {
		ShayJS.antp.Widget.alert(l("SESSION_ERROR_ALERT", ["https://www.google.com/calendar/"]));
	},
	
	onGetCalendarFail: function() {
		ShayJS.antp.Widget.alert(l("NOTHING_CALENDARLIST"));
	}
});