var _menu = [{
        label: "配置管理"
    },
    {
        label: "项目管理",
        url: "viewBpProject.html",
        children:[{
            label: "立项",
            url: "viewBpProject.html"
        },{
            label: "方案定制",
            url: "viewBpScheme.html"
        },{
            label: "委托关系确立",
            url: "queryFinishRadicate.html"
        },{
            label: "采购启动",
            url: "viewBpPurchase.html"
        },{
            label: "询价函发送",
            url: "viewBpPurchaseFile.do.html"
        },{
            label: "报价录入",
            url: "viewBpQuotationMain.html"
        },{
            label: "采购结果",
            url: "viewBpResultMain.html"
        }]
    },
    {
        label: "再保管理",
        url: "prepareQuery.html",
        children: [{
            label: "再保份额确认",
            url: "prepareQuery2.html"
        }, {
            label: "再保摊回查询",
            url: "prepareAmortizeQuery.html"
        }, {
            label: "再保账单95",
            url: "prepareQuery3.html"
        }, {
            label: "再保账单35",
            url: "prepareQuery4.html"
        }]
    },
    {
        label: "理赔查询",
        url: "prepareQuery5.html",
        children: [{
                label: "查询界面",
                url: "prepareQuery5.html"
            },
            {
                label: "案件详细",
                url: "prepareQuery6.html"
            }

        ]
    },
    {
        label: "咨询管理",
        url: "viewConsultantProject.html",
        // url: "prepareQuery7.html",
        children: [{
            label: "咨询项目详情",
            url: "viewConsultantProject.html",
        },
        {
            label: "服务范围及计划确定",
            url: "prepareNodeCodeTaskQuery.html",
        },
        {
            label: "项目经理执行维护",
            url: "businessExecManagement.html",
        },
        

    ]
    },
    
    {
        label: "问题件管理",
        url: "问题件--处理查询.html",
        children: [{
            label: "处理查询",
            url: "问题件--处理查询.html",
        },
        {
            label: "新增问题件",
            url: "问题件--新增问题件.html"
        }

    ]

    },
    {
        label: "黑名单管理",
        url: "blackList.html"
    }
];
websql().nav({
    el: "#nav",
    info:{
        text:"XX保险销售有限公司北京分公司"
    },
    logo:{
        url: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOkAAAAjCAIAAAD+JrpmAAAACXBIWXMAAAsTAAALEwEAmpwYAAAF7WlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMxNDAgNzkuMTYwNDUxLCAyMDE3LzA1LzA2LTAxOjA4OjIxICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIiB4bWxuczpzdFJlZj0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlUmVmIyIgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIgeG1sbnM6ZGM9Imh0dHA6Ly9wdXJsLm9yZy9kYy9lbGVtZW50cy8xLjEvIiB4bWxuczpwaG90b3Nob3A9Imh0dHA6Ly9ucy5hZG9iZS5jb20vcGhvdG9zaG9wLzEuMC8iIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTcgKE1hY2ludG9zaCkiIHhtcDpDcmVhdGVEYXRlPSIyMDE5LTAxLTA0VDEzOjAwOjA0KzA4OjAwIiB4bXA6TW9kaWZ5RGF0ZT0iMjAxOS0wMS0wN1QxNzoyODo0MSswODowMCIgeG1wOk1ldGFkYXRhRGF0ZT0iMjAxOS0wMS0wN1QxNzoyODo0MSswODowMCIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDplMTk5MGVhMC1hZmY1LTRiMjMtYjAyMS1lNTMzNzAzZGFiNjAiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6QTc1MjA4N0FCNDk4MTFFODkwNzZCMTY3MUYxQjZDQkYiIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDpBNzUyMDg3QUI0OTgxMUU4OTA3NkIxNjcxRjFCNkNCRiIgZGM6Zm9ybWF0PSJpbWFnZS9wbmciIHBob3Rvc2hvcDpDb2xvck1vZGU9IjMiIHBob3Rvc2hvcDpJQ0NQcm9maWxlPSJzUkdCIElFQzYxOTY2LTIuMSI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOkE3NTIwODc3QjQ5ODExRTg5MDc2QjE2NzFGMUI2Q0JGIiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOkE3NTIwODc4QjQ5ODExRTg5MDc2QjE2NzFGMUI2Q0JGIi8+IDx4bXBNTTpIaXN0b3J5PiA8cmRmOlNlcT4gPHJkZjpsaSBzdEV2dDphY3Rpb249InNhdmVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOmUxOTkwZWEwLWFmZjUtNGIyMy1iMDIxLWU1MzM3MDNkYWI2MCIgc3RFdnQ6d2hlbj0iMjAxOS0wMS0wN1QxNzoyODo0MSswODowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIENDIChNYWNpbnRvc2gpIiBzdEV2dDpjaGFuZ2VkPSIvIi8+IDwvcmRmOlNlcT4gPC94bXBNTTpIaXN0b3J5PiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PuK4Aj8AAA6gSURBVHic7Zx9UFRXmsZ/qBGlFVDTHTCDoGliWFSUzfoRPzCixsTJymonsUpYspoJRs2k4mZmYGook2Km7C0nZDbjB9QO2WHFKsfARpaYOEpnRUBFZ1BEhqg92ogjbLeO0EpLR4P7xz327b7c/oCQD3b7+ev2uefrnvOc97zvcw6E3L9/nyCCGIQY8m13IIgg+okgd4MYrAhyN4jBiiB3gxisCHI3iMGKQcxdm52SauouYrH2swaLlfXFlFQHWoO3Fh1OSqpxOPvZjW8FpkaMFTS1ftv9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",
        width:"233px",
        height:"35px",
        top:"10px"
    },
    menu: _menu
})