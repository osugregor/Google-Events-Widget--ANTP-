//Ensure That ShayJS exists, else fail
if (typeof (ShayJS) == "undefined") {
	window.console.error("The ShayJS.Utils libray depends on the ShayJS base Library");
}

if (typeof (ShayJS.Utils) == undefined) {
	ShayJS.Utils = {};
};

ShayJS.extend(ShayJS.Utils, {

	fromIso8601 = function(s) {
	  if (!s) {
		return null;
	  }

	  s = s.replace('Z', '+00:00');
	  return moment(s, [
		'YYYY-MM-DDTHH:mm:ssZZ', 'YYYY-MM-DDTHHmmssZZ', 'YYYYMMDDTHHmmssZZ',
		'YYYY-MM-DDTHH:mm:ss',   'YYYY-MM-DDTHHmmss',   'YYYYMMDDTHHmmss',
		'YYYY-MM-DDTHH:mmZZ',    'YYYY-MM-DDTHHmmZZ',   'YYYYMMDDTHHmmZZ',
		'YYYY-MM-DDTHH:mm',      'YYYY-MM-DDTHHmm',     'YYYYMMDDTHHmm',
		'YYYY-MM-DDTHH',                                'YYYYMMDDTHH',
		'YYYY-MM-DD',                                   'YYYYMMDD'
	  ]);
	}

}

/*|*******************************************|
 *|			    Shay JS Utils	              |
 *|*******************************************|*/

if (typeof (ShayJS.Utils.Date) == undefined) {
	ShayJS.Utils.Date = {};
};


ShayJS.extend(ShayJS.Utils.Date, {
	addDays: function (date, days) {
        date.getTime() + (24 * 3600000 * days);
        return date;
    },
    isWeekend: function (date) {
        return (date.getDay() == 0 || date.getDay() == 6) ? true : false
    },
    resetHours: function (date) {
        date.setHours(0, 0, 0, 0);
        return date;
    },
    toString: function (date) {
        var c = date.getYear(),
            a = date.getMonth(),
            b = date.getDate();
        a = (a < 10) ? "0" + a : "" + a;
        b = (b < 10) ? "0" + b : "" + b;
        return "" + c + "-" + a + "-" + b
    },
    toLocaleShortString: function (date) {
        var h = date.getYear(),
            b = date.getMonth(),
            g = date.getDate();
        b = (b < 10) ? "0" + b : "" + b;
        g = (g < 10) ? "0" + g : "" + g;
        return (e) ? "" + g + "/" + b + "/" + h : "" + b + "/" + g + "/" + h
    }
}


