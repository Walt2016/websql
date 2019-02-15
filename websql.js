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
        createCheckbox: function (options) {
            var checkbox = _.createEle("input", "", _.extend({
                type: "checkbox",
            }, options))
            if (options) {
                var label = _.div(options.label)
                return _.div([checkbox, label], {
                    class: "input-group"
                });
            } else {
                return checkbox
            }
        }
    };
    ["div", "ul", "li", "tbody", "tfoot", "thead", "td", "tr", "th", "table", "textarea", "i"].forEach(function (t) {
        _[t] = function (text, options) {
            return _.createEle(t, text, options)
        }
    });


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
            this.tbls = options.tbls;
            //表数据
            this.data = options.data;
            //所有数据
            this.rs = [];
            this.sqls = {};

            this.gridConfig = [{
                    label: "显示字段别名",
                    checked: true,
                    name: "showLabel"
                }, {
                    label: "显示序号列",
                    checked: true,
                    name: "showSeq"
                },
                {
                    label: "显示选择列",
                    checked: true,
                    name: "showCheck"
                },
                {
                    label: "合计数字列",
                    checked: true,
                    name: "showStatistic"
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
            createTbls: function (tbls) {
                var tbls = tbls || this.tbls;
                var _this = this;

                this.db.transaction(function (tx) {
                    for (var t in tbls) {
                        var flds = tbls[t].map(function (t) {
                            return t.prop ? t.prop : t;
                        });
                        var sql = `CREATE TABLE IF NOT EXISTS ${t}(${flds})`
                        console.log(sql)
                        tx.executeSql(sql, [], function (ctx, result) {
                            console.log("创建表成功 " + t);
                        }, function (tx, error) {
                            console.error('创建表失败:' + t + error.message);
                            // throw new Error(error);
                            _this.errorCall && _this.errorCall(error.message)
                        })
                    }
                });
            },
            insert: function (tbl, rs, callback) {
                var _this = this;
                this.db.transaction(function (tx) {
                    var flds = _this.tbls[tbl].map(function (t) {
                        return t.prop ? t.prop : t;
                    });
                    console.log(flds)
                    rs.forEach(function (r) {
                        var sql = `INSERT INTO ${tbl}(${flds}) values(${new Array(flds.length).fill("?")})`;
                        var vs = flds.map(function (t) {
                            return r[t]
                        });
                        tx.executeSql(sql, vs, function (tx, result) {
                            console.log("insert ok")
                            // console.log(tx, result)

                        }, function (tx, error) {
                            console.log("insert fail")
                            // console.log(error.message)
                            // throw new Error(error);
                            _this.errorCall && _this.errorCall(error.message)

                        });
                    })
                    callback && callback(tbl);
                });
            },
            empty: function (tbls, callback) {
                var tbls = tbls == null || tbls.length == 0 ? this.tbls : tbls;
                var _this = this;
                var sqls = []
                for (var t in tbls) {
                    sqls.push({
                        sql: `DELETE FROM ${t}`,
                        tbl: t
                    })
                }
                this.exe(sqls, callback)
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
                // if (tbls.length === 0) {
                //     return
                //     // for (var tbl in _this.tbls) {
                //     //     tbls.push(tbl)
                //     // }
                // }

                var sqls = tbls.map(t => {
                    return {
                        tbl: t,
                        sql: `SELECT * FROM ${t} ${condition}`
                    }
                })
                this.exe(sqls, callback)
            },
            //执行sql
            exe: function (sql, callback, errorCall) {
                var _this = this;
                var store = function (tx, sql, tbl) {
                    // console.log(sql)

                    console.time(sql);
                    tx.executeSql(sql, [], function (tx, results) {
                        // console.log(results)
                        _this.sqls[tbl] = sql;
                        _this.rs[tbl] = [];
                        for (var i = 0; i < results.rows.length; i++) {
                            _this.rs[tbl].push(results.rows.item(i));
                        }
                        console.timeEnd(sql);

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
                })
                var bd = _.div("", {
                    class: "bd"
                })
                var container = _.div([hd, bd], {
                    class: "slide_container"
                })
                _.addEvent("click", hd, function (e) {
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
                            _this.activeHd(tname)
                        }
                    }
                })
                _.addEvent("click", bd, function (e) {
                    var el = e.target,
                        thead = _.closest(el, "thead"),
                        table = _.closest(el, "table");

                    if (thead) {
                        var tbody = thead.nextSibling;
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

                                    _this.setSqlcmd.call(_this, tname)
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
                }].map((t) => {
                    return _.div(t.val, {
                        class: "btn " + t.key
                    })
                })
                var btnGroup = _.div(btns, {
                    class: "btn-group"
                })
                var _this = this;

                _.addEvent("click", btnGroup, function (e) {
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
                            for (var tbl in data) {
                                console.log(tbl)
                                _this.insert(tbl, data[tbl], _this.reflashList.bind(_this))
                            }
                            break;
                        case "empty":
                            _this.empty([], _this.reflashList.bind(_this));
                            break;
                        case "del":
                            _this.del("SSF_ORDER_DETAILS", 1);
                            break;
                        default:
                            act && _this[act] && _this[act]();
                    }
                })

                return btnGroup
            },
            reflashList: function (tbl) {
                console.log(tbl);
                var activeLi = document.querySelector(".slide .hd li[active]");
                if (activeLi) {
                    var tname = activeLi.innerText.trim();
                    // if (tbl === tname) 
                    this.createList([tname]);
                }
            },
            //代替showList  创建el方式替代字符串拼接
            createList: function (tbls, options) {
                var bd = document.querySelector(".slide .bd")
                var _this = this;
                var tbls = tbls || []
                bd.innerHTML = "";
                _this.list(tbls, options || {}, function (rs, tname) {
                    bd.appendChild(_.li(_this.createGrid(tname, rs, options)))
                    _this.setSqlcmd.call(_this)
                });
            },

            setSqlcmd: function (tname) {
                var sqlcmd = _.query(".sqlcmd .textarea")
                var _this = this;

                if (sqlcmd) {
                    var tbls = this.getTbls()
                    if (sqlcmd.tagName.toLowerCase() === "textarea") {
                        sqlcmd.value = tbls.map(function (t) {
                            return (_this.sqls[t] || "").trim()
                        }).join(";\n")
                    } else {//
                       var keys= ["select","from","where","desc","asc","order by","group by","left join","right join","inner join"];
                      var keyReg= new RegExp("("+keys.join("|")+")", "gi");
                        sqlcmd.innerHTML = tbls.map(function (t) {
                            return (_this.sqls[t] || "").trim().replace(keyReg,function(t){
                                return _.wrap("font",t,{
                                    class:"red"
                                })
                            })
                        }).join(";<br>")
                    }


                    this.activeHd(tbls)
                    // if (_.type(tname) === "array") {
                    //     sqlcmd.value = tname.map(function (t) {
                    //         return _this.sqls[t] || ""
                    //     }).join(";\n")
                    // } else {
                    //     sqlcmd.value = _this.sqls[tname] || ""
                    // }

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
                    })[0]
                    return {
                        prop: t,
                        label: fld && fld.label || t,
                        type: fld && fld.type || typs[i]
                    }
                })

                // var tbl = this.tbls[tname] || this.getTbl(rs);
                // tbl.forEach(function (t) {
                //     t.hide=_.type(rs[0][t.prop]) === "undefined"
                // })
            },
            //生成表格 dom节点，可加载事件
            createGrid: function (tname, rs, options, resultType) {
                var tbl = this.getTbl(rs, tname);
                var config = _.extend(this.getGridConfig(), options)

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
                                }), t]
                                break;
                        }
                        return _.td(t, {
                            class: typs[j]
                        });
                    });
                    if (config.seq) cell.unshift(_.td(i === 0 ? "#" : i));
                    if (config.check) cell.unshift(_.td(_.createCheckbox()));


                    return _.tr(cell, {
                        rowid: i
                    })
                }
                //类型
                var typs = [];
                var offset = 0;
                if (config.check) offset++;
                if (config.seq) offset++;

                var len = rs.length;
                var showFoot = false;

                var orderby = config.orderby || ""
                var thead =
                    tbl.map(function (t) {
                        var typ = t.type ? t.type : "string";
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
                if (config.check) thead.unshift(_.th(_.createCheckbox()));
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
                switch (resultType) {
                    case "thead":
                        return _.thead(thead);
                        break;
                    case "tbody":
                        return _.tbody(tbody);
                        break;
                    case "tfoot":
                        return _.tfoot(tfoot);
                        break;
                    default:
                        return _.createEle("table",
                            [_.thead(thead), _.tbody(tbody), _.tfoot(tfoot)], {
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

                    // for(var i=0 ;i<sql.length;i++){
                    //     console.log(sql[i]+":"+sql.charCodeAt(i))
                    // }

                    return val.substring(inputDom.selectionStart,
                        inputDom.selectionEnd) || val;
                }
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
                var textarea = _.div("", {
                    contentEditable: true,
                    class: "textarea",
                    // placeholder:"这里输入sql"
                })

                var btn = _.div("执行sql", {
                    class: "btn exesql"
                })

                var _this = this;
                _.addEvent("click", btn, function (e) {
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
                                console.log("ok")

                            }, function (errormsg) {
                                bd.appendChild(document.createTextNode(errormsg))
                            })
                        }
                    })

                });
                var checkboxs = this.gridConfig.map(function (t) {
                    return _.createCheckbox(t)
                })
                var btnGroup = _.div([btn].concat(checkboxs), {
                    class: "sqlcmd-btn-group"
                })
                return _.div([textarea, btnGroup], {
                    class: "sqlcmd"
                })
            },
            //
            getGridConfig: function () {
                var config = {}
                this.gridConfig.forEach(function (t) {
                    var val = _.query("input[name='" + t.name + "']").checked
                    var key = t.name.substring(4).toLowerCase();
                    config[key] = val
                })
                return config
            }
        })
    }();
    if (!window.openDatabase) {
        alert("当前环境不支持websql！");
        return;
    }
    return _websql
})