// 常量
var HTML_ENTITY = {}
// 变量
var testModule = {}
// 函数
var clickHandle = function (testDiv) {
    console.log(testDiv)
}

// [强制] 不允许修改和扩展任何原生对象和宿主对象的原型。
// 示例：

// 以下行为绝对禁止
String.prototype.trim = function () {};


// 兼容方案
// 1： 获得滚动条的情况
function getScroll() {
    var t, l, w, h;
    if (document.documentElement && document.documentElement.scrollTop) {
        t = document.documentElement.scrollTop; //滚动条的顶端
        l = document.documentElement.scrollLeft; //滚动条的左端
        w = document.documentElement.scrollWidth; //滚动条的宽度，也就是页面的宽度
        h = document.documentElement.scrollHeight; //滚动条的高度
    } else
    if (document.body) {
        t = document.body.scrollTop;
        l = document.body.scrollLeft;
        w = document.body.scrollWidth;
        h = document.body.scrollHeight;
    }
    return {
        t: t,
        l: l,
        w: w,
        h: h
    };
}

// 2：获得视图浏览器的宽度高度
function getPageWidth() {
    var pageWidth = window.innerWidth;
    if (typeof pageWindth != "number") {
        if (document.compatMode == "CSS1Compat") {
            pageWidth = document.documentElement.clientWidth;
        } else {
            pageWidth = document.body.clientWidth;
        }
    }
    return pageWidth;
}

function getPageHeight() {
    var pageHeight = window.innerHeight;
    if (typeof pageWindth != "number") {
        if (document.compatMode == "CSS1Compat") {
            pageHeight = document.documentElement.clientHeight;
        } else {
            pageHeight = document.body.clientHeight;
        }
    }
    return pageHeight;
}

// 3： 获得当前浏览器型号 名字
function () {
    var Sys = {};
    var ua = navigator.userAgent.toLowerCase();
    var s;
    (s = ua.match(/msie ([\d.]+)/)) ? Sys.ie = s[1]: (s = ua.match(/firefox\/([\d.]+)/)) ? Sys.firefox = s[1] : (s = ua.match(/chrome\/([\d.]+)/)) ? Sys.chrome = s[1] : (s = ua.match(/opera.([\d.]+)/)) ? Sys.opera = s[1] : (s = ua.match(/version\/([\d.]+).*safari/)) ? Sys.safari = s[1] : 0;

    if (Sys.ie != null) {
        return ("IE:" + Sys.ie); //判断IE浏览器及版本号
    }
    if (Sys.firefox != null) {
        return ("firefox:" + Sys.firefox); //判断firefox浏览器及版本号
    }
    if (Sys.chrome != null) {
        return ("chrome:" + Sys.chrome); //判断chrome浏览器及版本号
    }
    if (Sys.opera != null) {
        return ("opera:" + Sys.opera); //判断opera浏览器及版本号
    }
    if (Sys.safari != null) {
        return ("safari:" + Sys.safari); //判断safari浏览器及版本号
    }
}


// 4：事件监听
function (element, type, handler) {
    if (element.addEventListener) {
        element.addEventListener(type, handler, false);
    } else
    if (element.attachEvent) {
        element.attachEvent("on" + type, handler);
    } else {
        element["on" + type] = handler;
    }
}





// 5：事件移除
function (element, type, handler) {
    if (element.removeEventListener) {
        element.removeEventListener(type, handler, false);
    } else
    if (element.detachEvent) {
        element.detachEvent("on" + type, handler);
    } else {
        element["on" + type] = null;
    }
}



// 6：获得event，Firefox事件不断派发的时候，第一次事件会出现问题。
function (event) {
    event = (event ? event : window.event);
    if (event == null) {
        var $E = function () {
            var c = $E.caller;
            while (c.caller)
                c = c.caller;
            return c.arguments[0]
        };
        __defineGetter__("event", $E);
    }
    return event;
}

// 7：阻止默认事件
function (event) {
    if (event.preventDefault) {
        event.preventDefault();
    } else {
        event.returnValue = false;
    }
}


// 8：不继续传播事件
function (event) {
    if (event.stopPropagation) {
        event.stopPropagation();
    } else {
        event.cancelBubble = true;
    }
}

// 9：获得event的target
function (event) {
    return event.target || event.srcElement;
}


// 10： documen.doctype支持不一致

// E： 如果存在文档类型说明， 会将其错误的解释为一个注释并把它当做Comment节点， document.doctype的值始终是null。

// Firefox： 如果存在文档类型说明， 则将其作为文档的第一个子节点， document.doctype是一个DocumentType节点， 也可以通过firstChild或者childNodes[0] 访问同一个节点。

// Safari、 Chrome、 Opera： 如果存在文档类型说明， 则将其作为解释， 但不作为文档的子节点， 不会出现在childNodes中的。

// 11： 查找元素
// 我有时候， 我真搞不明白， IE总是在搞什么， 总是想标新立异。 如果系统不让自带浏览器的话， 我敢说， IE的份额将会更少。

// 如果id和name一样的话， 他也将被返回


// <
// html >
//     <
//     head >
//     <
//     script defer >
//     var item = document.getElementById("my");
// item.value = "SECOND";

// <
// /script> < /
// head > <
//     body >
//     <
//     input type = "text"
// name = "my"
// value = "FIRST" >
//     <
//     /body> < /
//     html >

//     在IE中， 结果变化了。

// 同样是IE， Id大小写不区分



//     <
//     html >
//     <
//     head >
//     <
//     script defer >
//     var item = document.getElementById("MY");
// item.value = "SECOND";

// <
// /script> < /
// head > <
//     body >
//     <
//     input type = "text"
// id = "my"
// value = "FIRST" >
//     <
//     /body> < /
//     html >




//     不好意思， 他的结果又变化了。

// 12： 如果是自定义属性的话， item.myattributs在非IE浏览器的情况下， 是无法得出正确结果的。

// 代码如下:

//     function (item, myatt) {
//         return item.attributes[myatt].value;
//     }

// 同样的话， 设置属性应该知道怎么办吧， 就是赋值呗。

// 代码如下:

//     function (item, myatt, value) {
//         item.attributes[myatt].value = value;
//     }

// 13： 元素的子节点个数

// 代码如下:

//     <
//     ul id = "myul" >
//     <
//     li > first < /li> <
// li > second < /li> <
// li > third < /li> < /
// ul >

//     IE结果是3， 其他浏览器是7。

// Node之间的空白符， 在其他浏览器是文本节点， 结果就是7。 如果变成这样，

// 代码如下:

//     <
//     ul id = "myul" > < li > first < /li><li>second</li > < li > third < /li></ul >

//     这样大家的结果都是3了。
// 14： 创立节点问题

// 代码如下:

//     //动态添加Element，所有的浏览器都可以实现
//     var newnode = document.createElement("input");
// newnode.type = "button";
// newnode.value = "sixth";
// //在IE中可以还这么实现
// var newnode = document.createElement("<input type=\"button\">");



(function (window, factory) {
    if (typeof exports === 'object') {
     
        module.exports = factory();
    } else if (typeof define === 'function' && define.amd) {
     
        define(factory);
    } else {
     
        window.eventUtil = factory();
    }
})(this, function () {
    //module ...
});


// 恒等
1===1

1=='1'