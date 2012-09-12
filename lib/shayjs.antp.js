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
	alerts: {},
	notifications: {},
	
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
	 * Tells the widget it needs to update.
	 * @author Gregor
	 */
	update: function() {
		ShayJS.log("[WIDGET_UPDATE] Sent");
		ShayJS.set(this.KEY_UPDATE, true);
	},

	requireUpdate: function(require) {
		if(typeof require != "undefined"){
			ShayJS.set(this.KEY_UPDATE, require);
			return require;
		}
		var update = ShayJS.get(this.KEY_UPDATE, this) || false;
		return !!(update == "true");
	},
	
	/**
	 * Tells the widget it needs to update.
	 * @author Gregor
	 */
	fetching: function(isFetching) {
		if(typeof isFetching == "undefined"){
			return this.isFetching();
		}
		ShayJS.log("[WIDGET_UPDATE] Sent");
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
		this.alerts = JSON.parse(ShayJS.get(this.KEY_ALERTS, this));
		//Check if were deleting the alert
		if(msg == "" || msg === false){
			delete this.alerts[key];
		}else{
			ShayJS.log("[ALERT]", msg);
			this.alerts[key] = msg;
		}
		ShayJS.set(this.KEY_ALERTS, JSON.stringify(this.alerts));
		return this.alerts;
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
		this.notifications = JSON.parse(ShayJS.get(KEY_NOTIFICATIONS, this));
		//Check if were deleting the notification
		if(msg == "" || msg === false){
			delete this.notifications[key];
		}else{
			ShayJS.log("[NOTIFY]", msg);
			this.notifications[key] = msg;
		}
		ShayJS.set(KEY_NOTIFICATIONS, JSON.stringify(this.notifications));
		return this.notifications;
	},

	getNotifications: function(){
		return ShayJS.get(this.KEY_NOTIFICATIONS, this);
	},

	getAlerts: function(){
		return ShayJS.get(this.KEY_ALERTS, this);
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
		
		ShayJS.set(this.KEY_ALERTS, JSON.stringify(this.defaults[this.KEY_ALERTS]));
		ShayJS.set(this.KEY_NOTIFICATIONS, JSON.stringify(this.defaults[this.KEY_NOTIFICATIONS]));
		ShayJS.set(this.KEY_UPDATE, this.defaults[this.KEY_UPDATE]);
		ShayJS.set(this.KEY_FETCHING, this.defaults[this.KEY_FETCHING]);
		ShayJS.set(this.KEY_SHOULD_FETCH, this.defaults[this.KEY_SHOULD_FETCH]);
	}

})