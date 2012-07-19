if (typeof (Blz) == "undefined") {
    Blz = {}
}

/************************************************
                   Utilities
 *************************************************/
Blz.Util = {
    extend: function (a, c) {
        for (var b in c) {
            a[b] = c[b]
        }
        return a
    }
};

/************************************************
                   Notifier
 *************************************************/
Blz.Notifier = {
    observers: [],
    notifyMethodPrefix: "",
    suppressNotifications: 0,
    addObserver: function (b) {
        if (!b) {
            return
        }
        for (var c = 0, a = this.observers.length; c < a; c++) {
            if (this.observers[c] == b) {
                return
            }
        }
        this.observers[a] = b
    },
    removeObserver: function (b) {
        if (!b) {
            return
        }
        for (var c = 0, a = this.observers.length; c < a; c++) {
            if (this.observers[c] == b) {
                this.observers.splice(c, 1);
                break
            }
        }
    },
    notifyObservers: function (b, d) {
        if (!b) {
            return
        }
        b = this.notifyMethodPrefix + b;
        if (!this.suppressNotifications) {
            for (var c = 0, a = this.observers.length; c < a; c++) {
                var e = this.observers[c];
                if (e) {
                    if (typeof e == "function") {
                        e(b, this, d)
                    } else {
                        if (e[b]) {
                            e[b](this, d)
                        }
                    }
                }
            }
        }
    },
    enableNotifications: function () {
        if (--this.suppressNotifications < 0) {
            this.suppressNotifications = 0
        }
    },
    disableNotifications: function () {
        ++this.suppressNotifications
    }
};

/************************************************
                    XML Parser
 *************************************************/
Blz.XML = {};
Blz.XML.Parser = {
    string2object: function (a) {
        var b = new Blz.XML.SimpleElement();
        return b.parse(a)
    },
    file2object: function (b) {
        var a = filesystem.readFile(b);
        return this.string2object(a)
    }
};
Blz.XML.SimpleElement = function (a) {
    this.initialize(a)
};
Blz.XML.SimpleElement.prototype = {
    initialize: function (a) {
        this.attr_prefix = "-";
        this.isarray = true;
        if (a) {
            this.parse(a)
        }
    },
    parse: function (c) {
        var b, a;
        if (typeof (window) != "undefined" && window.DOMParser) {
            this.attr_prefix = "";
            a = new DOMParser();
            var d = a.parseFromString(c, "application/xml");
            if (!d) {
                return
            }
            b = d.documentElement
        } else {
            if (typeof (window) != "undefined" && window.ActiveXObject) {
                a = new ActiveXObject("Microsoft.XMLDOM");
                a.async = false;
                a.loadXML(c);
                b = a.documentElement
            } else {
                if (typeof (XMLDOM) != "undefined" && XMLDOM) {
                    this.attr_prefix = "";
                    a = XMLDOM.parse(c);
                    b = a.documentElement;
                    this.isarray = false
                }
            }
        }
        if (!b) {
            return
        }
        return this.parseDOM(b)
    },
    parseDOM: function (a) {
        if (!a) {
            return
        }
        this.__force_array = {};
        if (this.force_array) {
            for (var c = 0; c < this.force_array.length; c++) {
                this.__force_array[this.force_array[c]] = 1
            }
        }
        var b = this.parseElement(a);
        if (this.__force_array[a.nodeName]) {
            b = [b]
        }
        return b
    },
    parseElement: function (e) {
        if (e.nodeType == 7) {
            return
        }
        if (e.nodeType == 3 || e.nodeType == 4) {
            var f = e.nodeValue.match(/[^\x00-\x20]/);
            if (f == null) {
                return
            }
            return e.nodeValue
        }
        var b;
        var d = {};
        if (e.attributes && e.attributes.length) {
            b = {};
            for (var g = 0; g < e.attributes.length; g++) {
                var j = (this.isarray) ? e.attributes[g].nodeName : e.attributes.item(g).nodeName;
                if (typeof (j) != "string") {
                    continue
                }
                var c = (this.isarray) ? e.attributes[g].nodeValue : e.attributes.item(g).nodeValue;
                if (!c) {
                    continue
                }
                j = this.attr_prefix + j;
                if (typeof (d[j]) == "undefined") {
                    d[j] = 0
                }
                d[j]++;
                this.addNode(b, j, d[j], c)
            }
        }
        if (e.childNodes && e.childNodes.length) {
            var h = true;
            if (b) {
                h = false
            }
            for (var g = 0; g < e.childNodes.length && h; g++) {
                var a = (this.isarray) ? e.childNodes[g].nodeType : e.childNodes.item(g).nodeType;
                if (a == 3 || a == 4) {
                    continue
                }
                h = false
            }
            if (h) {
                if (!b) {
                    b = ""
                }
                for (var g = 0; g < e.childNodes.length; g++) {
                    b += (this.isarray) ? e.childNodes[g].nodeValue : e.childNodes.item(g).nodeValue
                }
            } else {
                if (!b) {
                    b = {}
                }
                for (var g = 0; g < e.childNodes.length; g++) {
                    var j = (this.isarray) ? e.childNodes[g].nodeName : e.childNodes.item(g).nodeName;
                    if (typeof (j) != "string") {
                        continue
                    }
                    var c = (this.isarray) ? this.parseElement(e.childNodes[g]) : this.parseElement(e.childNodes.item(g));
                    if (!c) {
                        continue
                    }
                    if (typeof (d[j]) == "undefined") {
                        d[j] = 0
                    }
                    d[j]++;
                    this.addNode(b, j, d[j], c)
                }
            }
        }
        return b
    },
    addNode: function (c, a, b, d) {
        if (this.__force_array[a]) {
            if (b == 1) {
                c[a] = []
            }
            c[a][c[a].length] = d
        } else {
            if (b == 1) {
                c[a] = d
            } else {
                if (b == 2) {
                    c[a] = [c[a], d]
                } else {
                    c[a][c[a].length] = d
                }
            }
        }
    },
    scalar2xml: function (a, b) {
        if (a == "#text") {
            return this.escape(b)
        } else {
            return "<" + a + ">" + this.escape(b) + "</" + a + ">\n"
        }
    },
    array2xml: function (b, e) {
        var a = [];
        for (var c = 0; c < e.length; c++) {
            var d = e[c];
            if (typeof (d) == "undefined" || d == null) {
                a[a.length] = "<" + b + " />"
            } else {
                if (typeof (d) == "object" && d.constructor == Array) {
                    a[a.length] = this.array2xml(b, d)
                } else {
                    if (typeof (d) == "object") {
                        a[a.length] = this.hash2xml(b, d)
                    } else {
                        a[a.length] = this.scalar2xml(b, d)
                    }
                }
            }
        }
        return a.join("")
    },
    hash2xml: function (c, b) {
        var f = [];
        var a = [];
        for (var e in b) {
            if (!b.hasOwnProperty(e)) {
                continue
            }
            var h = b[e];
            if (e.charAt(0) != this.attr_prefix) {
                if (typeof (h) == "undefined" || h == null) {
                    f[f.length] = "<" + e + " />"
                } else {
                    if (typeof (h) == "object" && h.constructor == Array) {
                        f[f.length] = this.array2xml(e, h)
                    } else {
                        if (typeof (h) == "object") {
                            f[f.length] = this.hash2xml(e, h)
                        } else {
                            f[f.length] = this.scalar2xml(e, h)
                        }
                    }
                }
            } else {
                a[a.length] = " " + (e.substring(1)) + '="' + (this.xml_escape(h)) + '"'
            }
        }
        var g = a.join("");
        var d = f.join("");
        if (typeof (c) == "undefined" || c == null) {} else {
            if (f.length > 0) {
                if (d.match(/\n/)) {
                    d = "<" + c + g + ">\n" + d + "</" + c + ">\n"
                } else {
                    d = "<" + c + g + ">" + d + "</" + c + ">\n"
                }
            } else {
                d = "<" + c + g + " />\n"
            }
        }
        return d
    },
    escape: function (a) {
        return String(a).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")
    }
};

/************************************************
                  Google Data
 *************************************************/
Blz.GData = {
    source: "",
    hasSession: false,
    useGoogleLogin: true,
    loginUrl: "https://www.google.com/accounts/ClientLogin",
    isLoginRequesting: false,
    isLogin: false,
    mail: "",
    pass: "",
    authContent: "",
    gsessionid: "",
    fixMail: function (a) { 
		return (a.indexOf("@") == -1) ? a += "@gmail.com" : a; 
	},
    getMailDomain: function () {
        var a = this.mail || "";
        return (a.indexOf("@") == -1) ? a.substr(a.indexOf("@") + 1) : "gmail.com";
    },
    login: function (b, e, g) {
        this.isLogin = false;
        this.hasSession = false;
        if (b == "" && e == "") {
            return false
        }
        this.mail = this.fixMail(b);
        this.pass = e;
        var a = {
            accountType: "HOSTED_OR_GOOGLE",
            Email: this.mail,
            Passwd: this.pass,
            service: "cl",
            source: this.source
        };
        var c = this.loginUrl,
            d = g || this.createSessionUrl();
        var f = this;
        f.isLoginRequesting = true;
        log("Blz.GData.login: Sending Login Reguest", a);
        jQuery.post(c, a, function (h) {
            f.isLoginRequesting = false;
            if (h.success) {
                if (h.success = f.parseAuthContent(h.data)) {
                    f.isLogin = true;
                    f.hasSession = false;
                    if (d) {
                        f.session(d)
                    } else {
                        f.notifyObservers("LoginCompleted", h)
                    }
                }
            } else {
                f.isLogin = false;
                f.authContent = "";
                f.notifyObservers("LoginCompleted", h)
            }
        });
    },
    logout: function () {
        if (this.isLoginRequesting) {
            Blz.Widget.print("Blz.GData.logout: logout failed");
            return
        }
        this.mail = "";
        this.pass = "";
        this.isLogin = false;
        this.hasSession = false;
        this.authContent = "";
        this.gsessionid = ""
    },
    session: function (a) {
        var d = this,
            a = a || this.createSessionUrl();
        d.isLoginRequesting = true;
        d.gsessionid = "";
        var b = new XMLHttpRequest();
        if (typeof (b.autoRedirect) != "undefined") {
            b.autoRedirect = false
        }
        b.open("GET", a, true);
        var c = this.getAuthHeader();
        for (prop in c) {
            if (c.hasOwnProperty(prop)) {
                b.setRequestHeader(prop, c[prop])
            }
        }
        b.onreadystatechange = function () {
            if (this.readyState == 4) {
                d.isLoginRequesting = false;
                Blz.Widget.print("Blz.GData.session: sestion http status = " + this.status);
                if (this.status == 302) {
                    var j = this.getAllResponseHeaders();
                    for (var f = 0, e = j.length; f < e; f++) {
                        var g = j[f];
                        if (match = /gsessionid=([A-Za-z0-9_-]+)$/.exec(j[f])) {
                            d.gsessionid = match[1];
                            d.hasSession = true
                        }
                    }
                } else {
                    if (this.status == 200) {
                        d.hasSession = true
                    }
                }
                d.notifyObservers("LoginCompleted", {
                    success: (this.status == 200 || this.status == 302),
                    response: this
                })
            }
        };
        b.send()
    },
    getAuthHeader: function () {
        var a = {
            "GData-Version": 2
        };
        if (this.useGoogleLogin) {
            a.Authorization = "GoogleLogin auth=" + this.authContent
        }
        return a
    },
    parseAuthContent: function (b) {
        var a;
        if (a = /Auth=([A-Za-z0-9_-]+)/.exec(b)) {
            this.authContent = a[1];
            return true
        }
        return false
    }
};
Blz.Util.extend(Blz.GData, Blz.Notifier);

/************************************************
 GData Date
 *************************************************/
Blz.GData.Date = function (b, a) {
    this.date = b || new Date();
    this.dateOnly = a === true;
    return this
};
Blz.Util.extend(Blz.GData.Date, {
    fromIso8601: function (g) {
        var j = parseInt(g.substring(0, 4), 10),
            h = parseInt(g.substring(5, 7), 10) - 1,
            m = parseInt(g.substring(8, 10), 10);
        if (g.toUpperCase().indexOf("T") == -1) {
            return new Blz.GData.Date(new Date(j, h, m), true)
        }
        var k = parseInt(g.substring(11, 13), 10),
            c = parseInt(g.substring(14, 16), 10),
            l = parseInt(g.substring(17, 19), 10),
            b = parseInt(g.substring(20, 23), 10),
            i = new Date(j, h, m, k, c, l, b);
        if (g.length > 23) {
            var f = 0,
                e = g.charAt(23);
            if (e !== "Z") {
                var n = parseInt(g.substring(24, 26), 10),
                    a = parseInt(g.substring(27, 29), 10);
                f = n * 60 + a;
                if (e !== "-") {
                    f = -f
                }
            }
            f -= i.getTimezoneOffset();
            if (f != 0) {
                i.setTime(i.getTime() + f * 60000)
            }
        }
        return new Blz.GData.Date(i)
    },
    padNumber: function (c, b) {
        var a = c.toString();
        while (a.length < b) {
            a = "0" + a
        }
        return a
    },
    getTimezoneOffsetString: function (b) {
        var f, d = b.getTimezoneOffset();
        if (d == 0) {
            f = "Z"
        } else {
            var e = Math.abs(d) / 60,
                c = Math.floor(e),
                a = (e - c) * 60;
            f = (d > 0 ? "-" : "+") + this.padNumber(c, 2) + ":" + this.padNumber(a, 2)
        }
        return f
    },
    toIso8601: function (d) {
        var c = d instanceof Blz.GData.Date,
            b = c ? d.date : d,
            a = b.getFullYear() + "-" + this.padNumber(b.getMonth() + 1, 2) + "-" + this.padNumber(b.getDate(), 2);
        if (c && d.isDateOnly()) {
            return a
        }
        return a + "T" + this.padNumber(b.getHours(), 2) + ":" + this.padNumber(b.getMinutes(), 2) + ":" + this.padNumber(b.getSeconds(), 2) + "." + this.padNumber(b.getMilliseconds(), 3) + this.getTimezoneOffsetString(b)
    },
    toDateString: function (b) {
        b = b || this.date;
        var j = b.getFullYear(),
            c = b.getMonth() + 1,
            i = b.getDate();
        var k = b.getHours(),
            f = b.getMinutes(),
            h = b.getSeconds();
        if (c < 10) {
            c = "0" + c
        }
        if (i < 10) {
            i = "0" + i
        }
        if (k < 10) {
            k = "0" + k
        }
        if (f < 10) {
            f = "0" + f
        }
        if (h < 10) {
            h = "0" + h
        }
        var e = b.getTimezoneOffset();
        if (e == 0) {
            e = ""
        } else {
            var l = e / 60;
            var g = e % 60;
            var a = (l > 0) ? "-" : "+";
            if (l < 0) {
                l *= -1
            }
            if (l < 10) {
                l = "0" + l
            }
            if (g < 10) {
                g = "0" + g
            }
            e = a + l + ":" + g
        }
        return j + "-" + c + "-" + i + "T" + k + ":" + f + ":" + h + e
    }
});
Blz.GData.Date.prototype = {
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

/************************************************
					Google Cal
*************************************************/
if (typeof (Blz.Google) == "undefined") {
    Blz.Google = {}
}
Blz.Google.Calendar = {
    url: "https://www.google.com/calendar/",
    baseUrl: "https://www.google.com/calendar/feeds",
    rgxAllDay: /^([0-9]+)-([0-9]+)-([0-9]+)$/,
    rgxDate: /^([0-9]+)-([0-9]+)-([0-9]+)T([0-9]+):([0-9]+):([0-9]+)/,
    isLoading: false,
    visibility: "private",
    projection: "full",
    cacheCalendars: [],
    initialize: function () {
        this.notifyMethodPrefix = "onGoogleCalendar"
    },
    isHosted: function () {
        return (this.getMailDomain() != "gmail.com")
    },
    getUrl: function () {
        var a = this.getMailDomain();
        if (a != "gmail.com") {
            return "https://www.google.com/calendar/hosted/" + a
        }
        return this.url
    },
    getAccount: function () {
        var a = this.mail || "";
        return (a == "" || a.indexOf("@gmail.com") != -1) ? "default" : a
    },
    createSessionUrl: function () {
        return this.baseUrl + "/" + this.getAccount() + "/private/full"
    },

    retrieveCalendar: function (c) {
        var _this = this; //Store this

        //Check were not already retreiving and we have a session
        if (this.isCalendarListRequesting) { return }
        if (!this.hasSession) {
            Blz.Widget.print("Blz.Google.Calendar.retrieveCalendar: no session");
            this.session();
            return false
        }

        //Setup the url that will query the Gcal feed
        var url = this.baseUrl + "/" + this.getAccount() + "/allcalendars/full";
        if (this.gsessionid != "") {
            url += "?gsessionid=" + this.gsessionid
        }
        Blz.Widget.print("Blz.Google.Calendar.retrieveCalendar --Sending Request-- ", url);
        this.isCalendarListRequesting = true;
        jQuery.ajax({
            url: url,
            data: {},
            headers: this.getAuthHeader()
        }).success(function (data, textStatus, response) {
            try {
                _this.isCalendarListRequesting = false;
                Blz.Widget.print("Blz.Google.Calendar.retrieveCalendar --Request Received-- Response:", response);

                var k = [],
                    success = (textStatus == "success");
                if (response.status != 200) {
                    Blz.Widget.print("[WARNING] Blz.Google.Calendar.retrieveCalendar: Http Status = " + repsonse.status)
                }
                if (success) {
                    k = _this.parseCalendars(response.responseText);
                } else {} if (response.status == 401) {
                    _this.hasSession = false
                }
                _this.notifyObservers("CalendarRetrieved", {
                    success: success,
                    context: c,
                    items: k
                })
            } catch (err) {
                Blz.Widget.print("[ERROR] Blz.Google.Calendar.retrieveCalendar:" + err.message)
            }
        }).error(function(response, status, error){
            Blz.Widget.debug("Blz.Google.Calendar.retrieveCalendar --Request Failed--\n", [response, status, error]);
        }).complete(function(){
            _this.isCalendarListRequesting = false;
        });
    },
    parseCalendars: function (b) {
        var h = Blz.Widget,
            g = [];
        try {
            var j = Blz.XML.Parser.string2object(b);
            if (j.entry.length != null) {
                for (var c = 0, d = j.entry.length; c < d; c++) {
                    var a = this.createCalendar(j.entry[c]);
                    g.push(a)
                }
            } else {
                var f = this.createCalendar(j.entry);
                g.push(f)
            }
        } catch (e) {
            h.print("[ERROR] Blz.Google.Calendar.parseCalendars:" + e)
        }
        this.cacheCalendars = g;
        return g
    },
    createCalendar: function (j) {
        var i = "",
            h = "",
            a = "",
            d = "",
            b = false,
            f = false;
        try {
            i = j.id;
            h = j.title;
            d = j.link[0]["href"] || j.link.href;
            a = j["gCal:color"]["value"] || "";
            b = j["gCal:selected"]["value"] != "false" || false;
            f = j["gCal:hidden"]["value"] != "false" || false
        } catch (g) {
            Blz.Widget.print("[ERROR] Blz.Google.Calendar.createCalendar: " + g)
        }
        return {
            id: i,
            title: h,
            color: a,
            link: d,
            selected: b,
            hidden: f
        }
    },
    retrieveEvent: function (e, data, c) {
        var d = this,
            a = Blz.Widget;
        if (!data) {
            data = {}
        }
        var url = e.link;
		
		//Additional google paramters
        data.singleevents = true;
        data.orderby = "starttime";
        data['max-results'] = 100000;
		
        if (this.gsessionid != "") {
            url += "?gsessionid=" + this.gsessionid
        }
        if (!this.hasSession) {
            a.print("Blz.Google.Calendar.retrieveEvent: no session!");
            this.session(url);
            return false
        }
        var headers = this.getAuthHeader();
        jQuery.ajax({
            url: url,
            data: data,
            headers: headers
        }).success(function(data, textStatus, response) {
            Blz.Widget.print("Blz.Google.Calendar.retrieveEvent --Request Received--");
            try {
                var success = (textStatus == "success"),
                    k = [];
                if (response.status != 200) {
                    a.print("Blz.Google.Calendar.retrieveEvent: Http Status = " + response.status)
                }
                if (success) {
                    k = d.parseEvents(response.responseText);
                    for (var j = 0, h = k.length; j < h; j++) {
                        k[j].color = e.color
                    }
                } else {} if (response.status == 401) {
                    d.hasSession = false
                }
                d.notifyObservers("EventRetrieved", {
                    success: success,
                    context: c,
                    items: k
                })
            } catch (m) {
                Blz.Widget.print("Blz.Google.Calendar.retrieveEvent: " + m)
            }
        }).error(function(response, status, error){
            Blz.Widget.print("Blz.Google.Calendar.retrieveEvent --Request Failed--");
            Blz.Widget.debug(response);
            Blz.Widget.debug(status);
            Blz.Widget.debug(error);
        }).complete(function(){
            d.isCalendarListRequesting = false;
        });
    },
    parseEvents: function (h) {
        var c = [];
        try {
            var f = Blz.XML.Parser.string2object(h);
            if (f.entry) {
                if (f.entry.length != null) {
                    for (var b = 0, a = f.entry.length; b < a; b++) {
                        var d = this.createEvent(f.entry[b]);
                        c.push(d)
                    }
                } else {
                    var d = this.createEvent(f.entry);
                    c.push(d)
                }
                c.sort(function (i, e) {
                    if (i.start == e.start) {
                        return (i.end - e.end)
                    }
                    return i.start - e.start
                })
            }
        } catch (g) {
            Blz.Widget.print("Blz.Google.Calendar.parseEvents: " + g)
        }
        return c
    },
    createEvent: function (g) {
        var l = Blz.Widget,
            b = "",
            j = "",
            k = "",
            n = "",
            d = "",
            m = "";
        var a = 0,
            c = 0,
            o = 0;
        try {
            b = g.id;
            j = g.link[0]["href"] || g.link.href;
            k = g.title;
            n = g.content;
            d = (g.author && g.author[0]) ? g.author[0].name : "";
            m = (g["gd:where"]) ? g["gd:where"]["valueString"] : "";
            var o = false;
            var h = g["gd:when"];
            if (h) {
                if (h[0]) {
                    h = h[0]
                }
                a = h.startTime || 0;
                c = h.endTime || 0
            }
            var i = Blz.GData.Date.fromIso8601(a),
                f = Blz.GData.Date.fromIso8601(c);
            o = (i.isDateOnly() || f.isDateOnly()) ? 1 : 0;
            a = i.date;
            c = f.date
        } catch (g) {
            Blz.Widget.print("Blz.Google.Calendar.createEvent: " + g)
        }
        return {
            id: b,
            link: j,
            title: k,
            author: d,
            description: n,
            location: m,
            start: a,
            end: c,
            allDay: o
        }
    },
    parseGDataFromJson: function (e) {
        var c = [];
        for (var b = 0, a = e.entry.length; b < a; b++) {
            var d = this.createEventFromJson(e.entry[b]);
            c.push(d)
        }
        c.sort(function (g, f) {
            if (g.start == f.start) {
                return (g.end - f.end)
            }
            return g.start - f.start
        });
        return c
    },
    createEventFromJson: function (f) {
        try {
            var g = 0,
                b = 0,
                d = 0;
            var c = (f.author && f.author[0]) ? f.author[0].name.$t : "";
            var a = (f.gd$where && f.gd$where[0]) ? f.gd$where[0] : "";
            var d = false;
            g = (f.gd$when && f.gd$when[0]) ? f.gd$when[0].startTime || 0 : 0;
            b = (f.gd$when && f.gd$when[0]) ? f.gd$when[0].endTime || 0 : 0;
            if (match = this.rgxAllDay.exec(g)) {
                d = 1;
                g = new Date(match[1], match[2] - 1, match[3], 0, 0, 0, 0)
            } else {
                if (match = this.rgxDate.exec(g)) {
                    g = new Date(match[1], match[2] - 1, match[3], match[4], match[5], match[6], 0)
                }
            }
            if (match = this.rgxAllDay.exec(b)) {
                d = 1;
                b = new Date(match[1], match[2] - 1, match[3], 0, 0, 0, 0)
            } else {
                if (match = this.rgxDate.exec(b)) {
                    b = new Date(match[1], match[2] - 1, match[3], match[4], match[5], match[6], 0)
                }
            }
        } catch (f) {
            Blz.Widget.print("Blz.Google.Calendar.createEventFromJson: " + f)
        }
        return {
            title: f.title.$t,
            author: c,
            location: a,
            start: g,
            end: b,
            allDay: d
        }
    }
};
Blz.Util.extend(Blz.Google.Calendar, Blz.GData);

/************************************************
					Widget
*************************************************/
Blz.Widget = {
    defaults: {
        days_to_show: 5,
        offset: 0,
        update_interval: 1, //Minutes
        update_interval_force: 3, //Minutes,
        widget_alert: "{}",
        widget_notify: "{}",
        event_old_fade_amount: .4
    },
    debug: function (a, b) {},
    print: function (a, b) {},
    setPref: function (a, b) {},
    getPref: function (a) { return "bb"; },
    getResourceString: function (a) { return ""; }
};
Blz.Util.extend(Blz.Widget, {
    debug: function (a, obj) {
        if(typeof obj === 'undefined' || obj == null){
            log("(BLZ)[DEBUG] %o", a);
        }else{
            log(a,obj);
        }
    },
    print: function (a, obj) {
        if(typeof obj === 'undefined' || obj == null){
            log("(BLZ) " + a)
        }else{
            log(a,obj);
        }
    },
    setPref: function (a, b) {
        try {
            if (window.localStorage) {
                localStorage[a] = b
            }
        } catch (c) {}
    },
    getPref: function (a) {
        var b = "";
        try {
            if (window.localStorage) {
                b = localStorage[a]
            }
        } catch (c) {}
        if(b === undefined)b = Blz.Widget.defaults[a];
        return b
    },
    getResourceString: function (b, a) {
        if (typeof (chrome) != "undefined" && typeof (chrome.i18n) != "undefined") {
            return chrome.i18n.getMessage(b, a)
        }
        return b
    }
});


/************************************************
			 Google Cal Application
*************************************************/
var MyGoogleCal = {};
MyGoogleCal.Application = {
    initialize: function () {
        var a = Blz.Widget;
        try {
            this.notifyMethodPrefix = "onMyGoogleCal";
            this.gcal = Blz.Google.Calendar;
            this.cacheAppts = [];
            this.cacheCalendars = [];
            this.gcal.initialize();
            this.gcal.addObserver(this);
            if (this.gcal.useGoogleLogin) {
                a.print("MyGoogleCal.Application: Google Login mode");
                var b = a.getPref("mail");
                var c = a.getPref("password");
                this.gcal.login(b, c)
            } else {
                a.print("MyGoogleCal.Application: browser session mode");
                this.gcal.session()
            }
        } catch (d) {
            a.print("MyGoogleCal.Application.initialize: " + d)
        }
    },
    isGoogleApps: function () {
        return this.gcal.isHosted()
    },
    getCalendarUrl: function () {
        return this.gcal.getUrl()
    },
    login: function (b, c) {
        var a = Blz.Widget,
            d = this.gcal;
        if (d.mail != d.fixMail(b) || d.pass != c) {
            this.clearCache();
            d.login(b, c)
        }
    },
    logout: function () {
        if (this.gcal.logout()) {
            this.clearCache()
        }
    },
    session: function (a) {
        if (!this.isLogin() || a) {
            this.gcal.session()
        }
    },
    isLogin: function () {
        return this.gcal.hasSession
    },
    isLoginRequesting: function () {
        return this.gcal.isLoginRequesting
    },
    isCalendarListRequesting: function () {
        return this.gcal.isCalendarListRequesting
    },
    dispose: function () {
        var a = Blz.Widget;
        try {
            this.dispose = true
        } catch (b) {
            a.print("MyGoogleCal.Application.dispose: " + b)
        }
    },
    clearCache: function () {
        this.cacheAppts = []
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
    },
    findCalendarById: function (e) {
        var d = this.gcal.cacheCalendars;
        for (var b = 0, a = d.length; b < a; b++) {
            var c = d[b];
            if (c.id == e) {
                return c
            }
        }
        return false
    },
    retrieveAllCalendar: function () {
        this.clearCache();
        this.gcal.retrieveCalendar();
    },
    findFocusEvent: function () {
        if (!this.isLogin() || this.isCalendarListRequesting()) {
            return
        }
        for (var f = 0; f < 3; f++) {
            var k = [],
                d = (new Blz.GData.Date()).addDays(f).resetHours(),
                a = this.getAppointments(d);
            if (!a) {
                return
            }
            for (calid in a.items) {
                var c = this.findCalendarById(calid);
                if (c && c.selected) {
                    k = k.concat(a.items[calid])
                }
            }
            if (k.length > 0) {
                k.sort(this.appointmentCompare);
                var j = -1,
                    e = new Date();
                for (var g = 0, h = k.length; g < h; g++) {
                    var b = k[g];
                    if (b.allDay) {
                        continue
                    }
                    if (e > b.end) {
                        continue
                    }
                    if (e >= b.start && e <= b.end) {} else {
                        if (b.start - e < 30 * 60 * 1000) {
                            j = g
                        }
                        if (-1 == j) {
                            j = g
                        }
                        break
                    }
                }
                if (j != -1) {
                    return k[j]
                }
            }
        }
        return
    },
    getAppointments: function (gStartDate) {
        try {
            var gStartDateKey = gStartDate.toKeyString();
            var apts = this.cacheAppts[gStartDateKey] || {
                loaded: false,
                loading: false
            };
            if (!apts.loaded) {
                if (!apts.loading) {
                    apts.items = {};
                    apts.loading = true;
                    apts.loadingCount = 0;
					var num_days = Blz.Widget.getPref('days_to_show');
                    num_days = (!isNaN(num_days)) ? num_days : 5;
                    var startDate = gStartDate.date;
                    var startMin = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate(), 0, 0, 0, 0);
                    var startMax = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate(), (24 * num_days) - 1, 59, 59, 0);
                    var g = {
                        "start-min": Blz.GData.Date.toDateString(startMin),
                        "start-max": Blz.GData.Date.toDateString(startMax)
                    };
                    Blz.Widget.debug("MyGoogleCal.Application.getAppointments from " + g["start-min"] + " to " + g["start-max"]);
                    Blz.Widget.debug("MyGoogleCal Gcal Cache Calendars", this.gcal.cacheCalendars);
                    var m = this.gcal.cacheCalendars;
                    for (var j = 0, k = m.length; j < k; j++) {
                        var b = m[j];
                        this.gcal.retrieveEvent(b, g, {
                            dt: gStartDateKey,
                            calid: b.id
                        });
                        apts.loadingCount++
                    }
                    this.cacheAppts[gStartDateKey] = apts
                }
            }
        } catch (err) {
            Blz.Widget.print("MyGoogleCal.Application.getAppointments: " + err)
        }
        return apts
    },
    ellipseString: function (a) {
        if (this.length > a) {
            return this.substr(0, a - 3) + "..."
        }
        return this
    },
    onGoogleCalendarLoginCompleted: function (b, c) {
        var a = Blz.Widget;
        a.print("[EVENT] MyGoogleCal.Application.onGoogleCalendarLoginCompleted:" + c.success);
        this.notifyObservers("LoginCompleted", c);
    },
    onGoogleCalendarCalendarRetrieved: function (b, c) {
        var a = Blz.Widget;
        a.print("[EVENT] MyGoogleCal.Application.onGoogleCalendarRetrieved: calendar count = " + c.items.length);
        this.notifyObservers("CalendarLoaded", c)
    },
    onGoogleCalendarEventRetrieved: function (d, b) {
        var h = Blz.Widget;
        h.print("[EVENT] MyGoogleCal.Application.onGoogleCalendarEventRetrieved: event count = " + b.items.length);
        try {
            var c = b.context;
            var i = c.dt;
            var g = c.calid;
            var j = b.items || [];
            var a = this.cacheAppts[i];
            a.loadingCount--;
            a.items[g] = j;
            if (a.loadingCount == 0) {
                a.loaded = true;
                a.loading = false;
                this.notifyObservers("EventLoaded", {
                    key: i
                })
            }
        } catch (f) {
            h.print("MyGoogleCal.Application.onGoogleCalendarEventRetrieved:" + f)
        }
    }
};
Blz.Util.extend(MyGoogleCal.Application, Blz.Notifier);
