import{r as k,J as M,o as x,c as n,j as t,d as i,f as l,w as s,F as u,C,l as r,q as c,z as S,n as f,t as v}from"./index-7722fba7.js";import{s as L}from"./timedTaskService-8226282b.js";const y=f(" \u9996\u9875 "),w={key:0,style:{textAlign:"center",marginTop:"12px",height:"32px",lineHeight:"32px"}},z=f(" \u66F4\u591A... "),F={props:{formId:String},setup(_){const m=_,e=k({vm:M(()=>m.formId),loading:!0,loadingMore:!1,showLoadingMore:!0,table:{page:1,size:20},dataSource:[],input:"1",timer:void 0}),o={getloginfo(){e.loading=!0,L.getJobLoggers(e.vm,e.table.page,e.table.size).then(a=>{a.data.length>0?e.table.page==1?e.dataSource=a.data.concat(e.dataSource):e.dataSource=e.dataSource.concat(a.data):(v.message("\u672A\u67E5\u8BE2\u5230\u6570\u636E"),e.showLoadingMore=!1)}).finally(()=>{e.loading=!1,e.loadingMore=!1})},onLoadMore(){e.loadingMore=!0,e.table.page+=1,o.getloginfo(e.table.page)},firstPage(){e.table.page=1,e.dataSource=[],o.getloginfo()}};return x(()=>{o.getloginfo()}),(a,B)=>{const d=n("a-button"),h=n("a-step"),g=n("a-spin"),b=n("a-steps");return t(),i(u,null,[l(d,{class:"mb-15",onClick:o.firstPage},{default:s(()=>[y]),_:1},8,["onClick"]),l(g,{spinning:r(e).loading},{default:s(()=>[l(b,{"progress-dot":"",direction:"vertical"},{default:s(()=>[(t(!0),i(u,null,C(r(e).dataSource,p=>(t(),c(h,{key:p.id,status:"process",title:p.text},null,8,["title"]))),128)),r(e).showLoadingMore?(t(),i("div",w,[r(e).loadingMore?(t(),c(g,{key:0})):(t(),c(d,{key:1,onClick:o.onLoadMore},{default:s(()=>[z]),_:1},8,["onClick"]))])):S("",!0)]),_:1})]),_:1},8,["spinning"])],64)}}};export{F as default};
