ShayJS.DEBUG = true;

moment.calendar = {
    lastDay : '[Yesterday]',
    sameDay : 'MMM D (ddd) - [Today]',
    nextDay : 'MMM D (ddd) - [Tomorrow]',
    lastWeek : 'MMM D (ddd)',
    nextWeek : 'MMM D (ddd)',
    sameElse : 'MMM D (ddd)'
};

var init_load = true;

//Browser On Load Event
$(document).ready(function() {

    var Widget = ShayJS.antp.Widget;
    var reloading_timeout = false; //Checks if the min reload time has hit
    var mouse_over_header = false;
    var local_storage_events = ShayJS.get("events") || "{}";
    var $list = $('#events_ul');

    ShayJS.log('Initial Storage', localStorage);

    // When anything in localStorage changes
    $(window).bind('storage', function () {
        ShayJS.log("[EVENT] Storage Changed", localStorage);
        var incoming_events = ShayJS.get("events") || "";
        var widget_update = Widget.requireUpdate();
        var widget_notifications = JSON.parse(Widget.getNotifications());
        var widget_alerts = JSON.parse(Widget.getAlerts());

        // Alerts, block out the calendar
        showAlerts(widget_alerts);

        // Notifications are deletable via user
        for(key in widget_notifications){
            if(key == "base"){
                ShayJS.log("NOTIFICATION: '" + widget_notifications[key] + "'");
                for(base_key in widget_notifications.base)
                    notify(widget_notifications.base[base_key]);
                delete widget_notifications.base;
            }else{
                ShayJS.log("NOTIFICATION: [" + key + "] = '" + widget_notifications[key] + "'");
                notify(key, widget_notifications[key]);
            }
        }
        localStorage[Widget.KEY_NOTIFICATIONS] = JSON.stringify(widget_notifications);
        refreshButton();

        //Check if any events changed or where added
        if(Widget.requireUpdate() || (local_storage_events.localeCompare(incoming_events) != 0 && incoming_events.length > 0)){
            ShayJS.log("[NOTICE] Some events have changed. Forced=" + Widget.requireUpdate());
            Widget.requireUpdate(false);
            local_storage_events = incoming_events;
            updateContent();
        }else{
            //No changes occured, display a notification
            if(!init_load){
                notify('no_changes','No Changes Occured');
            }
        }
        init_load = false;
    });


    function refreshButton(force){
        if(Widget.isFetching() || force){
            $('#refresh').addClass('spin');
            reloading_timeout = true;
            setTimeout(function(){
                reloading_timeout = false;
                $(window).trigger('storage');
            }, 1000);
        }else{
            if(!reloading_timeout){
                $('#refresh').removeClass('spin');
            }
        }
    }

    $('#refresh').click(function(){
        refreshButton(true);
        ShayJS.log("[NOTICE] SENT BG FETCH");
        ShayJS.antp.Widget.shouldFetch(true);
    });

    /*
     Main Update function. Loads the events from the localstorage
     and displays them.
     */
    function updateContent(){
        //parse and wrap JSON objects
        var events = JSON.parse(local_storage_events) || [];
        $.each(events, function(index, value) { 
            value.start = moment(value.start);
            value.end = moment(value.end);
        });
        ShayJS.log("[DEBUG] Updating Content with Events: ", events);

        var now = new Date();
        var eventCount = 0;
        if (events.length == 0) { return; }//leave if no events

        //<ul data-role="listview" data-theme="a" data-divider-theme="c">
        $list.slideUp(function(){
            $(this).html('');
            $(this).show();
        

            var days_to_show = ShayJS.get('days_to_show', ShayJS.Google.Calendar);
            var current_day_offset = 0;//keeps track of which day we are on 

            // Loop every day for days_to_show
            for (current_day_offset; current_day_offset < days_to_show; current_day_offset++) {
                var current_day_start = new moment().add('days', current_day_offset).sod();
                var current_day_end = current_day_start.clone().eod();

                $list.append($.fn._cal_header(current_day_start.calendar(), 0));

                var len = events.length;
                for (var i=0; i<len; i++) {

                    //convert start/end to date object
                    var event = events[i];
                    if(event.end.toDate() <= current_day_start.toDate() || event.start.toDate() >= current_day_end.toDate()) continue;

                    eventCount++;

                    var location = event.location || '';
                    var description = event.description || '';
                    var time = (event.allDay) ? l('ALL_DAY_EVENT') : getTimeString(event.start);
                    var color = $.xcolor.lighten(event.feed.color || "#FFFFFF", 3, 25);
                    //var remain = event.start.duration().humanize();//moment().from(event.start);
                    var remain = event.start.from();
                    var tooltip = event.title;
                    if(description)tooltip = tooltip +'\n' + description;
                    tooltip = tooltip + '\n' + time + ': ' + remain;
                    if(location)tooltip = tooltip +'\n' + location;

                    var $li = $.fn._cal_event(event.title, location, time, event.url, color, i);
                    if(!event.allDay && (event.end < now)){
                        $li.css('opacity', ShayJS.get('event_old_fade_amount'));
                    }
                    $list.append($li.attr({title:tooltip}));
                }

            }

            update_cal_header_counts($list);

            $list.bind('mousewheel', function(e, d) {
                var height = $('#events ul').height(), scrollHeight = $('#events ul').get(0).scrollHeight;
                if((this.scrollTop === (scrollHeight - height) && d < 0) || (this.scrollTop === 0 && d > 0)) {
                    e.preventDefault();
                }
            });

        })
    }

    function update_cal_header_counts($list){
        $list.find('.day_header').each(function(){
            var total = $(this).nextUntil('.day_header').length;
            $(this).find('span.event-count').html(total == 0 ? '' : total);
        });
    }

    function notify(name, msg){
        if(arguments.length == 1){ msg = name; name = ""; }
        if(msg == "" || msg === false){
            $list.siblings('.notification-' + name).slideUp(function(){ $(this).remove(); })
        }else{
            if(name != "" && $list.siblings('.notification-' + name).length > 0)return;

            var notification = $('<div/>');

            var timer = setTimeout(function() { notification.click(); }, 4000);
            
            notification.html(msg)
                .addClass('notification')
                .addClass('notification-' + name)
                .css('cursor', 'notallowed')
                .attr('data-corners','false')
                .attr('data-shadow','false')
                .attr('data-icon','alert')
                .attr('data-theme','e')
                .click(function(){ 
                    $(this).slideUp(function(){ 
                        $(this).remove();
                    });
                    clearTimeout(timer);
                })
                .insertBefore($list);

            
        }
    }

    /*
    Pretty print of a date 
    */
    function getTimeString(date) {
        if (date) {
            var use24 = 0;//TODO...FIX w.getPref('use24HourTime');
            var partOne = date.hours(), partTwo = date.minutes(), amPM = '';
            if (use24==0) {
                if (partOne > 12) {
                    partOne = partOne - 12;
                    amPM = ' PM';
                } else {
                    amPM = (partOne == 12) ? ' PM' : ' AM';
                }
                if (partOne == 0) partOne = 12;
            }
            if (partTwo < 10) partTwo = '0' + partTwo;
            return partOne + ':' + partTwo + amPM;
        }
        return '';
    }

    /* Alerts the user with the object of given events */
    function showAlerts(alerts){
        var key = null;
        if(Object.keys(alerts).length == 0){
            $("#loader-box").stop().animate({top: $("body").height(), opacity: 0}, 500, function(){
                $(this).html(""); //Clear it!
            });
            return;
        }

        // Ensure the alert container is visible
        $("#loader-box").stop().animate({top: "35px", opacity: 1}, 2000, 'easeOutBounce');

        // Check if any alerts should be removed
        $("#loader-box h1").each(function(){
            var exists = false;
            for(key in alerts)if($(this).hasClass('alert-' + key)){ exists = true; break; }
            if(!exists)$(this).fadeOut('slow', function(){ $(this).remove();});
        });

        // Add the new alerts
        for(key in alerts){
            if($("#loader-box h1.alert-" + key).length == 0)
                $("#loader-box").append($("<h1/>").addClass('alert-' + key).html(alerts[key]));
        }

        // If no alerts are left, hide the box and clear it
        if($("#loader-box h1").length == 0)
            $("#loader-box").stop().animate({top: $("body").height(), opacity: 0}, 500, function(){ $(this).html(""); });
    }
    //Trigger storage to show messages
    $(window).trigger('storage');
    updateContent();
});