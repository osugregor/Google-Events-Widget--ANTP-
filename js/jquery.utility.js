//Custom jQuery Functions
$.fn.extend({

    _msg: function(message, loading) {
        $(this).append($('<span/>').addClass((loading) ? 'indicator' : 'message').html(message));
        return this;
    },
    _cal_header: function(title, count){
        //<li data-role="list-divider" role="heading">Date<span class="ui-li-count">2</span></li>
        var count = $('<span/>').addClass('ui-li-count').html(count);
        return $('<li/>').attr('data-role', 'list-divider')
            .attr('role', 'heading')
            .html(title).append(count).click(function(){
                $(this).nextUntil('li[data-role="list-divider"]').slideToggle();
            });
    },
    _cal_event: function(title, location, time, url, color){
        //<li data-corners="false" data-shadow="false" data-icon="false">
        //	<span class="ui-li-aside ui-btn-inner event_color" style="padding: 0"></span>
        //	<a href="index.html">
        //		<h3 class="ui-li-heading">Event Title</h3>
        //		<p class="ui-li-aside ui-li-desc"><strong>12:00</strong>PM</p>
        //		<p class="ui-li-desc event_location">Location</p>
        //	</a>
        //</li>
        var li = $('<li/>').addClass('event').attr('data-corners','false').attr('data-shadow','false').attr('data-icon','false');
        if(location){
            log(location);
        }else{
            log("no location");
        }

        var event_title = $('<h3/>').addClass('ui-li-heading').html(title);
        var event_time = $('<p/>').addClass('ui-li-aside ui-li-desc').html(time);
        log("URL:"+url)
        var event_details = $('<a/>').attr({href:url,target:'_top'}).html(event_title).append(event_time);
        if(location){
            var event_location = $('<p/>').addClass('ui-li-desc event_location').html(location);
            event_details.append(event_location);
        }
        li.append(event_color).append(event_details);
        var event_color = $('<span/>').addClass('ui-li-aside ui-btn-inner event_color').css('height', location ? 30 : 20).css('padding', '0').css('background-color', color);
        li.prepend(event_color);
        return li;
    },
    appointmentCompare: function (d, c) {
        var e = d.start - c.start;
        if (e == 0) {
            if (d.title < c.title) {
                return -1
            } else {
                if (d.title > c.title) {
                    return 1
                } else {
                    return 0
                }
            }
        }
        return e
    }
});