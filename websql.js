;
(function (root, factory) {
    'use strict'
    if (typeof define === 'function' && define.amd) {
        define('websql', factory)
    } else if (typeof exports === 'object') {
        exports = module.exports = factory()
    } else {
        root.websql = factory()
    }
})(this, function () {
    'use strict'
    //htmlUtils
    var _ = {
        createClass: function () {
            function defineProperties(target, props) {
                for (var key in props) {
                    if (target.hasOwnProperty(key)) {
                        console.log(_.type(target) + " hasOwnProperty " + key)
                    } else {
                        //不覆盖已有属性
                        var descriptor = {
                            key: key,
                            value: props[key],
                            enumerable: false,
                            configurable: true,
                            writable: true
                        }
                        Object.defineProperty(target, key, descriptor);
                    }
                }
            }
            return function (Constructor, protoProps, staticProps) {
                if (protoProps) defineProperties(Constructor.prototype, protoProps);
                if (staticProps) defineProperties(Constructor, staticProps);
                return Constructor;
            };
        }(),
        //类型
        type: function (o) {
            if (o === null) return 'null';
            var s = Object.prototype.toString.call(o);
            var t = s.match(/\[object (.*?)\]/)[1].toLowerCase();
            return t === 'number' ? isNaN(o) ? 'nan' : !isFinite(o) ? 'infinity' : t : t;
        },
        //继承私有属性 不包括原型方法 
        extend: function (obj) {
            var len = arguments.length;
            if (len > 1) obj = obj || {};
            for (var i = 1; i < len; i++) {
                var source = arguments[i];
                if (source) {
                    for (var prop in source) {
                        if (source.hasOwnProperty(prop)) {
                            if (_.type(source[prop]) === "array") {
                                obj[prop] = _.extend([], source[prop]);
                            } else if (_.type(source[prop]) === "object") {
                                obj[prop] = _.extend({}, source[prop]);
                            } else {
                                obj[prop] = source[prop];
                            }
                        }
                    }
                }
            }
            return obj;
        },
        addEvent: function (type, el, listener) {
            if (arguments.length === 2 && _.type(arguments[1]) === "function") {
                el = window;
                listener = arguments[1]
            }

            if (window.addEventListener) {
                el.addEventListener(type, listener, false);
            } else {
                el.attachEvent('on' + type, listener);
            }
            //store events
            if (!el.events) el.events = [];

            el.events.push({
                type: type,
                el: el,
                listener: listener
            }); //listener
        },
        closest: function (el, cls) {
            if (!el.parentNode) { //document
                return null
            } else if (cls.indexOf(".") === 0 && el.className.indexOf(cls.substring(1)) >= 0) {
                return el;
            } else if (cls.indexOf("#") === 0 && el.id.toLowerCase() === cls.substring(1).toLowerCase()) {
                return el;
            } else if (el.tagName.toLowerCase() === cls.toLowerCase()) {
                return el
            } else {
                return _.closest(el.parentNode, cls)
            }
        },
        sortBy: function (key, asc) {
            return function (a, b) {
                if (key === "count") {
                    return asc ? a[key] - b[key] : b[key] - a[key]
                } else {
                    return asc ? a[key].localeCompare(b[key], 'zh-CN') : b[key].localeCompare(a[key], 'zh-CN')
                }
            }
        },

        obj2arr: function (obj) {
            var keys = [],
                vals = [],
                typs = [];
            for (var key in obj) {
                vals.push(obj[key])
                keys.push(key)
                typs.push(_.type(obj[key]))
            }
            return {
                keys: keys,
                vals: vals,
                typs: typs
            }
        },
        autoId: function (ele) {
            if (!ele.id) {
                var id = "_" + Math.random().toString(16).slice(2)
                ele.setAttribute("id", id);
            }
            return ele;
        },
        queryAll: function (selectors, rootEle) {
            if (rootEle) {
                rootEle = _.autoId(rootEle)
                return document.querySelectorAll("#" + rootEle.id + " " + selectors)
            }
            return document.querySelectorAll(selectors)
        },
        query: function (selectors, rootEle) {
            if (rootEle) {
                rootEle = _.autoId(rootEle)
                return document.querySelector("#" + rootEle.id + " " + selectors)
            }
            return document.querySelector(selectors)
        },
        fast: function () {
            var len = arguments.length,
                args = new Array(len), //fast then Array.prototype.slice.call(arguments)
                times = 10000;
            while (len--) args[len] = arguments[len];
            var last = args[args.length - 1];
            if (_.type(last) === "number") {
                times = last;
                args.pop();
            }
            var _run = function (fn, times) {
                var word = 'run ' + fn.name + '{} ' + times + ' time' + (times > 1 ? 's' : '');
                console.time(word);
                while (times--) fn.apply(this, args);
                console.timeEnd(word);
            }
            args.forEach(function (t) {
                t && _run.call(this, t, times);
            });
        },

        start: function (tag, options) {
            var sb = [];
            sb.push('<');
            sb.push(tag);
            for (var key in options) {
                sb.push(' ' + key + '="' + options[key] + '"');
            }
            sb.push('>');
            return sb.join('');
        },
        end: function (tag) {
            return '</' + tag + '>';
        },
        //字符串拼接 方式
        wrap: function (tag, text, options) {
            var i = tag.indexOf(" ");
            if (i > 0) {
                var leftTag = tag.substring(0, i)
                return _.wrap(leftTag, _.wrap(tag.substring(i + 1), text, options))
            }
            return text === null ? _.start(tag, options) : _.start(tag, options) + text + _.end(tag);
        },
        //创建DOm 方式
        createEle: function (tag, text, props, events) {
            var i = tag.indexOf(" ");
            if (i > 0) {
                var leftTag = tag.substring(0, i)
                return _.createEle(leftTag, _.createEle(tag.substring(i + 1), text, props, events))
            }
            var ele = document.createElement(tag);
            var append = function (text) {
                switch (_.type(text)) {
                    case "string":
                    case "number":
                    case "date":
                        // ele.innerHTML += text;                        
                        ele.appendChild(document.createTextNode(text));
                        break;
                    case "array":
                        text.forEach(function (t) {
                            append(t)
                        })
                        break;
                    case "null":
                    case "nan":
                    case "undefined":
                        break;
                    default:
                        ele.appendChild(text)
                }
            }
            append(text)
            // if (tag.toLowerCase() === "input") {

            // }
            for (var key in props) {
                if (tag.toLowerCase() === "input" && key === "checked") {
                    if (props[key]) {
                        ele.setAttribute(key, props[key])
                    }
                } else {
                    ele.setAttribute(key, props[key])
                }
            }
            for (var key in events) {
                _.addEvent(key, ele, events[key]);
            }

            return ele;
        },
        checkbox: function (options) {
            var checkbox = _.createEle("input", "", _.extend({
                type: "checkbox",
                class: "checkbox"
            }, options), {
                click: function (e) {
                    var el = e.target,
                        table = _.closest(el, ".dataintable");
                    var numb = _.queryAll("input[type='checkbox']:checked", table).length
                    var optPanel = _.query(".optPanel", table)
                    if (optPanel) {
                        if (numb === 0) {
                            optPanel.style.overflow = "hidden"
                            // optPanel.style.bottom = '-55px';
                        } else {
                            // optPanel.style.bottom = '-0px';
                            optPanel.style.overflow = "visible"
                            // var HistoryCountSpan=_.query(".HistoryCountSpan")
                            // HistoryCountSpan.innerText = numb
                        }
                    }
                }
            })
            if (options) {
                var label = _.div(options.label, {
                    class: "label"
                })
                return _.div([checkbox, label], {
                    class: "input-group"
                });
            } else {
                return checkbox
            }
        },
        btn: function (text, props, events) {
            if (props && props.class) {
                props.class = "btn " + props.class
            }
            return _.div(text, _.extend({
                class: "btn"
            }, props), events)
        },
        btnGroup: function (text, props, events) {
            if (props && props.class) {
                props.class = "btn-group " + props.class
            }
            return _.div(text, _.extend({
                class: "btn-group"
            }, props), events)
        },
        stringify: function (el) {
            var str = el.tagName.toLowerCase();
            str += el.id ? "#" + el.id : "";
            str += el.className ? "." + el.className.replace(/\s+/g, ".") : "";
            return str;
        },
        inStyle: function (obj) {
            return ["width", "height", "top", "left"].map(function (t) {
                return obj[t] ? t + ":" + obj[t] : null
            }).join(";")
            // return JSON.stringify(obj).replace(/\"/g,"").replace(/,/g,";").replace(/{/,"").replace(/}/,"")
        },
        img: function (options) {
            if (_.type(options) === "object") {
                return _.createEle("img", "", _.extend({
                    src: options.url
                }, options))
            }
            return _.createEle("img", "", {
                src: options
            })
        },
        //遍历dom，操作
        traversalWidth: function (el) {
            var children = el.children,
                len = children.length;
            for (var i = 0; i < len; i++) {
                var t = children[i]
                if (parseInt(getComputedStyle(t)["width"]) > 1000) {
                    // t.setAttribute("witdh","100%")
                    t.style.width = "100%"
                    _.traversalWidth(t)
                }
            }
        },
        //允许一次加多个样式
        //去重
        addClass: function (el, cls) {
            var arr1 = el.className.split(" ")
            var arr2 = cls.split(" ")
            var obj = {}
            arr1.forEach(function (t) {
                obj[t] = 1
            })
            arr2.forEach(function (t) {
                obj[t] = 1
            })
            var keys = []
            for (var key in obj) {
                keys.push(key)
            }
            el.className = keys.join(" ")
            return el;
        },
        removeClass: function (el, cls) {
            var arr1 = el.className.split(" ")
            var arr2 = cls.split(" ")
            var obj = {}
            arr1.forEach(function (t) {
                if (arr2.indexOf(t) === -1) {
                    obj[t] = 1
                }
            })
            var keys = []
            for (var key in obj) {
                keys.push(key)
            }
            el.className = keys.join(" ")
            return el;
        },
        show: function (el) {
            _.removeClass(el, "hide")
            _.addClass(el, "show")
        },
        hide: function (el) {
            _.removeClass(el, "show")
            _.addClass(el, "hide")
        },
        click: function (el, callback) {
            _.addEvent("click", el, callback)
        },
        hasClass: function (el, cls) {
            var arr = el.className.split(" ")
            return arr.indexOf(cls) >= 0
        },
        getStyle: function (el, attr) {
            if (el.currentStyle) {
                return el.currentStyle[attr];
            } else {
                return getComputedStyle(el, false)[attr];
            }
        }
    };
    ["div", "ul", "li", "tbody", "tfoot", "thead", "td", "tr", "th", "table", "textarea", "i", "span", "colgroup", "col", "a"].forEach(function (t) {
        _[t] = function (text, props, events) {
            return _.createEle(t, text, props, events)
        }
    });

    // var _log = console.log
    // console.log = function () {
    //     if (_.type(arguments[0]) === "HTMLDivElement".toLowerCase()) {
    //         _log.call(console, _.stringify(arguments[0]), 'color:blue')
    //     } else {
    //         _log.call(console, [].slice.call(arguments).join(" "))
    //     }
    // }

    //日期
    var _time = _.time = function () {
        function Time(dateValue) {
            if (!(this instanceof Time)) return new Time(dateValue);
            var t = this.date = this.constructor.toDate(dateValue);
            this.year = t.getFullYear();
            this.month = t.getMonth() + 1;
            this.day = t.getDate(); //日期 day_of_month
            this.hour = t.getHours();
            this.minute = t.getMinutes();
            this.second = t.getSeconds();
            this.msecond = t.getMilliseconds(); //毫秒 
            this.day_of_week = t.getDay() === 0 ? 7 : t.getDay(); //  星期几   What day is today
            // 中国的概念是周一是每周的开始, 周日12pm是每周结束.

            this.time = t.getTime();
            this.quarter = (t.getMonth() + 3) / 3 << 0; // //季度 
        }
        return _.createClass(Time, {
            // 转化为指定格式的String 
            // 月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符， 
            // 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字) 
            // 例子： 
            // (new Date()).format("yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423 
            // (new Date()).format("yyyy-M-d h:m:s.S")      ==> 2006-7-2 8:9:4.18 
            format: function (fmt) {
                var self = this;
                fmt = fmt || "yyyy-MM-dd hh:mm:ss.S";
                var date = this.date
                var o = {
                    "y+|Y+": this.year, //年份4位特殊处理
                    "M+": this.month,
                    "d+|D+": this.day,
                    "h+|H+": this.hour,
                    "m+": this.minute,
                    "s+": this.second,
                    "q+": this.quarter,
                    "S": this.msecond,
                };
                Object.keys(o).forEach(function (k, i) {
                    var v = '' + o[k];
                    fmt = fmt.replace(new RegExp(k, 'g'), function (t) {
                        return i === 0 ? v.substr(4 - t.length) : t[1] ? self.constructor.zerofill(v) : v;
                    })
                });
                return fmt;
            },
            //设置当前时间  ，保持当前日期不变
            set: function (str) {
                if (this.constructor.isTimeString(str)) str = this.format("yyyy-MM-dd") + " " + str;
                return this.constructor.toDate(str);
            },
            //当前时间
            setCurTime: function () {
                return this.set(this.constructor().format("HH:mm:ss"));
            },
            add: function (interval, number, date) {
                return this.constructor.add(interval, number, date)
            },
            utc: function () {
                return Date.UTC(this.year, this.month - 1, this.day, this.hour, this.minute, this.second, this.msecond)
            },
            //时区
            zone: function () {
                return (this.time - this.utc()) / 3600000;
            },
            diff: function (interval, date1) {
                return this.constructor.diff(interval, this.date, date1)
            },

            //
            // weekOfMonth: function() {

            // },

            //一年中的第几周 WEEK_OF_Year WEEKNUM
            // 以周一为周首，周日为周末  以完整的一周计算，可能第一周不足7天
            //此处按7天一周计算 
            week: function (dateStr) {
                var day_of_year = 0;
                var d = dateStr ? this.constructor(dateStr) : this;
                if (!d) return "";
                var years = d.year,
                    month = d.month - 1,
                    day = d.day,
                    days = [31, 28, 30, 31, 30, 31, 31, 30, 31, 30, 31];
                //4年1闰
                if (Math.round(years / 4) === years / 4) days[1] = 29;
                days.forEach(function (t, i) {
                    if (i <= month) day_of_year += day + (i === 0 ? 0 : days[i - 1]);
                });
                return Math.ceil(day_of_year / 7);
            }
        }, {
            //_.time.toDate("09:30:00")
            //_.time.toDate(timeRange[0].begin.format("yyyy-MM-dd") + " " + (new Date()).format(" HH:mm:ss"))
            // 指定时间  hh:mm:ss     默认当天日期  
            // 指定日期  yyyy-MM-dd   默认时间 00:00:00  (非当前时间)  
            toDate: function (str) {
                if (_.type(str) === "date") {
                    return new Date(+str); //new
                } else if (_.type(str) == null) {
                    return new Date();
                } else if (/^\d*$/.test(str)) {
                    return new Date(+str);
                } else if (_.type(str) == "string") {
                    if (this.isTimeString(str)) str = this().format("yyyy-MM-dd") + " " + str;
                    return new Date(Date.parse(str.replace(/-/g, "/")));
                }
                return str;
            },
            // 时间格式 hh:mm:ss 
            isTimeString: function (str) {
                return /^(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?$/.test(str);
            },

            set: function (date, time) {
                return this.toDate(time ? date + ' ' + time : date);
                // var self = this;

                // if (this.isTimeString(time)) {
                //     //时间补0
                //     time = time.replace(/\d{1,2}/g, function(t) {
                //         return self.zerofill(t)
                //     });
                //     // str.replace(reg, function(t, h, m, s) {
                //     //     console.log(t + ":----")
                //     //     console.log("h:" + h)
                //     //     console.log("m:" + m)
                //     //     console.log("s:" + s)
                //     //     return self.zerofill(t)
                //     // })
                //     //(new Date()).format("yyyy-MM-dd")
                //     date += ' ' + time;
                // }

                // return new Date(Date.parse(date.replace(/-/g, "/")));
            },
            //补0
            zerofill: function (n) {
                n = '' + n;
                return n[1] ? n : '0' + n;
            },
            //时长 格式化
            durationFormat: function (duration) {
                var self = this;
                if (typeof duration !== 'number' || duration < 0) return "00:00";
                var hour = duration / 3600 << 0;
                duration %= 3600;
                var minute = duration / 60 << 0;
                duration %= 60;
                var second = duration << 0;
                var arr = [minute, second];
                if (hour > 0) arr.unshift(hour);
                return arr.map(function (n) {
                    return self.zerofill(n)
                }).join(':');
            },

            //映射短名字
            shortNameMap: function (s) {
                s = ('' + s).toLowerCase();
                var m = {
                    "y": "year",
                    "m": "month",
                    "d": "day",
                    "w": "week",
                    "h": "hour",
                    "n": "minute",
                    "min": "minute",
                    "s": "second",
                    "l": "msecond",
                    "ms": "msecond",
                };
                return s in m ? m[s] : s;
            },
            //时间间隔
            diff: function (interval, date1, date2) {
                var t1 = this(date1),
                    t2 = this(date2),
                    _diff = t1.time - t2.time,
                    seconds = 1000,
                    minutes = seconds * 60,
                    hours = minutes * 60,
                    days = hours * 24,
                    years = days * 365;

                switch (this.shortNameMap(interval)) {
                    case "year":
                        result = t1.year - t2.year; //_diff/years
                        break;
                    case "month":
                        result = (t1.year - t2.year) * 12 + (t1.month - t2.month);
                        break;
                    case "day":
                        result = Math.round(_diff / days);
                        break;
                    case "hour":
                        result = Math.round(_diff / hours);
                        break;
                    case "minute":
                        result = Math.round(_diff / minutes);
                        break;
                    case "second":
                        result = Math.round(_diff / seconds);
                        break;
                    case "msecond":
                        result = _diff;
                        break;
                    case "week":
                        result = Math.round(_diff / days) % 7;
                        break;
                    default:
                        result = "invalid";
                }
                return result;
            },
            add: function (interval, number, date) {
                var date = this.toDate(date);
                switch (this.shortNameMap(interval)) {
                    case "year":
                        return new Date(date.setFullYear(date.getFullYear() + number));
                    case "month":
                        return new Date(date.setMonth(date.getMonth() + number));
                    case "day":
                        return new Date(date.setDate(date.getDate() + number));
                    case "week":
                        return new Date(date.setDate(date.getDate() + 7 * number));
                    case "hour":
                        return new Date(date.setHours(date.getHours() + number));
                    case "minute":
                        return new Date(date.setMinutes(date.getMinutes() + number));
                    case "second":
                        return new Date(date.setSeconds(date.getSeconds() + number));
                    case "msecond":
                        return new Date(date.setMilliseconds(date.getMilliseconds() + number));
                }
                return date;
            }

        })
    }();


    //菜单
    var _nav = function () {
        var Nav = function (options) {
            if (!(this instanceof Nav)) return new Nav(options);

            var options = this.options = _.extend({
                menu: [{
                        label: "配置管理",
                        url: "github.com",
                        children: [{
                            label: "配置管理1",
                            url: "g.cn"
                        }]
                    },
                    {
                        label: "配置管理2",
                        children: [{
                            label: "配置管理21"
                        }]
                    }
                ],
                info: {
                    text: ""
                }
            }, options)
            var el = _.query(options.el);
            var menu = options.menu;
            var logo = options.logo;
            var info = options.info;
            var genLink = function (t) {
                return t.url ? _.a(t.label, {
                    href: t.url
                }) : t.label
            }
            var url = location.href;
            var cls = {
                0: "index-nav-frame-line",
                1: "index-nav-frame-line-center",
                2: "index-nav-frame-line-li"
            }
            var checkActive = function (t) {
                if (url.indexOf(encodeURI(t.url)) >= 0) {
                    return true;
                }
                var children = t.children
                if (children) {
                    for (var i = 0; i < children.length; i++) {
                        if (checkActive(children[i])) {
                            return true
                        }
                    }
                }
            }

            var lines = menu.map(function (t, i) {
                var children = t.children
                var lineCenter = [];
                if (children) {
                    var lis = children.map(function (t) {
                        if (t.hide) return null;
                        return _.div(genLink(t), {
                            class: cls["2"]
                        })
                    })
                    lineCenter = _.div(lis, {
                        class: cls["1"]
                    })
                }

                // var active = url.indexOf(t.url) >= 0 ? " active" : "";
                var active = checkActive(t) ? " active" : "";

                return _.div([genLink(t)].concat(lineCenter), {
                    class: cls["0"] + active,
                    tabindex: "-1"
                }, {
                    click: function (e) {
                        _.queryAll("." + cls["0"]).forEach(function (t) {
                            t.className = cls["0"]
                        })
                        this.className = cls["0"] + " active"
                    }
                })
            })
            var logo = _.div(_.img(logo), {
                class: "nav-small",
                style: _.inStyle(logo),
                tabindex: "-1"
            })

            var info = _.div(info.text, {
                class: "index-nav-info"
            })

            var navIndex = _.div([logo].concat(lines).concat([info]), {
                class: "index-nav"
            })
            el.appendChild(navIndex)
        }
        return _.createClass(Nav, {

        });
    }();


    var _websql = function () {
        var Websql = function (options) {
            if (!(this instanceof Websql)) return new Websql(options);
            var options = this.options = _.extend({
                dbname: "mydb",
                version: "1.0",
                desc: "teset db",
                dbsize: 2 * 1024 * 1024
            }, options)

            //创建数据库

            var db = this.db = window.openDatabase(
                options.dbname,
                options.version,
                options.desc,
                options.dbsize
            );
            //表结构
            this.tbls = options.tbls || [];

            //日期表
            this.tbls.sys_log = [{
                    prop: "time",
                    label: '时间',
                    type: "date",
                    format: "yyyy-mm-dd hh:mm:ss"
                },
                {
                    prop: "sql",
                    label: 'SQL',
                    type: "sql"
                },
                {
                    prop: "duration",
                    label: '执行时间',
                    type: "number"
                }
            ]
            //表数据
            this.data = options.data;
            //所有数据
            this.rs = [];
            //[{
            //     tbl:tbl
            //     sql:sql
            // }]
            this.sqls = [];
            this.gridConfig = [{
                    label: "显示字段别名",
                    checked: true,
                    name: "label"
                }, {
                    label: "显示序号列",
                    checked: true,
                    name: "seq"
                },
                {
                    label: "显示选择列",
                    checked: true,
                    name: "check"
                },
                {
                    label: "合计数字列",
                    checked: true,
                    name: "statistic"
                },
                {
                    label: "固定表头",
                    checked: false,
                    name: "fixedhead"
                },
                // {
                //     label: "允许多表查询",
                //     checked: true,
                //     name: "showMultisql"
                // }
            ]
        }

        return _.createClass(Websql, {
            _: _,
            nav: _nav,
            createTbls: function (tbls) {
                var tbls = tbls || this.tbls;
                var _this = this;
                _this.sqls = [];


                this.db.transaction(function (tx) {
                    for (var t in tbls) {
                        var flds = tbls[t].map(function (t) {

                            return (t.prop ? t.prop : t) + (t.pk ? " unique" : "");
                        });
                        var sql = `CREATE TABLE IF NOT EXISTS ${t}(${flds})`
                        console.log(sql)
                        _this.sqls.push({
                            tbl: t,
                            sql: sql
                        })
                        // tx.executeSql(sql, [], function (ctx, result) {
                        //     console.log("创建表成功 " + t);
                        // }, function (tx, error) {
                        //     console.error('创建表失败:' + t + error.message);
                        //     // throw new Error(error);
                        //     _this.errorCall && _this.errorCall(error.message)
                        // })
                    }
                    _this.setSqlcmd.call(_this)
                });
            },
            insert: function (tbl, rs, callback) {
                var _this = this;
                _this.sqls = [];
                this.db.transaction(function (tx) {
                    var typs = [];
                    var flds = _this.tbls[tbl].map(function (t) {
                        typs.push(t.type)
                        return t.prop ? t.prop : t;
                    });
                    console.log(flds)
                    rs.forEach(function (r) {
                        // var sql = `INSERT INTO ${tbl}(${flds}) values(${new Array(flds.length).fill("?")})`;
                        var vs = flds.map(function (t, i) {
                            switch (typs[i]) {
                                // case "string":
                                // break;
                                case "number":
                                    return r[t]
                                default:
                                    return "'" + r[t] + "'"
                            }
                        });
                        _this.sqls.push({
                            tbl: tbl,
                            sql: `INSERT INTO ${tbl}(${flds}) values(${vs})`
                        })
                        // tx.executeSql(sql, vs, function (tx, result) {
                        //     console.log("insert ok")
                        //     // console.log(tx, result)

                        // }, function (tx, error) {
                        //     console.log("insert fail")
                        //     // console.log(error.message)
                        //     // throw new Error(error);
                        //     _this.errorCall && _this.errorCall(error.message)
                        // });
                    })
                    //callback && callback(tbl);
                    _this.setSqlcmd.call(_this)
                });
            },
            empty: function (tbls, callback) {
                var tbls = tbls == null || tbls.length == 0 ? this.tbls : tbls;
                var _this = this;
                _this.sqls = []
                for (var t in tbls) {
                    _this.sqls.push({
                        sql: `DELETE FROM ${t}`,
                        tbl: t
                    })
                }
                // this.exe(_this.sqls, callback)
                _this.setSqlcmd.call(_this)
                // var del = function (tx, t) {
                //     var sql = `DELETE FROM ${t}`
                //     console.log(tx, sql)
                //     tx.executeSql(sql, [], function (ctx, result) {
                //         console.log("删除表成功 " + t);
                //     }, function (tx, error) {
                //         console.error('删除表失败:' + t + error.message);
                //         // throw new Error(error);
                //         _this.errorCall && _this.errorCall(error.message)
                //     })
                // }
                // this.db.transaction(function (tx) {
                //     for (var t in tbls) {
                //         del(tx, t)
                //         callback && callback(t)
                //     }
                // });
            },
            del: function (tbl, ids) {
                var sql = `DELETE FROM ${tbl} Where rowid in [${ids}]`

                this.exe({
                    sql: sql,
                    tbl: tbl
                })
                // this.db.transaction(function (tx) {
                //     console.log(sql)
                //     tx.executeSql(sql, [], function (ctx, result) {
                //         console.log("删除表成功 " + tbl);
                //     }, function (tx, error) {
                //         console.error('删除表失败:' + tbl + error.message);
                //     })
                // })
            },
            drop: function () {
                var tbls = tbls == null || tbls.length == 0 ? this.tbls : tbls;
                var _this = this;
                _this.sqls = []
                for (var t in tbls) {
                    _this.sqls.push({
                        sql: `drop table ${t}`,
                        tbl: t
                    })
                }
                _this.setSqlcmd.call(_this)
            },
            //查询
            list: function (tbls, options, callback) {
                var arr = ["WHERE 1=1"]
                for (var key in options) {
                    if (key !== "orderby" && key !== "groupby") {
                        if (_.type(options[key]) === "number") {
                            arr[arr.length - 1] = key + "=" + options[key] + "";
                        } else {
                            arr[arr.length - 1] = key + "='" + options[key] + "'";
                        }
                    }
                }
                var condition = arr.join(" & ");
                if (options.groupby) {
                    condition += " GROUP BY " + options.groupby
                }
                if (options.orderby) {
                    condition += " ORDER BY " + options.orderby
                }

                var tbls = tbls || [];
                var _this = this;
                _this.sqls = tbls.map(t => {
                    return {
                        tbl: t,
                        sql: `SELECT * FROM ${t} ${condition}`
                    }
                })
                this.exe(_this.sqls, callback)
                _this.setSqlcmd.call(_this)
            },
            //执行sql
            exe: function (sql, callback, errorCall) {
                var _this = this;
                var store = function (tx, sql, tbl) {
                    // console.log(sql)

                    console.time(sql);
                    var timeStart = +new Date();
                    tx.executeSql(sql, [], function (tx, results) {

                        _this.sqls.forEach(function (t) {
                            if (t.tbl === tbl) {
                                t.sql = sql
                            }
                        })
                        _this.rs[tbl] = [];
                        for (var i = 0; i < results.rows.length; i++) {
                            _this.rs[tbl].push(results.rows.item(i));
                        }
                        var timeEnd = +new Date();
                        console.timeEnd(sql);
                        var duration = timeEnd - timeStart
                        if (tbl !== "sys_log")
                            _this.log(sql, duration)

                        callback && callback.call(_this, _this.rs[tbl], tbl);
                    }, function (tx, error) {
                        // console.error(  error.message);
                        errorCall && errorCall(error.message)
                    });

                }
                this.db.transaction(function (tx) {
                    if (_.type(sql) === "array") {
                        sql.forEach(t => {
                            store(tx, t.sql, t.tbl)
                        })

                    } else {
                        store(tx, sql.sql, sql.tbl)
                    }

                })
            },
            log: function (sql, duration) {
                // var sql=`insert into`
                var sqlLog = `INSERT INTO sys_log values(?,?,?)`;
                var vals = [+new Date(), sql, duration]
                this.db.transaction(function (tx) {
                    tx.executeSql(sqlLog, vals, function (tx, results) {
                        console.log(results)

                    }, function (tx, error) {
                        // console.error(  error.message);
                        // errorCall && errorCall(error.message)
                    })

                })

            },
            //表名导航
            hd: function () {
                var tbls = [];
                var _this = this;
                for (var tbl in _this.tbls) {
                    if (tbl.indexOf("sys_") === -1) {
                        tbls.push(tbl)
                    }
                }
                return _.wrap("ul", tbls.map(function (t) {
                    return _.wrap("li", _.wrap("i", "") +
                        _.wrap("div", t, {
                            class: "text"
                        })
                    )
                }).join(""))
            },
            createHd: function () {
                var tbls = [];
                var _this = this;
                for (var tbl in _this.tbls) {
                    if (tbl.indexOf("sys_") === -1) {
                        tbls.push(tbl)
                    }
                }
                return _.ul(tbls.map(function (t) {
                    return _.li([_.i(""),
                        _.div(t, {
                            class: "text"
                        })
                    ])
                }))
            },
            createSlide: function () {
                var _this = this;
                var hd = _.div(this.createHd(), {
                    class: "hd"
                }, {
                    click: function (e) {
                        var el = e.target;
                        console.log(el)
                        var li = _.closest(el, "li")
                        var config = _this.getGridConfig();

                        if (li) {
                            var tname = li.innerText;
                            if (!config.multisql) {
                                _this.toggleHd(tname)
                                var actLis = _.queryAll(".slide .hd li[active]")
                                if (actLis) {
                                    var tbls = []
                                    actLis.forEach(function (t) {
                                        tbls.push(t.innerText);
                                    })
                                    _this.createList(tbls)
                                }
                            } else {
                                _this.createList([tname])
                                // _this.activeHd(tname)
                            }
                        }
                    }
                })
                var bd = _.div("", {
                    class: "bd"
                }, {
                    click: function (e) {
                        var el = e.target,
                            thead = _.closest(el, "thead"),
                            // table = _.closest(el, "table");
                            table = _.closest(el, ".dataintable");
                        if (thead) {
                            var tbody = _.query("tbody", table);
                            if (el.nodeName.toLowerCase() === "input" && el.getAttribute("type") === "checkbox") {
                                //全选
                                var inputs = _.queryAll("input[type='checkbox']", tbody);
                                inputs.forEach(function (t) {
                                    t.checked = el.checked; //!t.checked;
                                })
                            } else {
                                //排序
                                var td = _.closest(el, "th")
                                if (!td) return;
                                var prop = td.getAttribute("prop");
                                if (prop) {
                                    var seq = td.getAttribute("seq")
                                    seq = seq === "desc" ? "asc" : "desc"
                                    _.queryAll("th[seq]", thead).forEach((t) => {
                                        t.removeAttribute("seq")
                                    })
                                    td.setAttribute("seq", seq)
                                    var tname = table.getAttribute("tablename");
                                    var options = {
                                        orderby: prop + " " + seq
                                    }
                                    _this.list([tname], options || {}, function (rs, tname) {
                                        tbody.parentNode.replaceChild(_this.createGrid(tname, rs, options, "tbody"), tbody)

                                        // _this.setSqlcmd.call(_this, tname)
                                    });
                                }
                            }
                        } else {
                            var tr = _.closest(el, "tr")
                            if (!tr) return;
                            _.queryAll("tr[active]", table).forEach((t) => {
                                t.removeAttribute("active")
                            })
                            tr.setAttribute("active", "");
                        }
                    }
                })
                var container = _.div([hd, bd], {
                    class: "slide_container"
                })
                return _.div(container, {
                    class: "slide"
                })
            },
            createBtns: function () {
                var btns = [{
                    key: "createTbls",
                    val: "初始"
                }, {
                    key: "add",
                    val: "增加"
                }, {
                    key: "empty",
                    val: "清空"
                }, {
                    key: "list",
                    val: "列表"
                }, {
                    key: "drop",
                    val: "删表"
                }, {
                    key: "log",
                    val: "日志"
                }].map((t) => {
                    return _.btn(t.val, {
                        class: t.key
                    })
                })
                var _this = this;
                var btnGroup = _.div(btns, {
                    class: "btn-group"
                }, {
                    click: function (e) {
                        var act = e.target.className.split(" ")[1]
                        console.log(e.target, act)
                        switch (act) {
                            case "list":
                                var tbls = [];
                                for (var tbl in _this.tbls) {
                                    tbls.push(tbl)
                                }
                                _this.createList(tbls);
                                break;
                            case "add":
                                var tbls = []
                                _.queryAll(".dataintable").forEach(function (t) {
                                    tbls.push(t.getAttribute("tablename"))
                                })
                                for (var tbl in _this.data) {
                                    console.log(tbl)

                                    // if(tbls.indexOf(tbl)>=0){

                                    // }else{

                                    // }

                                    _this.insert(tbl, _this.data[tbl])

                                    // _this.insert(tbl, data[tbl], tbls.indexOf(tbl) >= 0 ? _this.reflashList.bind(_this) : null)


                                }
                                break;
                            case "empty":
                                _this.empty([], _this.reflashList.bind(_this));
                                break;
                            case "del":
                                _this.del("SSF_ORDER_DETAILS", 1);
                                break;
                            case "log":
                                _this.createList(["sys_log"])
                                break;
                            default:
                                act && _this[act] && _this[act]();
                        }
                    }
                })

                return btnGroup
            },
            reflashList: function (tbl) {
                // console.log(tbl);
                // var activeLi = document.querySelector(".slide .hd li[active]");


                // if (activeLi) {
                //     var tname = activeLi.innerText.trim();
                //     // if (tbl === tname) 
                //     this.createList([tname]);
                // }



                var tbls = [];
                _.queryAll(".dataintable").forEach(function (t) {
                    tbls.push(t.getAttribute("tablename"));
                })

                this.createList(tbls);

            },
            //代替showList  创建el方式替代字符串拼接
            createList: function (tbls, options) {
                var bd = document.querySelector(".slide .bd")
                console.log(bd)
                var _this = this;
                var tbls = tbls || []
                bd.innerHTML = "";
                _this.list(tbls, options || {}, function (rs, tname) {
                    bd.appendChild(_.li(_this.createGrid(tname, rs, options)))
                    // _this.setSqlcmd.call(_this)
                });
            },
            //sql关键字高亮
            hightlightSql: function (sql) {
                var keys = ["select", "from", "where", "desc", "asc", "on", "delete", "values",
                    "if", "not", "EXISTS", "unique",
                    "insert\\s+into", "create\\s+table", "drop\\s+table",
                    "order\\s+by", "group\\s+by", "left\\s+join", "right\\s+join", "inner\\s+join"
                ]
                var reg1 = new RegExp("(" + keys.join("|") + ")", "gi");
                return sql.replace(reg1, function (t) {
                    return _.wrap("font", (t.toUpperCase()).replace(/\s+/, " "), {
                        class: "red"
                    })
                }).replace(/;\s*/g, ";<br>")
            },
            setSqlcmd: function (tname) {
                var sqlcmd = _.query(".sqlcmd .textarea")
                var _this = this;

                if (sqlcmd) {
                    // var tbls = this.getTbls()
                    if (sqlcmd.tagName.toLowerCase() === "textarea") {
                        sqlcmd.value = this.sqls.map(function (t) {
                            return t.sql
                        }).join(";\n")
                        //  tbls.map(function (t) {
                        //     return (_this.sqls[t] || "").trim()
                        // }).join(";\n")
                    } else { //contenteditable
                        // sqlcmd.innerHTML = tbls.map(function (t) {
                        //     return _this.hightlightSql((_this.sqls[t] || "").trim())
                        // }).join(";<br>")

                        // sqlcmd.innerHTML = _this.hightlightSql(tbls.map(function (t) {
                        //     return (_this.sqls[t] || "").trim()
                        // }).join(";"))

                        sqlcmd.innerHTML = _this.hightlightSql(this.sqls.map(function (t) {
                            return t.sql
                        }).join(";\n"))
                    }
                    // this.activeHd(tbls)
                }
            },
            getTbls: function () {
                var tbls = []
                _.queryAll(".dataintable").forEach(function (t) {
                    tbls.push(t.getAttribute("tablename"))
                })
                return tbls
            },
            //根据rs取得默认表结构
            getTbl: function (rs, tname) {
                var arr = _.obj2arr(rs[0]),
                    keys = arr.keys,
                    typs = arr.typs;
                var tbl = this.tbls[tname.trim()] || [];
                return keys.map(function (t, i) {
                    var fld = tbl.filter(function (f) {
                        return f.prop === t
                    })[0];
                    return {
                        prop: t,
                        label: fld && fld.label || t,
                        type: fld && fld.type || typs[i],
                        format: fld && fld.format || ""
                    }
                })

                // var tbl = this.tbls[tname] || this.getTbl(rs);
                // tbl.forEach(function (t) {
                //     t.hide=_.type(rs[0][t.prop]) === "undefined"
                // })
            },
            //生成表格 dom节点，可加载事件
            createGrid: function (tname, rs, options, resultType) {
                var _this = this;
                var tbl = this.getTbl(rs, tname);
                var config = _.extend(this.getGridConfig(), options)
                if (!resultType && config.fixedhead) {
                    resultType = "fixedhead"
                }

                var _row = function (r, i) {
                    var arr = _.obj2arr(r),
                        vals = arr.vals;
                    var cell = vals.map(function (t, j) {
                        //计算
                        switch (typs[j]) {
                            case "number":
                                var colIndex = j + offset;
                                //数据行累加计算
                                if (i > 0 && t) {
                                    tfoot[colIndex] += parseFloat(t);
                                }
                                //最后一行，处理小数
                                if (i === len) {
                                    //保留1位并去掉多余0
                                    tfoot[colIndex] = parseFloat(tfoot[colIndex].toFixed(1))
                                }
                                break;
                            case "date":
                                t = [_.createEle("i", "", {
                                    class: "date"
                                }), fmts[j] ? _time(t).format(fmts[j]) : t]

                                break;
                        }
                        return _.td(t, {
                            class: typs[j]
                        });
                    });
                    if (config.seq) cell.unshift(_.td(i === 0 ? "#" : i));
                    if (config.check) cell.unshift(_.td(_.checkbox()));


                    return _.tr(cell, {
                        rowid: i
                    })
                }
                //类型
                var typs = [];
                var fmts = [];
                var offset = 0;
                if (config.check) offset++;
                if (config.seq) offset++;

                var len = rs.length;
                var showFoot = false;

                //定义列宽
                var defWidth = (100 - 5 * offset) / tbl.length + "%"
                var colgroup = tbl.map(function (t) {
                    return _.col("", {
                        // style: "width: " + (t.width ? t.width : "auto") + ";"

                        style: "width: " + (t.width ? t.width : defWidth) + ";"
                    })
                })
                if (config.seq) colgroup.unshift(_.col("", {
                    style: "width: 5%;"
                }));
                if (config.check) colgroup.unshift(_.col("", {
                    style: "width: 5%;"
                }));


                var orderby = config.orderby || ""
                var thead =
                    tbl.map(function (t) {
                        var typ = t.type ? t.type : "string";
                        var fmt = t.format ? t.format : "";
                        var lable = t.label ? t.label : t;
                        var prop = t.prop ? t.prop : t;
                        var seq = "";
                        var hide = !!t.hide;
                        if (!config.label) lable = prop;
                        //排序
                        if (prop === orderby.split(" ")[0]) {
                            seq = orderby.split(" ")[1] || "asc"
                        }


                        if (!hide) {
                            if (typ === "number" && config.statistic) showFoot = true;
                            typs.push(typ);
                            fmts.push(fmt);
                        }
                        return hide ? "" : _.th([_.div(lable, {
                            class: "text"
                        }), _.div("", {
                            class: "icon"
                        })], {
                            class: typ,
                            prop: prop,
                            seq: seq
                        });
                    });

                if (config.seq) thead.unshift(_.th("#"));
                if (config.check) thead.unshift(_.th(_.checkbox()));
                var tfoot = new Array(offset).fill("").concat(typs).map(function (t, i) {
                    return i === 0 ? "合计" : t === "number" ? 0 : "";
                });
                var tbody =
                    len === 0 ? _.createEle("tr td", "未查到记录", {
                        colspan: tbl.length + offset
                    }) :
                    rs.map(function (r, i) {
                        return _row(r, i + 1)
                    });

                tfoot = showFoot ? tfoot.map(function (t) {
                    return _.td(t, {
                        class: t === "" ? "string" : "number"
                    });
                }) : "";

                var optPanel = _.div([_.btn("删除", {}, {
                    click: function (e) {
                        var el = e.target,
                            table = _.closest(el, ".dataintable");
                        var cbs = _.queryAll("tbody input[type='checkbox']:checked", table);
                        var tablename = table.getAttribute("tablename")
                        // var sql=""
                        cbs.forEach(function (t) {
                            //  sql=`delete from ${tablename} where id=`
                            var tr = _.closest(t, "tr")
                            var rowid = tr.getAttribute("rowid")
                            _this.sqls.push({
                                tbl: tbl,
                                sql: `delete from ${tablename} where rowid=${rowid}`
                            })
                        })
                        _this.setSqlcmd.call(_this)

                    }
                }), _.btn("取消", {}, {
                    click: function (e) {
                        var el = e.target,
                            table = _.closest(el, ".dataintable");
                        var cbs = _.queryAll("input[type='checkbox']:checked", table);
                        cbs.forEach(function (t) {
                            t.checked = false;
                        })
                        optPanel.style.overflow = "hidden"

                    }
                })], {
                    class: "optPanel"
                })
                switch (resultType) {
                    case "colgroup":
                        _.colgroup(colgroup);
                        break;
                    case "thead":
                        return _.thead(thead);
                        break;
                    case "tbody":
                        return _.tbody(tbody);
                        break;
                    case "tfoot":
                        return _.tfoot(tfoot);
                        break;
                    case "fixedhead":
                        var cols = _.colgroup(colgroup)
                        return _.div([
                            _.div(_.table([cols, _.thead(thead)], {
                                // class: "dataintable",
                                tablename: tname
                            }), {
                                class: "table-fixed-head"
                            }),
                            _.div(_.table([cols.cloneNode(true), _.tbody(tbody), _.tfoot(tfoot)], {
                                // class: "dataintable",
                                tablename: tname
                            }), {
                                class: "table-fixed-body"
                            })

                        ], {
                            class: "dataintable",
                            tablename: tname
                        })
                        break;
                    default:
                        return _.div([_.table([_.colgroup(colgroup), _.thead(thead), _.tbody(tbody), _.tfoot(tfoot)], {
                            tablename: tname
                        }), optPanel], {
                            class: "dataintable",
                            tablename: tname
                        });
                }

            },
            //字符串拼接方式 生成表格
            grid: function (tname, rs, options) {
                var tbl = this.tbls[tname];
                var _row = function (r, i) {
                    var tag = "td",
                        arr = _.obj2arr(r),
                        vals = arr.vals;
                    var cell =
                        (options.check ? _.wrap(tag, checkbox) : "") +
                        (options.seq ? _.wrap(tag, i === 0 ? "#" : i) : "") +
                        vals.map(function (t, j) {
                            //计算
                            switch (typs[j]) {
                                case "number":
                                    var colIndex = j + offset;
                                    //数据行累加计算
                                    if (i > 0 && t) {
                                        tfoot[colIndex] += parseFloat(t);
                                    }
                                    //最后一行，处理小数
                                    if (i === len) {
                                        //保留1位并去掉多余0
                                        tfoot[colIndex] = parseFloat(tfoot[colIndex].toFixed(1))
                                    }
                                    break;
                                case "date":
                                    t = _.wrap("i", "", {
                                        class: "date"
                                    }) + t
                                    break;
                            }
                            return _.wrap("td", t, {
                                class: typs[j]
                            });
                        }).join("");
                    return _.wrap("tr", cell, {
                        rowid: i
                    })
                }
                //类型
                var typs = [];
                var offset = 0;
                if (options.check) offset++;
                if (options.seq) offset++;

                var len = rs.length;
                var checkbox = _.wrap("div", '<input type="checkbox"/>');

                var thead = (options.check ? _.wrap("th", checkbox) : "") +
                    (options.seq ? _.wrap("th", "#") : "") +
                    tbl.map(function (t) {
                        var typ = t.type ? t.type : "string";
                        var lable = t.label ? t.label : t;
                        var prop = t.prop ? t.prop : t;
                        lable += _.wrap("div", "", {
                            class: "icon"
                        })
                        typs.push(typ);
                        return _.wrap("th", lable, {
                            class: typ,
                            prop: prop
                        });
                    }).join("");

                var tfoot = new Array(offset).fill("").concat(typs).map(function (t, i) {
                    return i === 0 ? "合计" : t === "number" ? 0 : "";
                });
                var tbody =
                    len === 0 ? _.wrap("tr td", "未查到记录", {
                        colspan: tbl.length + offset
                    }) :
                    rs.map(function (r, i) {
                        return _row(r, i + 1)
                    }).join("");

                tfoot = tfoot.map(function (t) {
                    return _.wrap("td", t, {
                        class: "number"
                    });
                }).join("");
                return _.wrap("table",
                    _.wrap("thead", thead) +
                    _.wrap("tbody", tbody) +
                    _.wrap("tfoot", tfoot), {
                        class: "dataintable",
                        tablename: tname
                    });
            },
            activeHd: function (tbl) {
                var lis = _.queryAll(".slide .hd li")
                var tbls = _.type(tbl) === "array" ? tbl : [tbl];
                lis.forEach(function (t) {
                    if (tbls.indexOf(t.innerText) >= 0) {
                        t.setAttribute("active", "")
                    } else {
                        t.removeAttribute("active");
                    }
                })
            },
            toggleHd: function (tbl) {
                var lis = _.queryAll(".slide .hd li")
                lis.forEach(function (t) {
                    if (t.innerText === tbl) {
                        t.hasAttribute("active") ? t.removeAttribute("active") : t.setAttribute("active", "")
                    }
                })
            },
            //获取选中文本
            getSelectedText: function (inputDom) {
                if (document.selection) //IE
                {
                    return document.selection.createRange().text;
                } else {

                    var val = this.getTextareaValue(inputDom)
                    return val.substring(inputDom.selectionStart,
                        inputDom.selectionEnd) || val;
                }
            },
            getTextareaValue: function (inputDom) {

                var val = "";
                if (inputDom.tagName.toLowerCase() === "textarea") {
                    val = inputDom.value
                } else {
                    val = inputDom.innerText
                    //由于contenteditable属性产生的换行机制问题
                    //纯文本模式下，会加Unicode等于10和160的2位字符，
                    val = val.replace(/[\u000A|\u00A0]/g, function (t) {
                        return " "
                    })
                }
                return val

                // for(var i=0 ;i<sql.length;i++){
                //     console.log(sql[i]+":"+sql.charCodeAt(i))
                // }

            },
            //设置高亮
            setTextSelected: function (inputDom, startIndex, endIndex) {
                if (inputDom.setSelectionRange) {
                    inputDom.setSelectionRange(startIndex, endIndex);
                } else if (inputDom.createTextRange) //IE 
                {
                    var range = inputDom.createTextRange();
                    range.collapse(true);
                    range.moveStart('character', startIndex);
                    range.moveEnd('character', endIndex - startIndex - 1);
                    range.select();
                }
                inputDom.focus();
            },
            createSqlcmd: function () {
                // var textarea = _.textarea("", {
                //     cols: "80",
                //     rows: "5",
                // })
                var _this = this;
                var textarea = _.div("", {
                    contentEditable: "plaintext-only",
                    class: "textarea",
                    // placeholder:"这里输入sql"
                }, {
                    blur: function (e) { //sql语法高亮
                        textarea.innerHTML =
                            _this.hightlightSql(_this.getTextareaValue(textarea))
                    }
                })

                var btn = _.btn("执行sql", {
                    class: "exesql"
                }, {
                    click: function (e) {
                        var bd = document.querySelector(".slide .bd")
                        bd.innerHTML = "";
                        var options = {}
                        var sql = _this.getSelectedText(textarea) //textarea.value
                        if (!sql) {
                            bd.innerHTML = "请输入sql"
                            return;
                        }


                        var tnames = [];
                        sql.split(";").forEach(function (t) {
                            //查询语句
                            if ((/select\s[\s\S]+from\s/i).test(t)) {
                                var tname = ((t.match(/from\s(\S+)\s?/i) || [])[1] || "sqlcmd").toUpperCase();
                                // console.log(tname)
                                _this.exe({
                                    sql: t,
                                    tbl: tname
                                }, function (rs, tbl) {
                                    bd.appendChild(_.li(_this.createGrid(tbl, rs, options)))
                                    tnames.push(tname)
                                    _this.activeHd(tnames)
                                }, function (errormsg) {
                                    bd.appendChild(document.createTextNode(errormsg))
                                    _this.activeHd("")
                                })
                            } else {
                                //非查询语句
                                _this.exe({
                                    sql: t,
                                    tbl: ""
                                }, function () {
                                    // console.log("ok")
                                    // bd.appendChild(document.createTextNode("ok"))

                                    bd.appendChild(_.div(t + ";", {
                                        class: "sql"
                                    }))

                                }, function (errormsg) {
                                    bd.appendChild(document.createTextNode(errormsg))
                                })
                            }
                        })

                    }
                })

                var checkboxs = this.gridConfig.map(function (t) {
                    return _.checkbox(t)
                })
                var btnGroup = _.div([btn].concat(checkboxs), {
                    class: "sqlcmd-btn-group"
                })
                return _.div([textarea, btnGroup], {
                    class: "sqlcmd"
                })
            },
            getGridConfig: function () {
                var config = {}
                this.gridConfig.forEach(function (t) {
                    var val = _.query("input[name='" + t.name + "']").checked
                    // var key = t.name.substring(4).toLowerCase();
                    var key = t.name.toLowerCase();
                    config[key] = val
                })
                return config
            }
        })
    }();
    if (!window.openDatabase) {
        alert("当前环境不支持websql！请用谷歌浏览器试试！");
        return;
    }
    return _websql
})