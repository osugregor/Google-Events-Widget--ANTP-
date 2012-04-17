if (typeof (Blz) == "undefined") {
    Blz = {}
}

Blz.Util = {
    toArray: function (d) {
        if (!d) {
            return []
        }
        if (d.toArray) {
            return d.toArray()
        }
        var b = [];
        for (var a = 0, c = d.length; a < c; a++) {
            b.push(d[a])
        }
        return b
    },
    extend: function (a, c) {
        for (var b in c) {
            a[b] = c[b]
        }
        return a
    },
    removeInjectionsForWeb: function (a) {
        if (!a) {
            return
        }
        a = String(a);
        a = a.replace(/[<>\"\'\\\n\r]/g, function (b) {
            b = escape(b);
            return b
        });
        return a
    }
};

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
        Blz.Ajax.post(c, a, function (h) {
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
        })
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
                        if (match = /gsessionid=([\w-_]+)$/.exec(j[f])) {
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
        if (a = /Auth=([\w-_]+)/.exec(b)) {
            this.authContent = a[1];
            return true
        }
        return false
    }
};
Blz.Util.extend(Blz.GData, Blz.Notifier);

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
        var a = Blz.Widget;
        var d = this;
        if (this.isCalendarListRequesting) {
            return
        }
        if (!this.hasSession) {
            a.print("Blz.Google.Calendar.retrieveCalendar: no session");
            this.session();
            return false
        }
        var b = this.baseUrl + "/" + this.getAccount() + "/allcalendars/full";
        if (this.gsessionid != "") {
            b += "?gsessionid=" + this.gsessionid
        }
        var f = {};
        var e = this.getAuthHeader();
        this.isCalendarListRequesting = true;
		console.log("RETREIVING CALENDAR");
        Blz.Ajax.get(b, function (h) {
            try {
                d.isCalendarListRequesting = false;
				console.log("Retreived:");
				console(h);
                var j = h.response,
                    i = h.success,
                    g = h.data,
                    k = [];
                if (j.status != 200) {
                    a.print("Blz.Google.Calendar.retrieveCalendar: Http Status = " + j.status)
                }
                if (i) {
                    k = d.parseCalendars(g)
                } else {} if (j.status == 401) {
                    d.hasSession = false
                }
                d.notifyObservers("CalendarRetrieved", {
                    success: i,
                    context: c,
                    items: k
                })
            } catch (h) {
                Blz.Widget.print("Blz.Google.Calendar.retrieveCalendar:" + h)
            }
        }, f, e)
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
            h.print("Blz.Google.Calendar.parseCalendars:" + e)
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
            Blz.Widget.print("Blz.Google.Calendar.createCalendar: " + g)
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
    retrieveEvent: function (e, g, c) {
        var d = this,
            a = Blz.Widget;
        if (!g) {
            g = {}
        }
        var b = e.link;
        if (this.gsessionid != "") {
            b += "?gsessionid=" + this.gsessionid
        }
        if (!this.hasSession) {
            a.print("Blz.Google.Calendar.retrieveEvent: no session!");
            this.session(b);
            return false
        }
        var f = this.getAuthHeader();
        Blz.Ajax.get(b, function (m) {
            try {
                var o = m.response,
                    n = m.success,
                    l = m.data,
                    k = [];
                if (o.status != 200) {
                    a.print("Blz.Google.Calendar.retrieveEvent: Http Status = " + o.status)
                }
                if (n) {
                    k = d.parseEvents(l);
                    for (var j = 0, h = k.length; j < h; j++) {
                        k[j].color = e.color
                    }
                } else {} if (o.status == 401) {
                    d.hasSession = false
                }
                d.notifyObservers("EventRetrieved", {
                    success: n,
                    context: c,
                    items: k
                })
            } catch (m) {
                Blz.Widget.print("Blz.Google.Calendar.retrieveEvent: " + m)
            }
        }, g, f)
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
					Cookie
*************************************************/
Blz.Cookie = {
    userDataForIE: false,
    isIE: Ext.isIE,
    initialize: function (a) {
        this.cookieShelfLife = 365;
        this.userDataForIE = a;
        if (Ext.isIE && this.userDataForIE) {
            this.IE_CACHE_NAME = "storage";
            if ($(this.IE_CACHE_NAME) == null) {
                var b = document.createElement("DIV");
                b.id = this.IE_CACHE_NAME;
                document.body.appendChild(b)
            }
            this.store = $(this.IE_CACHE_NAME);
            this.store.style.behavior = "url('#default#userData')"
        }
    },
    getCookie: function (d) {
        var a = null;
        if (Ext.isIE && this.userDataForIE) {
            this.store.load(this.IE_CACHE_NAME);
            a = this.store.getAttribute(d)
        } else {
            for (var c = 0; c < document.cookie.split("; ").length; c++) {
                var b = document.cookie.split("; ")[c].split("=");
                if (b[0] == d && b[1] != null) {
                    a = b[1];
                    break
                }
            }
        }
        if (Ext.isOpera.isBrowserOpera && a != null) {
            a = a.replace(/%22/g, '"')
        }
        return a
    },
    setCookie: function (f, d, c) {
        if (Ext.isIE && this.userDataForIE) {
            this.store.setAttribute(f, d);
            this.store.save(this.IE_CACHE_NAME)
        } else {
            if (Ext.isOpera) {
                d = d.replace(/"/g, "%22")
            }
            var b = new Date();
            b.setTime(b.getTime() + (this.cookieShelfLife * 24 * 60 * 60 * 1000));
            var a = "; expires=" + b.toGMTString();
            var e = (c) ? "; domain=" + c : "";
            document.cookie = f + "=" + d + e + a + "; path=/"
        }
    },
    clearCookie: function (a) {
        if (Ext.isIE && this.userDataForIE) {
            this.store.load(this.IE_CACHE_NAME);
            this.store.removeAttribute(a);
            this.store.save(this.IE_CACHE_NAME)
        } else {
            document.cookie = a + "=;expires=Thu, 01-Jan-1970 00:00:01 GMT; path=/"
        }
    }
};

/************************************************
					Widget
*************************************************/
Blz.Widget = {
    Engines: {
        Browser: "browser",
        Yahoo: "yahoo",
        iGoogle: "igoogle",
        GoogleDesktop: "googledesktop",
        VistaSidebar: "sidebar",
        Unknown: "unknown"
    },
    Platforms: {
        Windows: "windows",
        MacOSX: "macosx",
        Linux: "linux",
        Unknown: "unknown"
    },
    engine: "unknown",
    getPlatform: function () { return this.Platforms.Unknown; },
    getLocale: function () { return "en"; },
    toPlatformPath: function (a) {
        if (!a)return;
        if (this.getPlatform() == this.Platforms.Windows) {
            a = a.replace("/", "\\")
        }
        return a
    },
    alert: function () {},
    assert: function (a) {},
    debug: function (a) {},
    print: function (a) {},
    capabilities: {
        com: false,
        appleScript: false,
        dummy: false
    },
    connectComObject: function (a, b) {},
    createComObject: function (a) { return null; },
    disconnectComObject: function (a) {},
    appleScript: function (a) {},
    createXmlHttpRequest: function () {
        var c = null;
        try {
            c = new XMLHttpRequest()
        } catch (f) {
            if (window.ActiveXObject) {
                var b = ["MSXML2.XMLHTTP.3.0", "MSXML2.XMLHTTP", "Microsoft.XMLHTTP"];
                for (var d = 0, a = b.length; d < a; d++) {
                    try {
                        c = new ActiveXObject(b[d]);
                        break
                    } catch (f) {}
                }
            }
        }
        return c
    },
    name: "",
    version: "",
    author: "",
    company: "",
    close: function () {},
    focus: function () {},
    reload: function () {},
    showPref: function () {},
    setPref: function (a, b) {},
    getPref: function (a) {
        return "bb"
    },
    getResourceString: function (a) {
        return ""
    },
    getMenuSeparatorTitle: function () {
        return ""
    }
};
Blz.Util.extend(Blz.Widget, {
    initialize: function () {
        this.isComSupported = (typeof (ActiveXObject) != "undefined") ? true : false;
        this.cookie = Blz.Cookie;
        this.cookie.initialize()
    },
    engine: Blz.Widget.Engines.Browser,
    getPlatform: function () {
        if (Ext.isWindows) {
            return Blz.Widget.Platforms.Windows
        } else {
            if (Ext.isMac) {
                return Blz.Widget.Platforms.MacOSX
            } else {
                if (Ext.isLinux) {
                    return Blz.Widget.Platforms.Linux
                }
            }
        }
        return Blz.Widget.Platforms.Unknown
    },
    debug: function (a) {
        console.log("[DEBUG] %o", a);
    },
    print: function (a) {
        console.log(a)
    },
    connectComObject: function (a, b) {},
    createComObject: function (a) {
        return new ActiveXObject(a)
    },
    disconnectComObject: function (a) {},
    name: "",
    version: "",
    author: "",
    company: "",
    setPref: function (a, b) {
        try {
            if (window.localStorage) {
                localStorage[a] = b
            } else {
                this.cookie.setCookie(a, b)
            }
        } catch (c) {}
    },
    getPref: function (a) {
        var b = "";
        try {
            if (window.localStorage) {
                b = localStorage[a]
            } else {
                b = this.cookie.getCookie(a)
            }
        } catch (c) {}
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
 ************************************************
 ************************************************
			 Google Cal Application
 ************************************************
 ************************************************
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
                console.log(b)
                console.log(c)
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
        this.gcal.retrieveCalendar()
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
    getAppointments: function (d) {
        var n = Blz.Widget;
        try {
            var o = d.toKeyString();
            var a = this.cacheAppts[o] || {
                loaded: false,
                loading: false
            };
            if (!a.loaded) {
                if (!a.loading) {
                    a.items = {};
                    a.loading = true;
                    a.loadingCount = 0;
                    var f = d.date;
                    var c = new Date(f.getFullYear(), f.getMonth(), f.getDate(), 0, 0, 0, 0);
                    var h = new Date(f.getFullYear(), f.getMonth(), f.getDate(), 23*3, 59, 59, 0);
                    var g = {
                        "start-min": Blz.GData.Date.toDateString(c),
                        "start-max": Blz.GData.Date.toDateString(h)
                    };
                    n.print("MyGoogleCal.Application.getAppointments from " + g["start-min"] + " to " + g["start-max"]);
                    var m = this.gcal.cacheCalendars;
                    for (var j = 0, k = m.length; j < k; j++) {
                        var b = m[j];
                        this.gcal.retrieveEvent(b, g, {
                            dt: o,
                            calid: b.id
                        });
                        a.loadingCount++
                    }
                    this.cacheAppts[o] = a
                }
            }
        } catch (l) {
            n.print("MyGoogleCal.Application.getAppointments: " + l)
        }
        return a
    },
    ellipseString: function (a) {
        if (this.length > a) {
            return this.substr(0, a - 3) + "..."
        }
        return this
    },
    onGoogleCalendarLoginCompleted: function (b, c) {
        var a = Blz.Widget;
        a.print("MyGoogleCal.Application.onGoogleCalendarLoginCompleted:" + c.success);
        this.notifyObservers("LoginCompleted", c)
        console.log(b)
        console.log(c)
    },
    onGoogleCalendarCalendarRetrieved: function (b, c) {
        var a = Blz.Widget;
        a.print("MyGoogleCal.Application.onGoogleCalendarRetrieved: calendar count = " + c.items.length);
        this.notifyObservers("CalendarLoaded", c)
    },
    onGoogleCalendarEventRetrieved: function (d, b) {
        var h = Blz.Widget;
        h.print("MyGoogleCal.Application.onGoogleCalendarEventRetrieved: event count = " + b.items.length);
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



Blz.Ajax = {
    get: function (a, d, c, b) {
        Ext.Ajax.request({
            method: "GET",
            url: a,
            params: c,
            headers: b,
            callback: function (f, g, e) {
                d({
                    success: g,
                    data: e.responseText,
                    response: e,
                    options: f
                })
            }
        })
    },
    post: function (b, a, d, c) {
        Ext.Ajax.request({
            method: "POST",
            url: b,
            params: a,
            headers: c,
            callback: function (f, g, e) {
                d({
                    success: g,
                    data: e.responseText,
                    response: e,
                    options: f
                })
            }
        })
    }
};

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
Blz.Version = function (b, d, c, a) {
    this.major = (b != null) ? b : 0;
    this.minor = (d != null) ? d : 0;
    this.revision = (c != null) ? c : 0;
    this.buildNumber = (a != null) ? a : 0
};
Blz.Version.prototype = {
    parse: function (b) {
        var a = b.split(".");
        switch (a.length) {
        case 4:
            this.buildNumber = a[3];
        case 3:
            this.revision = a[2];
        case 2:
            this.minor = a[1];
        case 1:
            this.major = a[0];
            break
        }
    },
    toString: function () {
        return [this.major, this.minor, this.revision, this.buildNumber].join(".")
    },
    compare: function (a) {
        if (this.major == a.major && this.minor == a.minor && this.revision == a.revision && this.buildNumber == a.buildNumber) {
            return 0
        }
        if ((this.major < a.major) || (this.major == a.major && this.minor < a.minor) || (this.major == a.major && this.minor == a.minor && this.revision < a.revision) || (this.major == a.major && this.minor == a.minor && this.revision == a.revision && this.buildNumber < a.buildNumber)) {
            return -1
        }
        return 1
    }
};