
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