import{s as p}from"./monitor_ef_core_service-f04488c8.js";import{a as u,R as g,c as s,j as f,d as v,f as t,w as a,e as o,k as l,n as k}from"./index-7722fba7.js";const h={class:"text-danger"},R={setup(x){const i=u([]),d={getTimeConsumingRanking(){p.getTimeConsumingRanking().then(r=>{i.value=r.data})}};d.getTimeConsumingRanking();let c=u(null);return c.value=setInterval(()=>{d.getTimeConsumingRanking()},10*1e3),g(()=>{clearInterval(c.value)}),(r,C)=>{const n=s("a-table-column"),m=s("a-popover"),_=s("a-table");return f(),v("div",null,[t(_,{"data-source":i.value},{default:a(()=>[t(n,{key:"index",title:"\u5E8F\u53F7",width:80},{default:a(({index:e})=>[o("span",null,l(e+1),1)]),_:1}),t(n,{key:"sql",title:"Sql \u811A\u672C","data-index":"sql",ellipsis:!0},{default:a(({text:e})=>[t(m,{title:"Sql \u811A\u672C"},{content:a(()=>[k(l(e),1)]),default:a(()=>[o("div",null,l(e),1)]),_:2},1024)]),_:1}),t(n,{key:"elapsedMilliseconds",title:"\u8017\u65F6","data-index":"elapsedMilliseconds",width:100},{default:a(({text:e})=>[o("span",h,l(e)+" \u6BEB\u79D2",1)]),_:1}),t(n,{key:"time",title:"\u8BB0\u5F55\u65F6\u95F4","data-index":"time",width:200})]),_:1},8,["data-source"])])}}};export{R as default};
