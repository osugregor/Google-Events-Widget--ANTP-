// Learn more about poke v3 here:
// https://github.com/NewTabPage/Awesome-New-Tab-Page/wiki/Poke-v3
var info = {
    "poke"    :   3,              // poke version 2
    "width"   :   1,              // 406 px default
    "height"  :   2,              // 200 px default
    "path"    :   "GoogleEvents.html",
    "v2"      :   {
        "resize"    :   false,  // Set to true ONLY if you create a range below.
        "min_width" :   1,
        "max_width" :   1,
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

$(document).ready(function() {

    var w = Blz.Widget,
        gcal = Blz.Google.Calendar,
        app = MyGoogleCal.Application;
    window.localStorage.removeItem('events'); //clear events from storage
    gcal.source = 'shayko-GoogleEventsANTP-1';
    gcal.useGoogleLogin = (w.getPref('useGoogleApps')=='1');
    w.setPref("offset", 0);
    app.initialize();

    $(window).bind('storage', function(){
        var bg_update = !!(localStorage.getItem("bg_update") == "true");
        if(bg_update){
            update(true);
            localStorage.removeItem("bg_update");
        }
    });

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
            w.print("background.onTabUpdated: loginStatusChanged");
            update(true);
        }
    }

    function update(force) {

        log("[NOTICE] Updating Background Page");
        localStorage["bg_reloading"] = "true";

        if (force) {
            log("[NOTICE] Forced Update!");
            app.retrieveAllCalendar();return;
        }
        // Check if the application is logging in
        if (app.isLoginRequesting()) {
            log("[WARNING] Request Login!");
            widget_notify('login_requesting', w.getResourceString('NOW_LOGIN'));
            return;
        }else widget_notify('login_requesting', false);
        // Check if the client is logged in
        if (!app.isLogin()) {
            log("[WARNING] Not Logged In!");
            widget_alert('widget_require_login', getResourceString('SESSION_ERROR_ALERT', ["https://www.google.com/calendar/"]));
            return;
        }else  widget_alert('widget_require_login', false);
        // Check if were currently waiting for calendars
        if (app.isCalendarListRequesting()) {
            log("[WARNING] Calendar is already requesting.");
            //widget_notify('calendars_requesting', "Updating Calendars...");
            return;
        }else widget_notify('calendars_requesting', false);
        // Check if we have any calendars
        if (app.gcal.cacheCalendars.length == 0){
            log("[WARNING] No cached calendars");
            widget_notify('no_calendars', "No Calendars...");
            return;
        }else widget_notify('no_calendars', false);

        //Retrieve the events for all calendars
        var cStart = new Blz.GData.Date().resetHours();
        var events = [], cache = app.getAppointments(cStart); // copy the array to add repeaters
        for (calid in cache.items) {
            var cal = app.findCalendarById(calid);
            if (cal && cal.selected)events = events.concat(cache.items[calid]);
        }

        localStorage["events"] = JSON.stringify(events);
        localStorage["bg_reloading"] = false;
    }

    var observer = {
        onMyGoogleCalLoginCompleted: function(a, b){},
        onMyGoogleCalCalendarLoaded: function(a, b){},
        onMyGoogleCalEventLoaded: function(a, b){}
    };

    Blz.Util.extend(observer, {
        onMyGoogleCalLoginCompleted: function(sender, event) {
            log("[EVENT] Cal Login Complete", event);
            if (event.success)app.retrieveAllCalendar();
            update();
        },
        onMyGoogleCalCalendarLoaded: function(sender, event) {
            log("[EVENT] Calendar Loaded", event);
            update();
        },
        onMyGoogleCalEventLoaded: function(sender, event) {
            log("[EVENT] Event Loaded", event);
            update();
        }
    });

    var alerts = {};
    function widget_alert(key, msg){
        alerts = JSON.parse(localStorage.getItem('widget_alert'));
        //Check if were deleting the alert
        if(msg == "" || msg === false){
            delete alerts[key];
        }else{
            log("[WIDGET_ALERT]", msg);
            alerts[key] = msg;
        }
        localStorage["widget_alert"] = JSON.stringify(alerts);
    }

    var notifications = {};
    notifications.base = [];
    function widget_notify(key, msg){
        notifications = JSON.parse(localStorage.getItem('widget_notify'));
        if (typeof (notifications.base) == "undefined") notifications.base = [];
        //Check if were deleting the notification
        if(arguments.length == 1){ msg = key; key = false; }
        if(msg === false){ msg = ""; }

        log("[WIDGET_NOTIFY] [" + key + "] = '" + msg + "'");
        if(key === false){
            if(jQuery.inArray(msg, notifications.base) < 0 )notifications.base.push(msg);
        }else notifications[key] = msg;
        localStorage["widget_notify"] = JSON.stringify(notifications);
    }

    function widget_update(){
        log("[WIDGET_UPDATE] Sent");
        localStorage['widget_update'] = true;
    }

    //Clear the notifications and alerts
    localStorage.removeItem("widget_notify");
    localStorage.removeItem("widget_alert");
    localStorage["widget_notify"] = JSON.stringify(notifications);
    localStorage["widget_alert"] = JSON.stringify(alerts);

    console.log(localStorage);

    //Update every so often
    app.addObserver(observer);

    setInterval(function(){update();},w.getPref('update_interval')*60*1000);
    // update for modified events via 5 min
    setInterval(function(){update(true);},w.getPref('update_interval_force')*60*1000);

    window.update = update; //Store Update as a global variable for external script access
});