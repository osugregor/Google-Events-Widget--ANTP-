var bp = chrome.extension.getBackgroundPage();

ShayJS.log("Init Local Storage", localStorage);

$.extend($.gritter.options, { 
    position: 'top-right', // defaults to 'top-right' but can be 'bottom-left', 'bottom-right', 'top-left', 'top-right' (added in 1.7.1)
    fade_in_speed: 'fast', // how fast notifications fade in (string or int)
    fade_out_speed: 'fast', // how fast the notices fade out
    time: 2500 // hang on the screen for...
});

function resetForm(){
    $("input:not([type='button']),select").each(function(){
        reset(this);
    });
}

function reset(input){
    $(input).val(ShayJS.defaults[$(input).attr('id')]).change();
}

function save(input) {
    input = $(input);
    if(input.val() == ShayJS.defaults[input.attr('id')]){
        ShayJS.remove(input.attr('id'));
    }else{
        ShayJS.set(input.attr('id'), input.val());
        var tmp = $.gritter.add({
            title: "Setting Saved",
            text: $("label[for='" + input.attr("id") + "']").text() + " changed to '" + input.val() + "'",
            before_open: function(){
                if($('.gritter-item-wrapper').length >= 3){
                    // Returning false prevents a new gritter from opening
                    var unique_id = $("#gritter-notice-wrapper .gritter-item-wrapper:first-child").attr("id");
                    if($('.gritter-item-wrapper').length >= 4){
                        $("#gritter-notice-wrapper .gritter-item-wrapper:first-child").remove();
                    }else{
                        $.gritter.remove(unique_id.match(/gritter-item-(.*)/)[1],{ speed: 200 });
                    }
                    return true;
                }
            }
        });
    }
	ShayJS.antp.Widget.shouldUpdate(true);
}

function go2antp() {
    window.location = "chrome-extension://mgmiemnjjchgkmgbeljfocdjjnpjnmcg/ntp.html";
}

$(document).ready(function() {

    $("input,select").change(function(){
        save(this);
    });

    //Load initial values
    $("input:not([type='button']),select").each(function(){
        $(this).val(ShayJS.get($(this).attr('id')))
    });

    $("#reset").click(function(){
        var answer = confirm("Are you sure you want to reset all settings? This cannot be undone!");
        if(answer){
            resetForm();
        }
    });

    $("#antp").click(function(){
        go2antp();
    });

    $('nav div').click(function(){
        var section = $(this).attr('data-section');
        $(this).addClass('selected').siblings('div').removeClass('selected');
        $('section#' + section).addClass('selected').siblings('section').removeClass('selected');
    });

    $(".field").each(function(){
        var resetLink = $("<span/>").html("reset").addClass("reset").click(function(){
            reset($(this).parent().find("input,select"));
        });
        $(this).append(resetLink);
    });
});

function ucwords (str) {
    return (str + '').replace(/^([a-z])|\s+([a-z])/g, function ($1) {
        return $1.toUpperCase();
    });
}