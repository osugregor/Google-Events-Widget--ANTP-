//Custom jQuery Functions
$.fn.extend({

    _msg: function(message, loading) {
        $(this).append($('<span/>').addClass((loading) ? 'indicator' : 'message').html(message));
        return this;
    },
    _cal_header: function(title, count){
        var count = $('<span/>').addClass('event-count').html(count);
        return $('<li/>').addClass('day_header')
            .html(title).append(count).click(function(){
                $(this).nextUntil('.day_header').slideToggle();
            });
    },
    _cal_event: function(title, location, time, url, color, event_num){

        var li = $('<li/>').addClass('event');
        var event_title = $('<div/>').addClass('event-title').html(title);
        var event_time = $('<div/>').addClass('event-time').html(time);
        var event_color = $('<div/>').addClass('event_color').css('background-color', color);
        var event_details = $('<a/>').addClass('event-details').attr({href:url,target:'_top'}).html(event_title).append(event_time);
        if(location){
            var event_location = $('<p/>').addClass('event-location').html(location);
            event_details.append(event_location)
            li.addClass('has_Location');
        }
        li.append(event_details).prepend(event_color);
        return li;
    },
    appointmentCompare: function (d, c) {
		var a = new Date(d.start);
		var b = new Date(c.start);
		
        var e = a - b;
        if (e == 0) {
            if (d.title < c.title) {
                return -1;
            } else {
                if (d.title > c.title) {
                    return 1;
                } else {
                    return 0;
                }
            }
        }
        return e
    }
});