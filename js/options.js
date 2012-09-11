var bp = chrome.extension.getBackgroundPage();

ShayJS.DEBUG = true;

ShayJS.log("Init Local Storage", localStorage);

function resetForm(){
    $("input#days_to_show").val(ShayJS.get('days_to_show'));
    $("input#event_old_fade_amount").val(ShayJS.get('event_old_fade_amount'));
}

function save() {
    ShayJS.set('days_to_show', $("#days_to_show").val());
    ShayJS.set('event_old_fade_amount', $("#event_old_fade_amount").val());
    $.gritter.add({
        title: 'Google Events Options',
        text: 'Settings Saved!'
    });
	ShayJS.antp.Widget.update();
}

function go2antp() {
    window.location = "chrome-extension://mgmiemnjjchgkmgbeljfocdjjnpjnmcg/ntp.html";
}

$(document).ready(function() {

    resetForm();

    $("#reset").click(function(){
        resetForm();
    });

    $("#as").click(function(){
        save();
    });

    $("#antp").click(function(){
        go2antp();
    });

    $('nav div').click(function(){
        var section = $(this).attr('data-section');
        $(this).addClass('selected').siblings('div').removeClass('selected');
        $('section#' + section).addClass('selected').siblings('section').removeClass('selected');
    });
});