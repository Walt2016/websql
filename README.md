
# websql 

不想安装数据库，想简单学点SQL的知识，推荐你用WEBSQL，谷歌浏览器自带的数据库。

demo中初始后自带三个表，商品，订单，订单明细。你可以在其中验证自己写的sql。并在日志中查看执行时间。

比如：
统计出每个商品的实际销量、总销售额，并按总销售额降序排列；
select a.goodsid,a.goodsname,b.sq,b.sa from ssf_goods a left join 
(
SELECT goodsid ,sum(quantity) sq ,sum(amount) sa FROM SSF_ORDER_DETAILS  group by goodsid) b
on a.goodsid=b.goodsid
order by  b.sa desc

在多表联接查询时，优先级 on > where > having
使用WHERE来做join，实际上是创建了两张表的笛卡尔积，效率低，在大型数据库中应该避免，而使用INNER JOIN 代替。
比如：
select * from ssf_goods a,ssf_order_details b where a.goodsid=b.goodsid;
select * from ssf_goods a inner join ssf_order_details b on a.goodsid=b.goodsid



## CRUD功能列表
- 创建表  ok
- 删除表
- 增加 ok

- 删除 
- 修改 
- 查询
- 排序 ok
- 过滤 
- 分页 

- 表格 ok
- 全选 ok
- 日期 ok
- 数字 ok
- 合计 ok
- 列宽 ok
- 固定表头 ok


- sql 执行 ok
- 多sql 执行 ok
- sql 语法高亮 ok
- 日志及sql执行效率   ok


## DEMO地址
https://walt2016.github.io/websql/