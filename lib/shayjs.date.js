//Ensure That ShayJS exists, else fail
if (typeof (ShayJS) == "undefined") {
    window.console.error("The ShayJS.Utils libray depends on the ShayJS base Library");
}

/*|*******************************************|
 *|			  Shay JS Utils Date	          |
 *|*******************************************|*/

ShayJS.Date = function (b, a) {
    this.date = b || new Date();
    this.dateOnly = a === true;
    return this
};

ShayJS.extend(ShayJS.Date, {
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
    },
    fromIso8601: function(s) {
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
    },
    toIso8601: function (d) {
        var c = d instanceof Blz.GData.Date,
            b = c ? d.date : d,
            a = b.getFullYear() + "-" + this.padNumber(b.getMonth() + 1, 2) + "-" + this.padNumber(b.getDate(), 2);
        if (c && d.isDateOnly()) {
            return a
        }
        return a + "T" + this.padNumber(b.getHours(), 2) + ":" + this.padNumber(b.getMinutes(), 2) + ":" + this.padNumber(b.getSeconds(), 2) + "." + this.padNumber(b.getMilliseconds(), 3) + this.getTimezoneOffsetString(b)
    }
});

ShayJS.Date.prototype = {
    addDays: function (b) {
        var a = this.date.getTime() + (24 * 3600000 * b);
        this.date.setTime(a);
        return this
    },
    getYear: function () {
        return this.date.getFullYear()
    },
    getMonth: function () {
        return this.date.getMonth() + 1
    },
    getDate: function () {
        return this.date.getDate()
    },
    getDay: function () {
        return this.date.getDay()
    },
    isWeekend: function () {
        return (this.getDay() == 0 || this.getDay() == 6) ? true : false
    },
    isDateOnly: function () {
        return this.dateOnly
    },
    setDateOnly: function (a) {
        this.dateOnly = a
    },
    resetHours: function () {
        this.date.setHours(0, 0, 0, 0);
        return this
    },
    clone: function () {
        return new Blz.GData.Date(new Date(this.date))
    },
    asDate: function () {
        return new Date(this.date)
    },
    compare: function (a) {
        return (this.date - a.date)
    },
    toKeyString: function () {
        return this.toString()
    },
    toString: function () {
        var c = this.getYear(),
            a = this.getMonth(),
            b = this.getDate();
        a = (a < 10) ? "0" + a : "" + a;
        b = (b < 10) ? "0" + b : "" + b;
        return "" + c + "-" + a + "-" + b
    },
    toLocaleShortString: function () {
        var h = this.getYear(),
            b = this.getMonth(),
            g = this.getDate();
        var e = Boolean(new Date("27/12/2004").getDay());
        var a = Boolean(new Date("12/27/2004").getDay());
        Blz.Widget.print("UKdate = " + e);
        Blz.Widget.print("USdate = " + a);
        var f = !+new Date("32/12/1969 Z");
        var c = !+new Date("12/32/1969 Z");
        Blz.Widget.print("UKtype = " + f);
        Blz.Widget.print("UStype = " + c);
        b = (b < 10) ? "0" + b : "" + b;
        g = (g < 10) ? "0" + g : "" + g;
        return (e) ? "" + g + "/" + b + "/" + h : "" + b + "/" + g + "/" + h
    }
};