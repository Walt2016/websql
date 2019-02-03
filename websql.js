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
        createEle: function (tag, text, options) {
            var i = tag.indexOf(" ");
            if (i > 0) {
                var leftTag = tag.substring(0, i)
                return _.createEle(leftTag, _.createEle(tag.substring(i + 1), text, options))
            }
            var ele = document.createElement(tag);
            var append = function (text) {
                switch (_.type(text)) {
                    case "string":
                    case "number":
                    case "date":
                        ele.innerHTML += text;
                        break;
                    case "array":
                        text.forEach(function (t) {
                            append(t)
                        })
                        break;
                    case "null":
                        break;
                    default:
                        ele.appendChild(text)
                }
            }
            append(text)
            for (var key in options) {
                ele.setAttribute(key, options[key])
            }
            return ele;
        },
        createCheckbox: function () {
            return _.createEle("input", '', {
                type: "checkbox"
            })
        }
    }

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
            this.tbls = options.tbls;
            //操作数据
            this.data = options.data;
            //所有数据
            this.rs = [];
        }

        return _.createClass(Websql, {
            _: _,
            createTbls: function (tbls) {
                var tbls = tbls || this.tbls;
                this.db.transaction(function (tx) {
                    for (var t in tbls) {
                        var sql = `CREATE TABLE IF NOT EXISTS ${t}(${tbls[t]})`
                        console.log(sql)
                        tx.executeSql(sql)
                    }
                });
            },
            insert: function (tbl, rs) {
                var self = this;
                this.db.transaction(function (tx) {
                    var flds = self.tbls[tbl].map(function (t) {
                        return t.prop ? t.prop : t;
                    });
                    console.log(flds)
                    rs.forEach(function (r) {
                        var sql = `INSERT INTO ${tbl}(${flds}) values(${new Array(flds.length).fill("?")})`;
                        var vs = flds.map(function (t) {
                            return r[t]
                        });
                        tx.executeSql(sql, vs);
                    })
                });
            },
            empty: function (tbls) {
                var tbls = tbls || this.tbls;
                var del = function (tx, t) {
                    var sql = `DELETE FROM ${t}`
                    console.log(tx, sql)
                    tx.executeSql(sql, [], function (ctx, result) {
                        console.log("删除表成功 " + t);
                    }, function (tx, error) {
                        console.error('删除表失败:' + t + error.message);
                    })
                }
                this.db.transaction(function (tx) {
                    for (var t in tbls) {
                        del(tx, t)
                    }
                });
            },
            del: function (tbl, ids) {
                this.db.transaction(function (tx) {
                    var sql = `DELETE FROM ${tbl} Where rowid in [${ids}]`
                    console.log(sql)
                    tx.executeSql(sql, [], function (ctx, result) {
                        console.log("删除表成功 " + tbl);
                    }, function (tx, error) {
                        console.error('删除表失败:' + tbl + error.message);
                    })
                })
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
                    condition += " group by " + options.groupby
                }
                if (options.orderby) {
                    condition += " order by " + options.orderby
                }

                var tbls = tbls || [];
                var _this = this;
                if (tbls.length === 0) {
                    for (var tbl in _this.tbls) {
                        tbls.push(tbl)
                    }
                }
                var store = function (tx, tbl) {
                    var sql = `SELECT * FROM ${tbl} ${condition}`;
                    console.log(sql)
                    _this.rs[tbl] = [];
                    tx.executeSql(sql, [], function (tx, results) {
                        console.log(results)
                        for (var i = 0; i < results.rows.length; i++) {
                            _this.rs[tbl].push(results.rows.item(i));
                        }
                        callback.call(_this, _this.rs[tbl], tbl);
                    });
                }
                this.db.transaction(function (tx) {
                    console.log(tx)
                    tbls.forEach(function (tbl) {
                        store(tx, tbl)
                    });
                });
            },
            //表名导航
            hd: function () {
                var tbls = [];
                var _this = this;
                for (var tbl in _this.tbls) {
                    tbls.push(tbl)
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
                    tbls.push(tbl)
                }
                return _.createEle("ul", tbls.map(function (t) {
                    return _.createEle("li", [_.createEle("i", ""),
                        _.createEle("div", t, {
                            class: "text"
                        })
                    ])
                }))
            },
            createGrid: function (tname, rs, options, resultType) {
                var tbl = this.tbls[tname];
                var _row = function (r, i) {
                    var tag = "td",
                        arr = _.obj2arr(r),
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
                                }), t]
                                break;
                        }
                        return _.createEle("td", t, {
                            class: typs[j]
                        });
                    });
                    if (options.seq) cell.unshift(_.createEle(tag, i === 0 ? "#" : i));
                    if (options.check) cell.unshift(_.createEle(tag, _.createCheckbox()));


                    return _.createEle("tr", cell, {
                        rowid: i
                    })
                }
                //类型
                var typs = [];
                var offset = 0;
                if (options.check) offset++;
                if (options.seq) offset++;

                var len = rs.length;

                // console.log(options)
                var orderby = options.orderby || ""
                var thead =
                    tbl.map(function (t) {
                        var typ = t.type ? t.type : "string";
                        var lable = t.label ? t.label : t;
                        var prop = t.prop ? t.prop : t;
                        var seq = "";
                        //排序
                        if (prop === orderby.split(" ")[0]) {
                            seq = orderby.split(" ")[1] || "asc"
                        }

                        typs.push(typ);
                        return _.createEle("th", [_.createEle("div", lable, {
                            class: "text"
                        }), _.createEle("div", "", {
                            class: "icon"
                        })], {
                            class: typ,
                            prop: prop,
                            seq: seq
                        });
                    });

                if (options.seq) thead.unshift(_.createEle("th", "#"));
                if (options.check) thead.unshift(_.createEle("th", _.createCheckbox()));


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

                tfoot = tfoot.map(function (t) {
                    return _.createEle("td", t, {
                        class: "number"
                    });
                });
                switch (resultType) {
                    case "thead":
                        return _.createEle("thead", thead);
                        break;
                    case "tbody":
                        return _.createEle("tbody", tbody);
                        break;
                    case "tfoot":
                        return _.createEle("tfoot", tfoot);
                        break;
                    default:
                        return _.createEle("table",
                            [_.createEle("thead", thead), _.createEle("tbody", tbody), _.createEle("tfoot", tfoot)], {
                                class: "dataintable",
                                tablename: tname
                            });
                }

            },
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
                                    // return _.wrap("td", t,{
                                    //     class:"number"
                                    // });
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
            }
        })
    }();

    if (!window.openDatabase) {
        alert("当前环境不支持websql！");
        return;
    }
    return _websql
})




// // db.transaction(function(tx) {
// //     tx.executeSql('UPDATE LOGS SET log=\'www.w3cschool.cc\' WHERE id=?', [id]);
// // });