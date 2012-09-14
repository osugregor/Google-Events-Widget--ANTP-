//Ensure That ShayJS exists, else fail
if (typeof (ShayJS) == "undefined") {
	window.console.error("The ShayJS.Google libray depends on the ShayJS base Library");
}

/*|*********************************************|
 *|			         Google                     |
 *|*********************************************|*/

ShayJS.Google = {
	gsessionid: "",
	hasSession: false,
	loginUrl: "https://www.google.com/accounts/ClientLogin",
	isLoginRequesting: false,		
	session: function() {},
	
	isLoggedIn: function() {
		return this.hasSession;
	},
	login: function() {
		
	}
};


/*|*******************************************|
 *|			        Calendar		          |
 *|*******************************************|*/

/**
 * Calendar Object
 */
ShayJS.Google.Calendar = {
	defaults: {
		max_results: 25,
		futureevents: false,
		days_to_show: 25
	},
	baseUrl: "https://www.google.com/calendar",
	calendarListUrl: "https://www.google.com/calendar/feeds/default/allcalendars/full",
	isLoading: false,
	visibility: "private",
	projection: "full",
	lastFetchedAt: null,
	calendars: [],
	events: [],
	rgxAllDay: /^([0-9]+)-([0-9]+)-([0-9]+)$/
}

/**
 * Events used for Calendar creation. These events should
 * be overwritten.
 */
ShayJS.extend(ShayJS.Google.Calendar, {
	onFetchStart: function() {},
	onFetchComplete: function() {},
	onFetchFail: function() {},
	onGetCalendarsComplete: function(calendars) {},
	onGetCalendarsFail: function(response) {},
	onGetEventsComplete: function(feed, events) {},
	onGetEventsFail: function() {}	,
	onRequireLogin: function(response) {}
});

/**
 * Functions Definitions
 */
ShayJS.extend(ShayJS.Google.Calendar, {

	/**
	 *	Fetches all of the events, updating the cache.
	 * 	@param {function} callback The function to call once the fetch is complete
	 * 	@param {function} onError The function to call if the fetch fails
	 */
	fetch: function() {
		var self = ShayJS.Google.Calendar;
		
		if(self.isLoading)return;
		self.isLoading = true; //Start the load
		
		self.onFetchStart();
			
		self.lastFetchedAt = new Date();

		self.getCalendars(function(calendars) {

			if(calendars === false){
				self.isLoading = false;
				return;
			}

			// If no calendars are available, then either all are hidden, or the user
			// has not authenticated yet.
			if (calendars.length === 0) {
			  ShayJS.log("No Calendars Found");
			  self.onFetchComplete([]);
			}
			
			ShayJS.log("Calendars Found: ", calendars);
			
			var allEvents = [];
			
			var pendingRequests = calendars.length;
			for (var i = 0; i < calendars.length; ++i) {				

			  ShayJS.Google.Calendar.getEventsFrom(calendars[i], function(events) {
				// Merge events from all calendars into a single array.
				allEvents = allEvents.concat(events);
				if (--pendingRequests === 0) {
					allEvents.sort(function(first, second) {
						return first.start.getTime() - second.start.getTime();
					});
					self.events = allEvents;
					self.isLoading = false;
					self.onFetchComplete(self.events);
				}
			  });
			}			
			
		});
	},


	/**
	 *	Fetches all of the Calendars for the currently logged in user.
	 * 	@param function callback - The function to return the calendar
	 *		   array to.
	 * 	@private
	 */
	getCalendars: function(callback) {
		var self = ShayJS.Google.Calendar;
		ShayJS.log('Fetching list of calendars.');
		
		$.get(self.calendarListUrl, function(data) {
			var calendars = [];
			// See the raw feed to understand this parsing.
			$(data).find('entry').each(function() {
			  var entry = $(this);

			  var calendar = {
				title: entry.find('title').text(),
				url: entry.find('content').attr('src'),
				color: entry.find('color').attr('value')
			  };
			  
			  // If a calendar is selected, and not hidden, add it to our list.
			  if (entry.find('hidden').attr('value') == 'false' &&
				  entry.find('selected').attr('value') == 'true') {
				calendars.push(calendar);
			  }
			});
			self.calendars = calendars;
			self.onGetCalendarsComplete(calendars);
			callback(calendars);
		}).error(function(response) {
			if (response.status === 401) {
				self.onRequireLogin(response);
			} else {
			  ShayJS.error('An error was encountered in fetching the feed:', response);
			  self.onGetCalendarsFail(response);
			}
			callback(false);
		});
	},

	/**
	 * Retrieves events from a given calendar from the server.
	 * @param {Object} feed A feed object: {title:'', url:'', color:''}.
	 * @param {function(Array.<Object>)} callback A callback called when events
	 *     are available.
	 * @private
	 */
	getEventsFrom: function(feed, callback) {

		var startMin = moment(ShayJS.get('start_min', this) || moment().sod());
		var feedUrl = feed.url + '?' + [
		  'max-results=' + ShayJS.get('max_results', this),
		  'futureevents=' + ShayJS.get('futureevents', this),
		  'orderby=starttime',
		  'singleevents=true',
		  'sortorder=ascending',
		  'start-min=' + startMin.format()].join('&');

		ShayJS.log('Fetching events from:\n   ' + feedUrl);

		$.get(feedUrl, (function(feed) {
			return function(data) {

				ShayJS.log("Received events for: " + feed.title + ", now parsing.");

				var events = [];
				$(data).find('entry').each(function() {
					var eventEntry = $(this);
					ShayJS.log(eventEntry);

					// In case of recurring events, the entry has multiple <gd:when> fields.
					// One of them has only a startTime, and another has both a startTime and an endTime.
					// This is a workaround for this crazy behavior.
					var startTime, endTime;
					var when = eventEntry.find('when');
					for (var i = 0; i < when.length; i++) {
					  if ($(when[i]).attr('startTime')) {
						startTime = $(when[i]).attr('startTime');
					  }
					  if ($(when[i]).attr('endTime')) {
						endTime = $(when[i]).attr('endTime');
					  }
					}

					var start = moment(startTime);
					var end = moment(endTime);

					events.push({
					  feed: feed,
					  title: eventEntry.find('title').text(),
					  start: start ? start.toDate() : null,
					  end: end ? end.toDate() : null,
					  allDay: ShayJS.Google.Calendar.rgxAllDay.test(startTime),
					  description: eventEntry.find('content').text(),
					  location: eventEntry.find('where').attr('valueString'),
					  reminder: eventEntry.find('when').find('reminder').attr('minutes'),
					  url: eventEntry.find('link[rel=alternate]').attr('href')
					});
				});			
				ShayJS.Google.Calendar.onGetEventsComplete(feed, events);
				callback(events);
			};
		})(feed));
	}
})