//Ensure That ShayJS exists, else fail
if (typeof (ShayJS) == "undefined") {
	window.console.error("This libray depends on the ShayJS base Library");
}

//ANTP
if (typeof (ShayJS.antp) == "undefined") {
	ShayJS.antp = {};
}

/*|*******************************************|
 *|		         ANTP Widget	              |
 *|*******************************************|*/

/**
 *	The antp Widget Class helps to bring the background process and widget together.
 */
 if (typeof (ShayJS.antp.Widget) == "undefined") { ShayJS.antp.Widget = {}; }
ShayJS.extend(ShayJS.antp.Widget, {

	KEY_ALERTS: "antp_widget_alerts",
	KEY_NOTIFICATIONS: "antp_widget_notifications",
	KEY_UPDATE: "antp_widget_update",
	KEY_FETCHING: "antp_widget_fetching",
	KEY_SHOULD_FETCH: "antp_widget_should_fetch",
	defaults: {
		"antp_widget_alerts": {},
		"antp_widget_notifications": {},
		"antp_widget_update": false,
		"antp_widget_fetching": false,
		"antp_widget_should_fetch": false
	},
	
	/**
	 * Instantiates the Widget, clearing local storage.
	 * @author Gregor
	 */
	init: function(clearStorage){

		clearStorage = typeof clearStorage !== "undefined" ? clearStorage : true;
		
		if(clearStorage){
			this.clearLocalStorage();
		}
		
	},

	/**
	 * Tells/sets that the widget needs to update.
	 * @author Gregor
	 */
	shouldUpdate: function(should) {
		if(typeof should != "undefined"){
			ShayJS.set(this.KEY_UPDATE, should);
			return should;
		}
		var update = ShayJS.get(this.KEY_UPDATE, this) || false;
		return !!(update == "true");
	},
	
	/**
	 * Indicates if the widget is fetching...
	 * @author Gregor
	 */
	fetching: function(isFetching) {
		if(typeof isFetching == "undefined"){
			return this.isFetching();
		}
		ShayJS.log("[Fetching set] " + isFetching);
		ShayJS.set(this.KEY_FETCHING, isFetching);
	},

	shouldFetch: function(should) {
		if(typeof should == "undefined"){
			return !!(ShayJS.get(this.KEY_SHOULD_FETCH) == "true");
		}
		ShayJS.set(this.KEY_SHOULD_FETCH, should);
	},
	
	isFetching: function() {
		return !!(ShayJS.get(this.KEY_FETCHING) == "true");
	},

	/**
	 * Creates an alert which gets stored in the local storage for
	 * widget notification.
	 * @param {string} key The key in which to reference the alert by.
	 * @param {string} msg The message in which to associate with this alert.
	 * @return {array} The alerts currently active.
	 * @author Gregor
	 */
	alert: function(key, msg){
		var alerts = this.getAlerts();
		//Check if were deleting the alert
		if(msg == "" || msg === false){
			delete alerts[key];
		}else{
			ShayJS.log("[ALERT]", msg);
			alerts[key] = msg;
		}
		this.setAlerts(alerts);
		return alerts;
	},

	/**
	 * Creates a notification which gets stored in the local storage for
	 * widget notification.
	 * @param {string} key The key in which to reference the alert by.
	 * @param {string} msg The message in which to associate with this notification.
	 * @return {array} The notifications currently active.
	 * @author Gregor
	 */
	notification: function(key, msg){
		var notifications = this.getNotifications();
		//Check if were deleting the notification
		if(msg == "" || msg === false){
			delete notifications[key];
		}else{
			ShayJS.log("[NOTIFY]", msg);
			notifications[key] = msg;
		}
		this.setNotifications(notifications);
		return notifications;
	},

	setNotifications: function(notifications){
		if(typeof notifications != "string"){
			notifications = JSON.stringify(notifications);
		}
		ShayJS.set(this.KEY_NOTIFICATIONS, notifications);
	},

	/**
	 * Returns an object of notifications.
	 */
	getNotifications: function(){
		var tmp = ShayJS.get(this.KEY_NOTIFICATIONS, this);
		if(typeof tmp == "string"){
			return JSON.parse(tmp);
		}
		return tmp;
	},

	setAlerts: function(alerts){
		if(typeof alerts != "string"){
			alerts = JSON.stringify(alerts);
		}
		ShayJS.set(this.KEY_ALERTS, alerts);
	},

	/**
	 * Returns an object of alerts.
	 */
	getAlerts: function(){
		var tmp = ShayJS.get(this.KEY_ALERTS, this);
		if(typeof tmp == "string"){
			return JSON.parse(tmp);
		}
		return tmp;
	},

	/**
	 * Clears all local storage that the Widget relies on.
	 * @author Gregor
	 */
	clearLocalStorage: function(){
		ShayJS.remove(this.KEY_ALERTS);
		ShayJS.remove(this.KEY_NOTIFICATIONS);
		ShayJS.remove(this.KEY_UPDATE);
		ShayJS.remove(this.KEY_FETCHING);
		ShayJS.remove(this.KEY_SHOULD_FETCH);
	}

});

//EVENTS
ShayJS.extend(ShayJS.antp.Widget, {
	onShouldFetch: function(){ }
});

$(window).bind('storage', function () {
	ShayJS.log("[EVENT ShayJS.antp] Storage Changed", localStorage);
	if(ShayJS.antp.Widget.shouldFetch()){
		ShayJS.antp.Widget.shouldFetch(false);
		ShayJS.antp.Widget.onShouldFetch();
	}
});