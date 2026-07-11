import{a1 as He,aS as St,ab as Ta,as as _t,l as De,a9 as Ct,bE as At,r as u,j as e,by as w,bF as Pt,bG as Tt,aT as ra,aU as Ft,bH as It,u as Et,q as Ot,I as $t,be as Lt,bq as Qt,bx as zt,bA as Rt,a7 as kt,z as Ut,bs as Mt,b2 as Dt,aN as Vt,B as Bt,D as Gt,a5 as Wt,bI as Fa,bC as Da,bD as Kt,a_ as Ia,a$ as Ea}from"./index-B1oAVVFK.js";const Je=(a={})=>({id:a.id,userId:a.userId??a.user_id,companyId:a.companyId??a.company_id,entityType:a.entityType??a.entity_type??"",name:a.name??"",columns:Array.isArray(a.columns)?a.columns:[],filters:a.filters&&typeof a.filters=="object"?a.filters:{},sort:a.sort&&typeof a.sort=="object"?a.sort:{},isDefault:!!(a.isDefault??a.is_default),isShared:!!(a.isShared??a.is_shared)}),ea={async listCustomViews(a){const s=await He.get("/custom-views",{params:a?{entityType:a}:{}});return(Array.isArray(s==null?void 0:s.data)?s.data:[]).map(Je)},async createCustomView(a){const s=await He.post("/custom-views",a);return Je((s==null?void 0:s.data)||{})},async updateCustomView(a,s){const l=await He.put(`/custom-views/${encodeURIComponent(a)}`,s);return Je((l==null?void 0:l.data)||{})},async upsertCustomViewByName(a){const s=(a==null?void 0:a.entityType)||"",l=String((a==null?void 0:a.name)||"").trim(),r=(await this.listCustomViews(s)).find(c=>String(c.name||"").trim()===l)||null;return r!=null&&r.id?this.updateCustomView(r.id,a):this.createCustomView(a)}},aa=25,ta=8,ia="crm-admin-quotation-manager-layout",Oa="quotation_layout_preferences",$a="Admin Quotation Manager Layout",Zt=5*1024*1024,Xt=["pdf","xls","xlsx"],La={num:"",owner:"",date:"",company:"",amount:"",status:"",project:""},sa={accountNumber:"",name:"",email:"",phone:"",accountOwner:""},Yt=[{value:"",label:"Select"},{value:"open",label:"Open"},{value:"approved",label:"Approved"},{value:"customer_approved",label:"Customer Approved"},{value:"customer_rejected",label:"Customer Rejected"},{value:"rejected",label:"Rejected"},{value:"cancelled",label:"Cancelled"}],Qa=[{value:"INR",label:"INR"},{value:"USD",label:"USD"},{value:"AED",label:"AED"},{value:"NZD",label:"NZ$"},{value:"CAD",label:"CAD"},{value:"SEK",label:"SEK"},{value:"SGD",label:"SGD"},{value:"AUD",label:"AUD"},{value:"JPY",label:"JPY"},{value:"EUR",label:"Euro"},{value:"GBP",label:"GBP"},{value:"QAR",label:"QAR"},{value:"SAR",label:"SAR"},{value:"OMR",label:"OMR"}],Va=()=>new Date().toISOString().slice(0,10),Ht=(a,s)=>{const l=new Date(a||Va());return l.setDate(l.getDate()+s),l.toISOString().slice(0,10)},na=()=>{const a=Va();return{selectedAccountId:"",selectedAccountLabel:"",clientAccountNumber:"",companyName:"",contactPerson:"",address:"",email:"",phone:"",accountOwner:"",quoteNumber:"",quotationDate:a,totalAmount:"",amountCurrency:"INR",totalProductTax:"",taxCurrency:"INR",quotationStatus:"",validUntilDate:Ht(a,30),quoteFile:null,quoteFileName:""}},Se=[{key:"num",label:"Quotation No.",exportValue:a=>a.num},{key:"owner",label:"Quotation Owner",exportValue:a=>a.owner},{key:"date",label:"Quotation Date",exportValue:a=>a.date},{key:"company",label:"Company Name",exportValue:a=>a.company},{key:"amount",label:"Amount",exportValue:a=>a.amountLabel},{key:"status",label:"Status",exportValue:a=>a.statusLabel},{key:"project",label:"Project Name",exportValue:a=>a.project}],za=[{key:"num",label:"Quotation No.",type:"text",width:18},{key:"owner",label:"Quotation Owner",type:"text",width:22},{key:"date",label:"Quotation Date",type:"date",align:"center",width:18},{key:"company",label:"Company Name",type:"text",width:28},{key:"status",label:"Status",type:"text",width:16},{key:"project",label:"Project Name",type:"text",width:28}],Ue=["num","owner","date","company","amount","status","project"],Ra=()=>{try{const a=window.localStorage.getItem(ia),s=a?JSON.parse(a):null;return{selectedFields:Array.isArray(s==null?void 0:s.selectedFields)&&s.selectedFields.length>0?s.selectedFields.filter(o=>Se.some(r=>r.key===o)):Ue}}catch{return{selectedFields:Ue}}},oa=(a={})=>{const s=Array.isArray(a==null?void 0:a.selectedFields)&&a.selectedFields.length>0?a.selectedFields.filter(l=>Se.some(o=>o.key===l)):Ue;return{selectedFields:s.length>0?s:Ue}},T={brandKey:"swati",organizationName:"Swati Switchgears India Pvt Ltd",organizationLegalName:"Swati Switchgears (India) Pvt. Ltd.",organizationAddress:"36 Shubhlaxmi Industrial Estate, Sarkhej Bavla Road, Changodar, Ahmedabad - 382210",organizationAddressLines:["36 Shubhlaxmi Industrial Estate,","Sarkhej Bavla Road, Changodar,","Ahmedabad - 382210"],organizationEmail:"mkt@swatiswitchgears.com",organizationPhone:"9913536307",organizationGstin:"24AAACZ0615P1Z7",organizationStateCode:"24",website:"www.swatiswitchgears.com",organizationTagline:"",logoType:"image"},ca={brandKey:"lumos",organizationName:"Lumos Building Automation Pvt Ltd",organizationLegalName:"Lumos Building Automation Pvt. Ltd.",organizationAddress:"Vadodara, Gujarat, India",organizationEmail:"sales@lumosbuildingautomation.com",organizationPhone:"+91 265 4000 222",organizationGstin:"24AAECL9020K1ZY",organizationStateCode:"24",website:"www.lumosbuildingautomation.com",organizationTagline:"Building automation, controls and smart infrastructure solutions.",logoType:"image"},ka={swati:T,"swati-switch":T,"swati-switch-gear":T,lumos:ca,"lumos-building":ca},ma=[{key:"pdf",label:"View As PDF",icon:St,iconClass:"aqp-action-icon--pdf"},{key:"preview",label:"Preview",icon:Ta},{key:"view",label:"View Quote",icon:Ta},{key:"approve",label:"Approve Quote",icon:_t},{key:"reject",label:"Reject Quote",icon:De},{key:"clone",label:"Clone Quote",icon:Ct},{key:"account",label:"View Account",icon:At}],v=a=>String(a||"").trim().toLowerCase(),Ua=a=>String(a||"").split(/\r?\n|,/).map(s=>s.trim()).filter(Boolean),Jt=(a={})=>[a.address,a.location,a.state].filter(Boolean).join(", "),es=(a="")=>{const s=String(a||"").split(".");return s.length>1?v(s.pop()):""},Ma=a=>{if(!a)return"Quote File is required.";const s=es(a.name);return Xt.includes(s)?a.size>Zt?"Quote File size must be 5 MB or less.":"":"Only PDF, XLS and XLSX files are allowed."},Ve=(a={})=>{const s=v(a.profileKey);if(s&&ka[s])return ka[s];const l=v(a.profileName||a.organizationName);return l.includes("swati")?T:l.includes("lumos")?ca:{}},as=(a={})=>Ve(a).brandKey==="swati",ts=(a={})=>Ve(a).brandKey==="lumos",ha=a=>a==="lumos"?Kt:a==="swati"?Da:null,Ba=a=>a==="lumos"?"lumos":a==="swati"?"swati":"",ss=(a={})=>{const s=Ve(a);return s.logoType?s.logoType==="image":v(a.profileName||a.organizationName).includes("swati")},Ga=a=>{if(!a)return"-";const s=new Date(a);if(Number.isNaN(s.getTime()))return String(a);const l=String(s.getDate()).padStart(2,"0"),o=String(s.getMonth()+1).padStart(2,"0"),r=s.getFullYear();return`${l}-${o}-${r}`},la=a=>{if(!a)return"-";const s=new Date(a);return Number.isNaN(s.getTime())?String(a):new Intl.DateTimeFormat("en-GB",{day:"2-digit",month:"short",year:"numeric"}).format(s)},A=a=>{const s=Number.parseFloat(a);return Number.isFinite(s)?s:0},p=a=>String(a||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;"),xa=a=>{const s=v(a).replace(/[\s-]+/g,"_");return s?s==="accepted"?"approved":s==="new"?"draft":s:"draft"},_e=a=>{const s=xa(a),l={draft:"Draft",sent:"Sent",approved:"Approved",rejected:"Rejected",cancelled:"Cancelled",open:"Open"};return l[s]?l[s]:s.split("_").map(o=>o.charAt(0).toUpperCase()+o.slice(1)).join(" ")},Wa=a=>{const s=xa(a);return s==="approved"?"aqp-status--approved":s==="rejected"?"aqp-status--rejected":s==="sent"?"aqp-status--sent":"aqp-status--open"},ke=a=>{const s=xa(a);return s==="approved"||s==="cancelled"?"aqp-num-badge--orange":"aqp-num-badge--teal"},ns=(a={})=>[a==null?void 0:a.name,a==null?void 0:a.username,a==null?void 0:a.email].map(s=>v(s)).filter(Boolean),os=(a,s)=>{var y,N,E,f,O;const l=v(a==null?void 0:a.role);if(l==="admin"||l==="super_admin")return ma.map(F=>F.key);const r=[s==null?void 0:s.owner,(y=s==null?void 0:s.raw)==null?void 0:y.selectedAccountOwner,(N=s==null?void 0:s.raw)==null?void 0:N.ownerName,(E=s==null?void 0:s.raw)==null?void 0:E.createdBy].map(F=>v(F)),c=ns(a),x=r.some(F=>F&&c.includes(F)),m=!!((f=a==null?void 0:a.permissions)!=null&&f.approveQuotes||(O=a==null?void 0:a.permissions)!=null&&O.approveQuotation);if(l==="viewer"||!x&&!m)return["pdf","preview","view"];const j=["pdf","preview","view","clone"];return m&&j.push("approve","reject"),j},da=(a,s)=>{const l=new Set(os(a,s));return ma.filter(o=>l.has(o.key))},pa=(a,s)=>{const o=Math.max(1,a-Math.floor(2.5)),r=Math.min(s,o+5-1),c=Math.max(1,r-5+1);return Array.from({length:r-c+1},(x,m)=>c+m)},C=a=>a||"-",ls=(...a)=>a.map(s=>String(s||"").trim()).filter(Boolean).join(", "),Ka=(a={})=>{const l=(Array.isArray(a.lineItems)?a.lineItems:[]).filter(r=>String((r==null?void 0:r.description)||"").trim()).map((r,c)=>{const x=A(r.quantity||0),m=A(r.rate||0),j=Number.isFinite(Number(r.amount))?Number(r.amount):x*m;return{id:r.id||`line-${c+1}`,srNo:c+1,description:r.description,quantity:x,unit:r.unit||"Nos",rate:m,amount:j}});if(l.length>0)return l;const o=[a.product,a.otherProduct,a.otherService,a.projectName].filter(Boolean).join(" / ");return!o&&!A(a.amount)?[]:[{id:a.id||"line-1",srNo:1,description:o||a.companyName||"Quotation Item",quantity:1,unit:"Nos",rate:A(a.amount),amount:A(a.amount)}]},Za=a=>{const s=["","One","Two","Three","Four","Five","Six","Seven","Eight","Nine"],l=["Ten","Eleven","Twelve","Thirteen","Fourteen","Fifteen","Sixteen","Seventeen","Eighteen","Nineteen"],o=["","","Twenty","Thirty","Forty","Fifty","Sixty","Seventy","Eighty","Ninety"];return a===0?"":a<10?s[a]:a<20?l[a-10]:a<100?`${o[Math.floor(a/10)]}${a%10?` ${s[a%10]}`:""}`:`${s[Math.floor(a/100)]} Hundred${a%100?` ${Za(a%100)}`:""}`},rs=a=>{const s=Math.floor(Math.abs(A(a)));if(!s)return"Zero";const l=[{divisor:1e7,label:"Crore"},{divisor:1e5,label:"Lakh"},{divisor:1e3,label:"Thousand"},{divisor:1,label:""}];let o=s;const r=[];return l.forEach(({divisor:c,label:x})=>{if(o>=c){const m=Math.floor(o/c);o%=c,m>0&&(r.push(Za(m)),x&&r.push(x))}}),r.join(" ").trim()},Xa=(a,s)=>{if(!a)return null;const l=s.find(c=>String(c.id)===String(a.selectedAccountId||""));if(l)return l;const o=v(a.clientAccountNumber);if(o){const c=s.find(x=>v(x.accountNumber)===o);if(c)return c}const r=v(a.companyName);if(r){const c=s.find(x=>v(x.name)===r);if(c)return c}return null},we=(a,s)=>{var $,Q,xe;const l=Ve(a),o=l.brandKey?l:T,r=as(a)||!l.brandKey,c=ts(a),x=!!l.brandKey,m=o.brandKey||(r?"swati":c?"lumos":"swati"),j=ha(m),y=Ka(a),N=y.reduce((be,Be)=>be+A(Be.amount),0),E=A(a.cgstAmount||a.cgst||0),f=A(a.sgstAmount||a.sgst||0),O=A(a.igstAmount||a.igst||0),F=A(a.taxAmount||0),Ce=A(a.amount),H=N+E+f+O+F,D=Ce>0?Math.max(Ce,H):H,ue=a.logoType||l.logoType||(ss(a)?"image":"text"),J=a.clientAddressDetails||ls(s==null?void 0:s.address,s==null?void 0:s.location,s==null?void 0:s.state)||"-",L=x?o.organizationName:a.organizationName||o.organizationName||a.profileName||T.organizationName,V=x?o.organizationLegalName||L:a.organizationLegalName||o.organizationLegalName||L,me=x?o.organizationAddress||"":a.organizationAddress||o.organizationAddress||T.organizationAddress,Ae=o.organizationAddressLines||Ua(me),ee=x?o.organizationEmail||"":a.organizationEmail||o.organizationEmail||T.organizationEmail,Pe=x?o.organizationPhone||"":a.organizationPhone||o.organizationPhone||T.organizationPhone,he=x?o.organizationGstin||"":a.organizationGstin||o.organizationGstin||T.organizationGstin,Te=x?o.organizationStateCode||"":a.organizationStateCode||o.organizationStateCode||T.organizationStateCode;return{id:a.id,quotationNumber:a.quotationNumber||"-",quotationDate:la(a.quotationDate||a.createdAt),validUntil:la(a.validUntil),currency:a.currency||o.currency||"INR",statusLabel:_e(a.status),profileName:a.profileName||"-",brandKey:m,brandClassName:Ba(m),logoSource:j,isSwatiDocument:r,isLumosDocument:c,organizationName:L,organizationLegalName:V,organizationAddress:me,organizationAddressLines:Ae,organizationEmail:ee,organizationPhone:Pe,organizationGstin:he,organizationStateCode:Te,website:x?o.website||"":a.website||o.website||T.website,organizationTagline:a.organizationTagline||o.organizationTagline||"",logoType:ue,companyName:a.companyName||(s==null?void 0:s.name)||"-",clientAccountNumber:a.clientAccountNumber||(s==null?void 0:s.accountNumber)||"-",contactPerson:a.contactPerson||(s==null?void 0:s.contactPerson)||"-",telephone:a.telephone||(s==null?void 0:s.phone)||(s==null?void 0:s.contactPhone)||"-",email:a.email||(s==null?void 0:s.email)||(s==null?void 0:s.contactEmail)||"-",gstin:a.gstin||(s==null?void 0:s.gstin)||"-",stateCode:a.stateCode||(s==null?void 0:s.stateCode)||"-",accountOwner:(s==null?void 0:s.accountOwnerDisplay)||a.selectedAccountOwner||(s==null?void 0:s.accountOwner)||"-",customerReferenceNumber:(($=a.customerReference)==null?void 0:$.number)||"-",customerReferenceDate:la((Q=a.customerReference)==null?void 0:Q.date),customerReferenceSubject:((xe=a.customerReference)==null?void 0:xe.subject)||"-",quotationSubject:a.quotationSubject||"-",projectName:a.projectName||"-",clientAddressDetails:J,clientAddressLines:Ua(J==="-"?"":J),product:a.product||"-",otherProduct:a.otherProduct||"-",otherService:a.otherService||"-",deliveryTerms:a.deliveryTerms||"-",paymentTerms:a.paymentTerms||"-",warrantyTerms:a.warrantyTerms||"-",quotationNotes:a.quotationNotes||"-",rejectionReason:a.rejectionReason||"",lineItems:y,subtotal:N,cgst:E,sgst:f,igst:O,otherTax:F,total:D,amountInWords:`${rs(D)} ${a.currency==="USD"?"US Dollars":a.currency==="EUR"?"Euros":"Rupees"} Only`}},is=[{key:"srNo",label:"Sr No",type:"integer",align:"center",width:8},{key:"description",label:"Description",align:"left",width:48,wrap:!0},{key:"quantity",label:"Qty",type:"number",align:"right",width:10},{key:"unit",label:"Unit",align:"center",width:10},{key:"rate",label:"Rate",type:"currency",align:"right",width:16},{key:"amount",label:"Amount",type:"currency",align:"right",width:18}],Ya=a=>{if(!a)return null;const s=m=>{const j=String(m??"").trim();return j&&j!=="-"?j:""},l=[{label:"Quotation No.",value:s(a.quotationNumber)},{label:"Quotation Date",value:s(a.quotationDate)},{label:"Valid Until",value:s(a.validUntil)},{label:"Status",value:s(a.statusLabel)},{label:"Currency",value:s(a.currency)},{label:"Profile",value:s(a.profileName)},{label:"Customer",value:s(a.companyName)},{label:"Account No.",value:s(a.clientAccountNumber)},{label:"Contact Person",value:s(a.contactPerson)},{label:"Telephone",value:s(a.telephone)},{label:"Email",value:s(a.email)},{label:"GSTIN",value:s(a.gstin)},{label:"State Code",value:s(a.stateCode)},{label:"Account Owner",value:s(a.accountOwner)},{label:"Customer Address",value:s(a.clientAddressDetails)},{label:"Project Name",value:s(a.projectName)},{label:"Quotation Subject",value:s(a.quotationSubject)},{label:"Inquiry Ref No",value:s(a.customerReferenceNumber)},{label:"Inquiry Ref Date",value:s(a.customerReferenceDate)},{label:"Inquiry Subject",value:s(a.customerReferenceSubject)},{label:"Delivery Terms",value:s(a.deliveryTerms)},{label:"Payment Terms",value:s(a.paymentTerms)},{label:"Warranty Terms",value:s(a.warrantyTerms)},{label:"Quotation Notes",value:s(a.quotationNotes)}].filter(m=>m.value);a.rejectionReason&&l.push({label:"Rejection Reason",value:a.rejectionReason});const o=(a.lineItems||[]).map(m=>({srNo:m.srNo,description:m.description,quantity:m.quantity,unit:m.unit,rate:m.rate,amount:m.amount})),r=[],c=(m,j)=>{!Number.isFinite(Number(j))||Number(j)===0||r.push({srNo:"",description:m,quantity:"",unit:"",rate:"",amount:Number(j)})};c("Subtotal",a.subtotal),c("CGST",a.cgst),c("SGST",a.sgst),c("IGST",a.igst),c("Other Tax",a.otherTax),c("Total",a.total),a.amountInWords&&r.push({srNo:"",description:`Amount in Words: ${a.amountInWords}`,quantity:"",unit:"",rate:"",amount:""});const x=[...o,...r];return{title:`Sales Quotation - ${s(a.quotationNumber)||"Draft"}`,subtitle:s(a.companyName)||s(a.organizationName),sheetName:"Quotation",companyName:a.organizationName,metadata:l,columns:is,rows:x}},Ha=a=>{const s=a.logoSource||ha(a.brandKey),l=a.brandClassName||Ba(a.brandKey),o=a.lineItems.map(c=>`
    <tr>
      <td class="text-center">${c.srNo}</td>
      <td class="description-cell">${p(c.description)}</td>
      <td class="text-center">${p(c.quantity)}</td>
      <td class="text-center">${p(c.unit)}</td>
      <td class="money">${p(w(c.rate,a.currency))}</td>
      <td class="money">${p(w(c.amount,a.currency))}</td>
    </tr>
  `).join(""),r=s?`<div class="logo-wrap logo-wrap--${p(l||"default")}"><img src="${s}" alt="${p(a.organizationName)}" class="logo logo--${p(l||"default")}" /></div>`:`<div class="logo-text">${p(a.organizationName)}</div>`;return`<!doctype html>
  <html>
    <head>
      <meta charset="utf-8" />
      <title>${p(a.quotationNumber)} - Sales Quotation</title>
      <style>
        * { box-sizing: border-box; }
        body { margin: 0; font-family: Arial, Helvetica, sans-serif; color: #1f2933; background: #ffffff; }
        .print-shell { padding: 14px; }
        .print-toolbar {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          width: 100%;
          max-width: 980px;
          margin: 0 auto 14px;
        }
        .print-toolbar button {
          padding: 10px 16px;
          border: 1px solid #1f6ea4;
          border-radius: 8px;
          background: linear-gradient(180deg, #3291d1 0%, #1f6ea4 100%);
          color: #ffffff;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
        }
        .print-toolbar button:last-child {
          border-color: #c7d6e2;
          background: #ffffff;
          color: #355163;
        }
        .quotation-print {
          width: 100%;
          max-width: 760px;
          margin: 0 auto;
          background: #ffffff;
          border: 1px solid #c9d5df;
        }
        .quotation-header {
          padding: 18px 16px 0;
          background: #ffffff;
        }
        .quotation-main {
          padding: 12px 16px 16px;
        }
        .quotation-footer {
          border-top: 1px solid #d5e0ea;
          padding: 12px 18px;
          text-align: center;
          font-size: 10.5px;
          line-height: 1.5;
          color: #52606d;
          background: #ffffff;
        }
        .brand-head {
          text-align: center;
          padding-bottom: 12px;
        }
        .logo-wrap {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 0;
          width: fit-content;
          max-width: 100%;
          margin: 0 auto 8px;
          padding: 0;
          border: none;
          background: transparent;
          box-shadow: none;
        }
        .logo {
          display: block;
          width: 54px;
          height: 54px;
          max-width: 100%;
          max-height: 54px;
          object-fit: contain;
          object-position: center;
          padding: 0;
          border: none;
          background: transparent;
          box-shadow: none;
          filter: none;
          opacity: 1;
        }
        .logo--swati {
          width: 54px;
          max-height: 54px;
        }
        .logo--lumos {
          width: 112px;
          height: 44px;
          max-height: 44px;
          background: transparent;
          border-radius: 0;
          padding: 0;
        }
        .logo-text {
          font-size: 18px;
          font-weight: 800;
          color: #164f7d;
          margin-bottom: 8px;
        }
        .company-name {
          margin: 0;
          font-size: 20px;
          line-height: 1.25;
          font-weight: 800;
          color: #102a43;
        }
        .company-contact {
          margin-top: 7px;
          font-size: 10px;
          line-height: 1.5;
          color: #52606d;
        }
        .party-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin-top: 10px;
        }
        .party-card {
          border: 1px solid #a9dfe3;
          border-radius: 10px;
          padding: 10px 12px;
          font-size: 10.5px;
          line-height: 1.42;
          background: #ffffff;
        }
        .section-label {
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          color: #1f6ea4;
          margin-bottom: 8px;
        }
        .field-row {
          display: grid;
          grid-template-columns: 92px minmax(0, 1fr);
          gap: 8px;
          margin-top: 5px;
        }
        .field-row strong {
          color: #243b53;
          font-weight: 700;
        }
        .field-row span {
          min-width: 0;
          overflow-wrap: anywhere;
        }
        h1 {
          margin: 0;
          padding: 12px 14px;
          text-align: center;
          font-size: 19px;
          line-height: 1.15;
          font-weight: 800;
          letter-spacing: 1px;
          border-top: 1px solid #d5e0ea;
          border-bottom: 1px solid #d5e0ea;
          color: #102a43;
        }
        h2, h3, p { margin: 0 0 6px; }
        .meta-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          border: 1px solid #cbd9e3;
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 12px;
        }
        .meta-cell {
          padding: 9px 10px;
          border-right: 1px solid #d5e0ea;
          background: #f4f8fb;
        }
        .meta-cell:last-child { border-right: none; }
        .meta-label {
          font-size: 8px;
          font-weight: 700;
          text-transform: uppercase;
          color: #627d98;
          margin-bottom: 6px;
          letter-spacing: 0.04em;
        }
        .meta-value {
          font-size: 10px;
          font-weight: 700;
          color: #102a43;
        }
        table { width: 100%; border-collapse: collapse; }
        thead { display: table-header-group; }
        tr { page-break-inside: avoid; }
        .items-table th,
        .items-table td {
          border: 1px solid #c9d5df;
          padding: 9px 8px;
          font-size: 10px;
          vertical-align: top;
        }
        .items-table th {
          background: #1f6ea4;
          color: #ffffff;
          font-size: 8.5px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          text-align: center;
        }
        .description-cell {
          overflow-wrap: anywhere;
          line-height: 1.45;
        }
        .text-center { text-align: center; }
        .money {
          text-align: right;
          white-space: nowrap;
        }
        .summary-layout {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 12px;
          align-items: stretch;
          margin-top: 10px;
        }
        .summary-card,
        .totals-card,
        .terms-card {
          border: 1px solid #a9dfe3;
          border-radius: 10px;
          padding: 10px 12px;
          background: #ffffff;
        }
        .summary-card,
        .totals-card { min-height: 158px; }
        .detail-row,
        .total-row {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          padding: 5px 0;
          border-bottom: 1px solid #edf2f7;
          font-size: 10px;
        }
        .detail-row:last-child,
        .total-row:last-child { border-bottom: none; }
        .detail-row strong,
        .total-row strong { color: #243b53; }
        .detail-row span,
        .total-row span {
          text-align: right;
          overflow-wrap: anywhere;
        }
        .totals-table td {
          padding: 7px 8px;
          border-bottom: 1px solid #d9e2ec;
          font-size: 11px;
        }
        .totals-table td:last-child { text-align: right; }
        .totals-table tr:last-child td { border-bottom: none; }
        .grand-total td {
          border-top: 2px solid #1f6ea4;
          font-weight: 700;
          background: #eff6ff;
        }
        .amount-words {
          margin-top: 12px;
          border: 1px solid #cbd9e3;
          border-radius: 4px;
          padding: 9px 10px;
          font-size: 10px;
          line-height: 1.5;
          background: #f4f8fb;
        }
        .amount-words strong {
          display: block;
          margin-bottom: 4px;
          color: #102a43;
        }
        .terms-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 10px;
          margin-top: 10px;
        }
        .terms-title {
          margin: 0 0 8px;
          font-size: 9px;
          text-transform: uppercase;
          color: #1f6ea4;
        }
        .terms-value {
          font-size: 10px;
          line-height: 1.5;
          white-space: pre-wrap;
          word-break: break-word;
        }
        @page {
          size: A4;
          margin: 10mm;
        }
        @media print {
          body { background: #ffffff; }
          .print-shell { padding: 0; }
          .print-toolbar { display: none; }
          .quotation-print { max-width: none; border: none; }
          .quotation-header { padding: 0 0 0; }
          .quotation-main { padding: 14px 0 16px; }
          .items-table thead { display: table-header-group; }
          tr, .party-card, .summary-card, .totals-card, .terms-card, .amount-words { page-break-inside: avoid; }
        }
        @media (max-width: 840px) {
          .print-shell { padding: 12px; }
          .party-grid,
          .meta-grid,
          .summary-layout,
          .terms-grid {
            grid-template-columns: 1fr;
          }
          .meta-cell { border-right: none; border-bottom: 1px solid #d5e0ea; }
          .meta-cell:last-child { border-bottom: none; }
        }
      </style>
    </head>
    <body>
      <div class="print-shell">
        <div class="print-toolbar">
          <button type="button" onclick="window.print()">Print / Save PDF</button>
          <button type="button" onclick="window.close()">Close</button>
        </div>
        <div class="quotation-print">
          <div class="quotation-header">
            <div class="brand-head">
              ${r}
              <h2 class="company-name">${p(a.organizationName)}</h2>
              <div class="company-contact">
                ${p(a.organizationAddress)}<br />
                Email: ${p(a.organizationEmail)} | Phone: ${p(a.organizationPhone)} | GSTIN: ${p(a.organizationGstin)}
              </div>
            </div>
            <div class="party-grid">
              <div class="party-card">
                <div class="section-label">Customer Details</div>
                <div class="field-row"><strong>Customer Name</strong><span>${p(a.companyName)}</span></div>
                <div class="field-row"><strong>Client Account No.</strong><span>${p(a.clientAccountNumber)}</span></div>
                <div class="field-row"><strong>Contact Person</strong><span>${p(a.contactPerson)}</span></div>
                <div class="field-row"><strong>Phone</strong><span>${p(a.telephone)}</span></div>
                <div class="field-row"><strong>Email</strong><span>${p(a.email)}</span></div>
                <div class="field-row"><strong>GSTIN</strong><span>${p(a.gstin)}</span></div>
                <div class="field-row"><strong>Address</strong><span>${p(a.clientAddressDetails)}</span></div>
              </div>
              <div class="party-card">
                <div class="section-label">Sales Details</div>
                <div class="field-row"><strong>Sales Executive</strong><span>${p(a.accountOwner)}</span></div>
                <div class="field-row"><strong>Mobile Number</strong><span>${p(a.organizationPhone)}</span></div>
                <div class="field-row"><strong>Email Address</strong><span>${p(a.organizationEmail)}</span></div>
                <div class="field-row"><strong>Quotation Reference</strong><span>${p(a.quotationNumber)}</span></div>
              </div>
            </div>
            <h1>SALES QUOTATION</h1>
          </div>
          <div class="quotation-main">
            <div class="meta-grid">
              <div class="meta-cell">
                <div class="meta-label">Quotation No.</div>
                <div class="meta-value">${p(a.quotationNumber)}</div>
              </div>
              <div class="meta-cell">
                <div class="meta-label">Quotation Date</div>
                <div class="meta-value">${p(a.quotationDate)}</div>
              </div>
              <div class="meta-cell">
                <div class="meta-label">Valid Until</div>
                <div class="meta-value">${p(a.validUntil)}</div>
              </div>
              <div class="meta-cell">
                <div class="meta-label">Currency</div>
                <div class="meta-value">${p(a.currency)}</div>
              </div>
            </div>
            <table class="items-table">
              <thead>
                <tr>
                  <th style="width:56px;">Sr.</th>
                  <th>Description</th>
                  <th style="width:80px;">Qty</th>
                  <th style="width:90px;">Unit</th>
                  <th style="width:120px;">Rate</th>
                  <th style="width:140px;">Amount</th>
                </tr>
              </thead>
              <tbody>
                ${o||'<tr><td colspan="6">No quotation items available.</td></tr>'}
              </tbody>
            </table>

            <div class="summary-layout">
              <div class="summary-card">
                <div class="section-label">Quotation Details</div>
                <div class="detail-row"><strong>Profile Name</strong><span>${p(a.profileName)}</span></div>
                <div class="detail-row"><strong>Project</strong><span>${p(a.projectName)}</span></div>
                <div class="detail-row"><strong>Account Owner</strong><span>${p(a.accountOwner)}</span></div>
                <div class="detail-row"><strong>Subject</strong><span>${p(a.quotationSubject)}</span></div>
                <div class="detail-row"><strong>Product</strong><span>${p([a.product,a.otherProduct].filter(c=>c&&c!=="-").join(" / ")||"-")}</span></div>
                <div class="detail-row"><strong>Service</strong><span>${p(a.otherService)}</span></div>
              </div>
              <div class="totals-card">
                <div class="section-label">Amount Summary</div>
                <div class="total-row"><strong>Sub Total</strong><span>${p(w(a.subtotal,a.currency))}</span></div>
                <div class="total-row"><strong>CGST</strong><span>${p(w(a.cgst,a.currency))}</span></div>
                <div class="total-row"><strong>SGST</strong><span>${p(w(a.sgst,a.currency))}</span></div>
                <div class="total-row"><strong>IGST</strong><span>${p(w(a.igst,a.currency))}</span></div>
                <div class="total-row"><strong>Other Tax</strong><span>${p(w(a.otherTax,a.currency))}</span></div>
                <div class="total-row grand-total"><strong>Total Amount</strong><span>${p(w(a.total,a.currency))}</span></div>
              </div>
            </div>

            <div class="amount-words"><strong>Amount in Words</strong>${p(a.amountInWords)}</div>

            <div class="terms-grid">
              <div class="terms-card">
                <h3 class="terms-title">Inquiry Reference</h3>
                <div class="terms-value">Number: ${p(a.customerReferenceNumber)}&#10;Date: ${p(a.customerReferenceDate)}&#10;Subject: ${p(a.customerReferenceSubject)}</div>
              </div>
              <div class="terms-card">
                <h3 class="terms-title">Terms &amp; Conditions</h3>
                <div class="terms-value">Delivery: ${p(a.deliveryTerms)}&#10;Payment: ${p(a.paymentTerms)}&#10;Warranty: ${p(a.warrantyTerms)}</div>
              </div>
              <div class="terms-card">
                <h3 class="terms-title">Quotation Notes</h3>
                <div class="terms-value">${p(a.quotationNotes)}</div>
              </div>
              <div class="terms-card">
                <h3 class="terms-title">Status</h3>
                <div class="terms-value">Status: ${p(a.statusLabel)}${a.rejectionReason?`&#10;Reason: ${p(a.rejectionReason)}`:""}</div>
              </div>
            </div>
          </div>
          <div class="quotation-footer">
            <strong>${p(a.organizationName)}</strong><br />
            Website: ${p(a.website||T.website)} | Email: ${p(a.organizationEmail)} | Phone: ${p(a.organizationPhone)}
          </div>
        </div>
      </div>
    </body>
  </html>`},pe=a=>{if(!a)return;const s=document.title,l=`Quotation-${(a==null?void 0:a.quotationNumber)||"Document"}.pdf`,o=document.createElement("iframe");let r=null;o.title=l,o.setAttribute("aria-hidden","true"),o.style.position="fixed",o.style.left="-10000px",o.style.top="0",o.style.width="1024px",o.style.height="768px",o.style.border="0",o.style.opacity="0";const c=()=>{r&&window.clearTimeout(r),document.title=s,window.removeEventListener("afterprint",c),o.parentNode&&o.parentNode.removeChild(o)},x=()=>{const m=o.contentDocument;if(!m)return Promise.resolve();const j=Array.from(m.images||[]);return Promise.all(j.map(y=>y.complete?Promise.resolve():new Promise(N=>{y.onload=N,y.onerror=N})))};o.onload=()=>{x().then(()=>{const m=o.contentWindow;if(!m){c();return}document.title=l,window.addEventListener("afterprint",c),r=window.setTimeout(c,2500),m.focus(),m.print()})},document.title=l,document.body.appendChild(o),o.srcdoc=Ha(a)};function ua({status:a}){return e.jsx("span",{className:`aqp-status ${Wa(a)}`,children:_e(a)})}function M({title:a,onClose:s,size:l="",children:o,footer:r}){return u.useEffect(()=>{const c=x=>{x.key==="Escape"&&s()};return document.addEventListener("keydown",c),()=>document.removeEventListener("keydown",c)},[s]),e.jsx("div",{className:"aqp-overlay",role:"presentation",onClick:s,children:e.jsxs("div",{className:`aqp-modal ${l}`.trim(),role:"dialog","aria-modal":"true",onClick:c=>c.stopPropagation(),children:[e.jsxs("div",{className:"aqp-modal-header",children:[e.jsx("span",{className:"aqp-modal-title",children:a}),e.jsx("button",{type:"button",className:"aqp-modal-close",onClick:s,"aria-label":"Close",children:e.jsx(De,{})})]}),e.jsx("div",{className:"aqp-modal-body",children:o}),r?e.jsx("div",{className:"aqp-modal-footer",children:r}):null]})})}function Me({documentData:a}){const s=a.logoSource||ha(a.brandKey),l=a.isLumosDocument?"lumos":a.isSwatiDocument?"swati":"default",o=[a.product,a.otherProduct].filter(r=>r&&r!=="-").join(" / ")||"-";return e.jsx("div",{className:"aqp-doc aqp-print-scope",children:e.jsxs("div",{className:"aqp-doc__frame",children:[e.jsxs("div",{className:"aqp-doc__brand-head",children:[e.jsx("div",{className:`aqp-doc__logo-wrap aqp-doc__logo-wrap--${l}`,children:s?e.jsx("img",{src:s,alt:a.organizationName,className:`aqp-doc__brand-logo aqp-doc__brand-logo--${l}`}):e.jsx("div",{className:"aqp-doc__text-logo",children:a.organizationName})}),e.jsx("h2",{children:a.organizationName}),e.jsxs("p",{children:[a.organizationAddress,e.jsx("br",{}),"Email: ",a.organizationEmail," | Phone: ",a.organizationPhone," | GSTIN: ",a.organizationGstin]})]}),e.jsxs("div",{className:"aqp-doc__party-grid",children:[e.jsxs("section",{className:"aqp-doc__party-card",children:[e.jsx("div",{className:"aqp-doc__eyebrow",children:"Customer Details"}),e.jsxs("div",{className:"aqp-doc__field-row",children:[e.jsx("strong",{children:"Customer Name"}),e.jsx("span",{children:a.companyName})]}),e.jsxs("div",{className:"aqp-doc__field-row",children:[e.jsx("strong",{children:"Client Account No."}),e.jsx("span",{children:a.clientAccountNumber})]}),e.jsxs("div",{className:"aqp-doc__field-row",children:[e.jsx("strong",{children:"Contact Person"}),e.jsx("span",{children:a.contactPerson})]}),e.jsxs("div",{className:"aqp-doc__field-row",children:[e.jsx("strong",{children:"Phone"}),e.jsx("span",{children:a.telephone})]}),e.jsxs("div",{className:"aqp-doc__field-row",children:[e.jsx("strong",{children:"Email"}),e.jsx("span",{children:a.email})]}),e.jsxs("div",{className:"aqp-doc__field-row",children:[e.jsx("strong",{children:"GSTIN"}),e.jsx("span",{children:a.gstin})]}),e.jsxs("div",{className:"aqp-doc__field-row",children:[e.jsx("strong",{children:"Address"}),e.jsx("span",{children:a.clientAddressDetails})]})]}),e.jsxs("section",{className:"aqp-doc__party-card",children:[e.jsx("div",{className:"aqp-doc__eyebrow",children:"Sales Details"}),e.jsxs("div",{className:"aqp-doc__field-row",children:[e.jsx("strong",{children:"Sales Executive"}),e.jsx("span",{children:a.accountOwner})]}),e.jsxs("div",{className:"aqp-doc__field-row",children:[e.jsx("strong",{children:"Mobile Number"}),e.jsx("span",{children:a.organizationPhone})]}),e.jsxs("div",{className:"aqp-doc__field-row",children:[e.jsx("strong",{children:"Email Address"}),e.jsx("span",{children:a.organizationEmail})]}),e.jsxs("div",{className:"aqp-doc__field-row",children:[e.jsx("strong",{children:"Quotation Reference"}),e.jsx("span",{children:a.quotationNumber})]})]})]}),e.jsx("div",{className:"aqp-doc__title",children:"SALES QUOTATION"}),e.jsxs("div",{className:"aqp-doc__meta",children:[e.jsxs("div",{className:"aqp-doc__meta-cell",children:[e.jsx("span",{className:"aqp-doc__meta-label",children:"Quotation No."}),e.jsx("strong",{children:a.quotationNumber})]}),e.jsxs("div",{className:"aqp-doc__meta-cell",children:[e.jsx("span",{className:"aqp-doc__meta-label",children:"Quotation Date"}),e.jsx("strong",{children:a.quotationDate})]}),e.jsxs("div",{className:"aqp-doc__meta-cell",children:[e.jsx("span",{className:"aqp-doc__meta-label",children:"Valid Until"}),e.jsx("strong",{children:a.validUntil})]}),e.jsxs("div",{className:"aqp-doc__meta-cell",children:[e.jsx("span",{className:"aqp-doc__meta-label",children:"Currency"}),e.jsx("strong",{children:a.currency})]})]}),e.jsxs("table",{className:"aqp-doc__table",children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{style:{width:"56px"},children:"Sr."}),e.jsx("th",{children:"Description"}),e.jsx("th",{style:{width:"80px"},children:"Qty"}),e.jsx("th",{style:{width:"88px"},children:"Unit"}),e.jsx("th",{style:{width:"120px"},children:"Rate"}),e.jsx("th",{style:{width:"140px"},children:"Amount"})]})}),e.jsx("tbody",{children:a.lineItems.length===0?e.jsx("tr",{children:e.jsx("td",{colSpan:6,children:"No quotation items available."})}):a.lineItems.map(r=>e.jsxs("tr",{children:[e.jsx("td",{className:"aqp-doc__num",children:r.srNo}),e.jsx("td",{className:"aqp-doc__description",children:r.description}),e.jsx("td",{className:"aqp-doc__num",children:r.quantity}),e.jsx("td",{className:"aqp-doc__num",children:r.unit}),e.jsx("td",{className:"aqp-doc__amount",children:w(r.rate,a.currency)}),e.jsx("td",{className:"aqp-doc__amount",children:w(r.amount,a.currency)})]},r.id))})]}),e.jsxs("div",{className:"aqp-doc__summary",children:[e.jsxs("div",{className:"aqp-doc__summary-card",children:[e.jsx("div",{className:"aqp-doc__eyebrow",children:"Quotation Details"}),e.jsxs("div",{className:"aqp-doc__kv-row",children:[e.jsx("strong",{children:"Profile Name"}),e.jsx("span",{children:a.profileName})]}),e.jsxs("div",{className:"aqp-doc__kv-row",children:[e.jsx("strong",{children:"Project"}),e.jsx("span",{children:a.projectName})]}),e.jsxs("div",{className:"aqp-doc__kv-row",children:[e.jsx("strong",{children:"Account Owner"}),e.jsx("span",{children:a.accountOwner})]}),e.jsxs("div",{className:"aqp-doc__kv-row",children:[e.jsx("strong",{children:"Subject"}),e.jsx("span",{children:a.quotationSubject})]}),e.jsxs("div",{className:"aqp-doc__kv-row",children:[e.jsx("strong",{children:"Product"}),e.jsx("span",{children:o})]}),e.jsxs("div",{className:"aqp-doc__kv-row",children:[e.jsx("strong",{children:"Service"}),e.jsx("span",{children:a.otherService})]})]}),e.jsxs("div",{className:"aqp-doc__totals",children:[e.jsx("div",{className:"aqp-doc__eyebrow",children:"Amount Summary"}),e.jsxs("div",{className:"aqp-doc__kv-row",children:[e.jsx("strong",{children:"Sub Total"}),e.jsx("span",{children:w(a.subtotal,a.currency)})]}),e.jsxs("div",{className:"aqp-doc__kv-row",children:[e.jsx("strong",{children:"CGST"}),e.jsx("span",{children:w(a.cgst,a.currency)})]}),e.jsxs("div",{className:"aqp-doc__kv-row",children:[e.jsx("strong",{children:"SGST"}),e.jsx("span",{children:w(a.sgst,a.currency)})]}),e.jsxs("div",{className:"aqp-doc__kv-row",children:[e.jsx("strong",{children:"IGST"}),e.jsx("span",{children:w(a.igst,a.currency)})]}),e.jsxs("div",{className:"aqp-doc__kv-row",children:[e.jsx("strong",{children:"Other Tax"}),e.jsx("span",{children:w(a.otherTax,a.currency)})]}),e.jsxs("div",{className:"aqp-doc__kv-row aqp-doc__grand-total",children:[e.jsx("strong",{children:"Total Amount"}),e.jsx("span",{children:w(a.total,a.currency)})]})]})]}),e.jsxs("div",{className:"aqp-doc__amount-words",children:[e.jsx("strong",{children:"Amount in Words"}),e.jsx("span",{children:a.amountInWords})]}),e.jsxs("div",{className:"aqp-doc__terms",children:[e.jsxs("section",{className:"aqp-doc__terms-card",children:[e.jsx("h4",{children:"Inquiry Reference"}),e.jsxs("p",{children:[e.jsx("strong",{children:"Number:"})," ",a.customerReferenceNumber]}),e.jsxs("p",{children:[e.jsx("strong",{children:"Date:"})," ",a.customerReferenceDate]}),e.jsxs("p",{children:[e.jsx("strong",{children:"Subject:"})," ",a.customerReferenceSubject]})]}),e.jsxs("section",{className:"aqp-doc__terms-card",children:[e.jsx("h4",{children:"Terms & Conditions"}),e.jsxs("p",{children:[e.jsx("strong",{children:"Delivery:"})," ",a.deliveryTerms]}),e.jsxs("p",{children:[e.jsx("strong",{children:"Payment:"})," ",a.paymentTerms]}),e.jsxs("p",{children:[e.jsx("strong",{children:"Warranty:"})," ",a.warrantyTerms]})]}),e.jsxs("section",{className:"aqp-doc__terms-card",children:[e.jsx("h4",{children:"Quotation Notes"}),e.jsx("p",{children:a.quotationNotes})]}),e.jsxs("section",{className:"aqp-doc__terms-card",children:[e.jsx("h4",{children:"Status"}),e.jsxs("p",{children:[e.jsx("strong",{children:"Status:"})," ",a.statusLabel]}),a.rejectionReason?e.jsxs("p",{children:[e.jsx("strong",{children:"Reason:"})," ",a.rejectionReason]}):null]})]}),e.jsxs("div",{className:"aqp-doc__footer",children:[e.jsx("strong",{children:a.organizationName}),e.jsx("br",{}),"Website: ",a.website||T.website," | Email: ",a.organizationEmail," | Phone: ",a.organizationPhone]})]})})}function Ja({documentData:a,title:s,subtitle:l,onBack:o,onPrint:r,onDownload:c}){const[x,m]=u.useState(100),[j,y]=u.useState(!1);u.useEffect(()=>{m(100)},[a]),u.useEffect(()=>{if(!j)return;const f=()=>y(!1);return window.addEventListener("click",f),()=>window.removeEventListener("click",f)},[j]);const N=s||`QUOTATION - ${(a==null?void 0:a.quotationNumber)||"-"}`,E=l||(a==null?void 0:a.companyName)||"-";return e.jsxs("div",{className:"aqp-page aqp-page--pdf",children:[e.jsxs("div",{className:"aqp-pdf-toolbar",children:[e.jsxs("div",{className:"aqp-pdf-toolbar-copy",children:[e.jsx("h1",{children:N}),e.jsx("p",{children:E})]}),e.jsxs("div",{className:"aqp-pdf-toolbar-actions",children:[e.jsx("button",{type:"button",className:"aqp-btn aqp-btn--gray",onClick:o,children:"Back"}),e.jsx("button",{type:"button",className:"aqp-pdf-close-btn",onClick:o,"aria-label":"Close quotation PDF",children:e.jsx(De,{})}),e.jsx("div",{className:"aqp-pdf-toolbar-status",children:e.jsx("span",{children:"PDF View"})}),e.jsxs("div",{className:"aqp-pdf-toolbar-zoom",children:[e.jsx("button",{type:"button",className:"aqp-pdf-icon-btn",onClick:()=>m(f=>Math.max(70,f-10)),"aria-label":"Zoom out",children:e.jsx(Pt,{})}),e.jsxs("span",{className:"aqp-pdf-zoom-value",children:[x,"%"]}),e.jsx("button",{type:"button",className:"aqp-pdf-icon-btn",onClick:()=>m(f=>Math.min(160,f+10)),"aria-label":"Zoom in",children:e.jsx(Tt,{})})]}),e.jsxs("button",{type:"button",className:"aqp-pdf-action-btn",onClick:r,"aria-label":"Print quotation",children:[e.jsx(ra,{}),"Print"]}),e.jsxs("button",{type:"button",className:"aqp-pdf-action-btn",onClick:()=>{if(typeof c=="function"){c();return}pe(a)},"aria-label":"Download quotation PDF",children:[e.jsx(Ft,{}),"Download PDF"]}),e.jsxs("div",{className:"aqp-pdf-more",children:[e.jsx("button",{type:"button",className:`aqp-pdf-icon-btn${j?" aqp-pdf-icon-btn--active":""}`,"aria-label":"More options",onClick:f=>{f.stopPropagation(),y(O=>!O)},"aria-expanded":j,"aria-haspopup":"menu",children:e.jsx(It,{})}),j?e.jsxs("div",{className:"aqp-action-menu aqp-action-menu--viewer",onClick:f=>f.stopPropagation(),children:[e.jsx("button",{type:"button",className:"aqp-action-item",onClick:()=>{m(100),y(!1)},children:"Reset Zoom"}),e.jsx("button",{type:"button",className:"aqp-action-item",onClick:()=>{m(90),y(!1)},children:"Fit Document"}),e.jsx("button",{type:"button",className:"aqp-action-item",onClick:()=>{r(),y(!1)},children:"Print / Save PDF"})]}):null]})]})]}),e.jsx("div",{className:"aqp-pdf-workspace",children:e.jsx("div",{className:"aqp-pdf-stage",children:e.jsx("div",{className:"aqp-pdf-canvas",children:e.jsx("div",{className:"aqp-pdf-zoom-surface",style:{zoom:x/100},children:e.jsx(Me,{documentData:a})})})})})]})}const cs=({allowUsers:a=!1,generatorPath:s="/admin/quotations"})=>{const l=Et(),{user:o}=Ot(),{quotations:r,quotationsLoading:c,quotationsError:x,accounts:m,createQuotation:j,updateQuotation:y,addNotification:N}=$t(),E=a||o&&(o.role==="admin"||o.role==="super_admin");u.useEffect(()=>{E||l("/unauthorized",{replace:!0})},[E,l]);const[f,O]=u.useState("account"),[F,Ce]=u.useState(!0),[H,D]=u.useState(!1),[ue,J]=u.useState(Ra),[L,V]=u.useState(Ra),[me,Ae]=u.useState(""),[ee,Pe]=u.useState(""),[he,Te]=u.useState(La),[$,Q]=u.useState(1),[xe,be]=u.useState(!1),[Be,ae]=u.useState(!1),[d,te]=u.useState(na),[q,k]=u.useState({}),[ba,z]=u.useState(""),[ge,ga]=u.useState(!1),[B,Ge]=u.useState(sa),[G,W]=u.useState(1),[se,Fe]=u.useState(null),[We,fa]=u.useState(null),[_,Ie]=u.useState(null),[Ke,Ee]=u.useState(!1),[P,Ze]=u.useState(null),[K,Oe]=u.useState(null),[Z,$e]=u.useState(null),[ja,fe]=u.useState(""),[Le,ne]=u.useState(""),[X,Qe]=u.useState(""),[Na,et]=Lt(),je=Na.get("view")||"",oe=u.useMemo(()=>ue.selectedFields.map(t=>Se.find(n=>n.key===t)).filter(Boolean),[ue.selectedFields]),at=u.useMemo(()=>Se.filter(t=>!L.selectedFields.includes(t.key)),[L.selectedFields]),le=u.useMemo(()=>m.map((t,n)=>Qt(t,n,{recordSource:"admin-quotation-view"})).sort(zt),[m]),re=u.useMemo(()=>le.find(t=>String(t.id)===String(d.selectedAccountId||""))||null,[le,d.selectedAccountId]),Ne=u.useMemo(()=>le.filter(t=>Object.entries(B).every(([n,i])=>{const g=v(i);if(!g)return!0;const h=n==="accountOwner"?t.accountOwnerDisplay||t.accountOwner||"":t[n];return v(h).includes(g)})),[B,le]),ie=u.useMemo(()=>Math.max(1,Math.ceil(Ne.length/ta)),[Ne.length]),tt=u.useMemo(()=>pa(G,ie),[G,ie]),va=u.useMemo(()=>{const t=(G-1)*ta;return Ne.slice(t,t+ta)},[G,Ne]),ce=u.useMemo(()=>r.map((t,n)=>{const i=Xa(t,le),g=A(t.amount)||Ka(t).reduce((h,R)=>h+A(R.amount),0);return{id:t.id||`quotation-${n}`,num:t.quotationNumber||`Quotation ${n+1}`,owner:(i==null?void 0:i.accountOwnerDisplay)||t.selectedAccountOwner||(i==null?void 0:i.accountOwner)||"-",date:Ga(t.quotationDate||t.createdAt),dateSort:t.quotationDate||t.createdAt||"",company:t.companyName||(i==null?void 0:i.name)||t.clientName||"-",amount:g,amountLabel:w(g,t.currency||"INR"),status:t.status||"draft",statusLabel:_e(t.status),project:t.projectName||t.product||t.otherProduct||t.otherService||"-",profileName:t.profileName||"-",linkedAccount:i,raw:t}}).sort((t,n)=>new Date(n.dateSort||0).getTime()-new Date(t.dateSort||0).getTime()),[le,r]),U=u.useMemo(()=>ce.filter(t=>f!=="account"&&f!=="deal"?!1:Object.entries(he).every(([n,i])=>{const g=v(i);if(!g)return!0;const h=n==="amount"?`${t.amount} ${t.amountLabel}`:n==="status"?t.statusLabel:t[n];return v(h).includes(g)})),[f,he,ce]),de=u.useMemo(()=>Math.max(1,Math.ceil(U.length/aa)),[U.length]),st=u.useMemo(()=>pa($,de),[$,de]),ze=u.useMemo(()=>{const t=($-1)*aa;return U.slice(t,t+aa)},[U,$]);u.useEffect(()=>{Q(t=>Math.min(t,de))},[de]),u.useEffect(()=>{W(t=>Math.min(t,ie))},[ie]),u.useEffect(()=>{let t=!0;return(async()=>{try{const i=await ea.listCustomViews(Oa);if(!t)return;const g=i.find(R=>R.name===$a)||null;if(!g)return;const h=oa({selectedFields:g.columns});Ae(String(g.id||"")),J(h),V(h),window.localStorage.setItem(ia,JSON.stringify(h))}catch{}})(),()=>{t=!1}},[]);const ya=t=>{const n=new URLSearchParams(Na);t?n.set("view",t):n.delete("view"),et(n,{replace:!0})},nt=()=>{te(na()),k({}),z(""),Ge(sa),W(1),ae(!1),be(!0)},qa=()=>{ge||(be(!1),ae(!1),k({}),z(""))},I=(t,n)=>{te(i=>({...i,[t]:n})),z(""),k(i=>i[t]?{...i,[t]:""}:i)},ot=()=>{z(""),Ge(sa),W(1),ae(!0)},ve=(t,n)=>{Ge(i=>({...i,[t]:n})),W(1)},lt=t=>{te(n=>({...n,selectedAccountId:t.id||"",selectedAccountLabel:[t.accountNumber,t.name].filter(Boolean).join(" - "),clientAccountNumber:t.accountNumber||"",companyName:t.name||"",contactPerson:t.contactPerson||"",address:Jt(t),email:t.contactEmail||t.email||"",phone:t.contactMobile||t.contactPhone||t.phone||"",accountOwner:t.accountOwnerName||t.accountOwner||""})),k(n=>({...n,selectedAccountId:""})),z(""),ae(!1)},rt=t=>{var g;const n=((g=t.target.files)==null?void 0:g[0])||null,i=Ma(n);if(i){te(h=>({...h,quoteFile:null,quoteFileName:""})),k(h=>({...h,quoteFile:i})),t.target.value="";return}te(h=>({...h,quoteFile:n,quoteFileName:(n==null?void 0:n.name)||""})),k(h=>({...h,quoteFile:""})),z("")},it=async t=>{var R,qe,Pa;if(t.preventDefault(),ge)return;const n={};d.selectedAccountId||(n.selectedAccountId="Please select an account from Account List."),d.quoteNumber.trim()||(n.quoteNumber="Quote Number is required."),d.quotationDate||(n.quotationDate="Quotation Date is required."),String(d.totalAmount).trim()||(n.totalAmount="Total Amount is required."),d.quotationStatus||(n.quotationStatus="Quotation Status is required.");const i=Ma(d.quoteFile);if(i&&(n.quoteFile=i),k(n),z(""),Object.keys(n).length>0)return;const g={quotationNumber:d.quoteNumber.trim(),quotationDate:d.quotationDate,validUntil:d.validUntilDate||d.quotationDate,amount:Number.parseFloat(d.totalAmount)||0,totalAmount:Number.parseFloat(d.totalAmount)||0,taxAmount:Number.parseFloat(d.totalProductTax)||0,productTax:Number.parseFloat(d.totalProductTax)||0,currency:d.amountCurrency||"INR",taxCurrency:d.taxCurrency||d.amountCurrency||"INR",status:d.quotationStatus,clientName:d.contactPerson||d.companyName||d.clientAccountNumber,companyName:d.companyName,clientAccountNumber:d.clientAccountNumber,contactPerson:d.contactPerson,telephone:d.phone,email:d.email,clientAddressDetails:d.address,selectedAccountId:d.selectedAccountId,selectedAccountOwner:d.accountOwner,quotationFileName:((R=d.quoteFile)==null?void 0:R.name)||"",quotationFileSize:((qe=d.quoteFile)==null?void 0:qe.size)||0,quotationFileType:((Pa=d.quoteFile)==null?void 0:Pa.type)||"",projectName:(re==null?void 0:re.projectName)||d.companyName||d.clientAccountNumber};ga(!0);const h=await j(g);if(ga(!1),!h.success){const wt=h.code==="DUPLICATE_QUOTATION"||h.status===409,Ye=h.message||"Unable to upload quotation.";z(Ye),wt?N("warning","Duplicate quotation",Ye):N("error","Error",Ye);return}N("success","Success","Quotation uploaded successfully."),O("account"),Q(1),Te(La),be(!1),ae(!1),te(na()),k({}),z("")},ye=(t,n=!0)=>{Ie(t),Ee(n),n&&ya(t.id)},Xe=()=>{Ie(null),(Ke||je)&&(Ee(!1),ya(""))};u.useEffect(()=>{if(!je){Ke&&(Ie(null),Ee(!1));return}const t=ce.find(n=>{var i;return String(n.id)===String(je)||String(((i=n.raw)==null?void 0:i.id)||"")===String(je)});t&&(Ee(!0),Ie(n=>(n==null?void 0:n.id)===t.id?n:t))},[ce,je,Ke]);const ct=t=>t?ce.filter(n=>String(n.raw.selectedAccountId||"")===String(t.id||"")||v(n.raw.clientAccountNumber)===v(t.accountNumber)||v(n.company)===v(t.name)):[],wa=t=>{fa(t)},dt=()=>{fa(null)},pt=()=>{pe(Y)},ut=()=>{Y&&pe(Y)},mt=()=>{V({selectedFields:[...ue.selectedFields]}),D(!0)},ht=async t=>{const n=oa(t),i={entityType:Oa,name:$a,columns:n.selectedFields,filters:{},sort:{},isDefault:!1,isShared:!1},g=me?await ea.updateCustomView(me,i):await ea.upsertCustomViewByName(i);g!=null&&g.id&&Ae(String(g.id))},Sa=async t=>{if(L.selectedFields.length===0){N("error","Field selection required","Select at least one quotation field.");return}const n=oa(L);if(J(n),t){window.localStorage.setItem(ia,JSON.stringify(n));try{await ht(n)}catch{N("warning","Saved locally","The quotation layout was saved in this browser, but database sync is unavailable right now.")}}D(!1)},xt=t=>{V(n=>n.selectedFields.includes(t)?n:{...n,selectedFields:[...n.selectedFields,t]})},bt=t=>{V(n=>n.selectedFields.length<=1?n:{...n,selectedFields:n.selectedFields.filter(i=>i!==t)})},gt=t=>{!ee||ee===t||(V(n=>{const i=n.selectedFields.indexOf(ee),g=n.selectedFields.indexOf(t);if(i<0||g<0)return n;const h=[...n.selectedFields];return h.splice(i,1),h.splice(g,0,ee),{...n,selectedFields:h}}),Pe(""))},_a=t=>{const n=`Quotation_Manager_${f}_${new Date().toISOString().slice(0,10)}`,i=[{label:"View",value:f.toUpperCase()},{label:"Total Records",value:String(U.length)},{label:"Generated On",value:new Date().toLocaleString("en-IN")}],g=U.map(h=>{var R,qe;return{num:h.num||"",owner:h.owner||"",date:h.dateSort||((R=h.raw)==null?void 0:R.quotationDate)||((qe=h.raw)==null?void 0:qe.createdAt)||"",company:h.company||"",status:h.statusLabel||_e(h.status),project:h.project||""}});if(t==="csv"){Ia({filename:`${n}.csv`,title:"Quotation Manager",subtitle:`${f.toUpperCase()} quotations`,sheetName:"Quotation Manager",metadata:i,columns:za,rows:g}),N("success","CSV exported","Quotation manager data exported to CSV.");return}t==="excel"&&(Ea({filename:`${n}.xlsx`,title:"Quotation Manager",subtitle:`${f.toUpperCase()} quotations`,sheetName:"Quotation Manager",metadata:i,columns:za,rows:g}),N("success","Excel exported","Quotation manager data exported to Excel."))},ft=async()=>{if(!K)return;Qe(K.id);const t=await y(K.id,{status:"approved",rejectionReason:"",approvedAt:new Date().toISOString()});if(Qe(""),!t.success){N("error","Approval failed",t.message||"Unable to approve this quotation.");return}Oe(null),N("success","Quotation approved","The quotation status has been updated to Approved.")},jt=async()=>{const t=ja.trim();if(!t){ne("Rejection reason is required.");return}if(!Z)return;ne(""),Qe(Z.id);const n=await y(Z.id,{status:"rejected",rejectionReason:t,rejectedAt:new Date().toISOString()});if(Qe(""),!n.success){N("error","Reject failed",n.message||"Unable to reject this quotation.");return}$e(null),fe(""),N("success","Quotation rejected","The quotation has been rejected and the reason was saved.")},Nt=(t,n)=>{if(t==="pdf"){wa(n);return}if(t==="preview"){Fe(n);return}if(t==="view"){ye(n);return}if(t==="approve"){Oe(n);return}if(t==="reject"){$e(n),fe(n.raw.rejectionReason||""),ne("");return}if(t==="clone"){l(s,{state:{quotationDraft:n.raw}});return}t==="account"&&Ze(n)},vt=t=>{if(!_||t==="view")return;const n=_;Xe(),Nt(t,n)},Ca=t=>{if(!_)return;const n=we(_.raw,_.linkedAccount),i=Ya(n);if(!i)return;const h=`Quotation_${String(n.quotationNumber||"draft").replace(/[^A-Za-z0-9_-]+/g,"_")}_${new Date().toISOString().slice(0,10)}`;if(t==="csv"){Ia({...i,filename:`${h}.csv`}),N("success","CSV exported",`Quotation ${n.quotationNumber} exported to CSV.`);return}Ea({...i,filename:`${h}.xlsx`}),N("success","Excel exported",`Quotation ${n.quotationNumber} exported to Excel.`)},Re=se?we(se.raw,se.linkedAccount):null,Y=We?we(We.raw,We.linkedAccount):null,S=_?we(_.raw,_.linkedAccount):null,yt=se?da(o,se):[],qt=_?da(o,_):[],b=(P==null?void 0:P.linkedAccount)||null,Aa=u.useMemo(()=>ct(b),[b,ce]);return E?Y?e.jsx(Ja,{documentData:Y,title:`QUOTATION - ${Y.quotationNumber}`,subtitle:Y.companyName,onBack:dt,onPrint:pt,onDownload:ut}):e.jsxs("div",{className:"aqp-page",children:[e.jsx("div",{className:"aqp-titlebar",children:e.jsx("h1",{className:"aqp-title",children:"Quotation Manager"})}),e.jsxs("div",{className:"aqp-tab-bar",children:[e.jsxs("div",{className:"aqp-tabs",children:[e.jsx("button",{type:"button",className:`aqp-tab${f==="account"?" aqp-tab--active":""}`,onClick:()=>O("account"),children:"ACCOUNT"}),e.jsx("button",{type:"button",className:`aqp-tab${f==="deal"?" aqp-tab--active":""}`,onClick:()=>O("deal"),children:"DEAL"})]}),e.jsxs("div",{className:"aqp-tab-actions",children:[e.jsxs("button",{type:"button",className:"aqp-btn aqp-btn--gray",onClick:nt,children:[e.jsx(Rt,{className:"aqp-btn-icon"}),"Upload Quotation"]}),e.jsxs("button",{type:"button",className:"aqp-btn aqp-btn--blue",onClick:()=>l(s,{state:{openGenerator:!0}}),children:[e.jsx(kt,{className:"aqp-btn-icon"}),"Generate Quotation"]})]})]}),e.jsx("div",{className:"aqp-content-wrapper",children:e.jsxs("div",{className:"aqp-main-content",children:[e.jsx("div",{className:"aqp-report-controls",children:e.jsxs("div",{className:"aqp-report-controls-left",children:[e.jsxs("button",{type:"button",className:`aqp-report-refine-btn${F?" aqp-report-refine-btn--active":""}`,onClick:()=>Ce(t=>!t),children:[e.jsx(Ut,{}),"Refine Filter"]}),e.jsx("button",{type:"button",className:`aqp-report-icon-btn aqp-report-icon-btn--blue${H?" aqp-report-icon-btn--active":""}`,title:"Select Quotation Report Fields",onClick:mt,"aria-pressed":H,children:e.jsx(Mt,{})}),e.jsx("div",{className:"aqp-report-export",children:e.jsx(Dt,{label:"Export",title:"Export quotation manager",className:"aqp-report-export",buttonClassName:"aqp-report-icon-btn aqp-report-icon-btn--green aqp-report-icon-btn--export",menuClassName:"aqp-report-export-menu",items:[{key:"quotation-manager-csv",label:"Export to CSV",badge:"CSV",onClick:()=>_a("csv")},{key:"quotation-manager-excel",label:"Export to Excel",badge:"XLSX",onClick:()=>_a("excel")}]})})]})}),e.jsx("div",{className:"aqp-table-wrap",children:e.jsxs("table",{className:"aqp-table",children:[e.jsxs("thead",{children:[e.jsx("tr",{className:"aqp-thead-row",children:oe.map(t=>e.jsxs("th",{className:`aqp-th aqp-field--${t.key}`,children:[t.label," ",e.jsx(Vt,{className:"aqp-sort-icon"})]},t.key))}),F?e.jsx("tr",{className:"aqp-search-row",children:oe.map(t=>e.jsx("th",{className:`aqp-search-th aqp-field--${t.key}`,children:e.jsx("input",{className:"aqp-search-input",value:he[t.key]||"",onChange:n=>{Te(i=>({...i,[t.key]:n.target.value})),Q(1)},placeholder:"Search here ..."})},t.key))}):null]}),e.jsx("tbody",{children:c&&ze.length===0?e.jsx("tr",{className:"aqp-row",children:e.jsx("td",{className:"aqp-td",colSpan:Math.max(1,oe.length),children:"Loading quotations..."})}):x&&ze.length===0?e.jsx("tr",{className:"aqp-row",children:e.jsx("td",{className:"aqp-td",colSpan:Math.max(1,oe.length),children:x})}):ze.length===0?e.jsx("tr",{className:"aqp-row",children:e.jsx("td",{className:"aqp-td",colSpan:Math.max(1,oe.length),children:"No quotations found."})}):ze.map(t=>e.jsx("tr",{className:"aqp-row",onClick:()=>ye(t),title:`Click to view ${t.num}`,children:oe.map(n=>{if(n.key==="num")return e.jsx("td",{className:`aqp-td aqp-td--num aqp-field--${n.key}`,children:e.jsx("button",{type:"button",className:`aqp-num-badge aqp-num-badge--button ${ke(t.status)}`,onClick:h=>{h.stopPropagation(),ye(t)},children:t.num})},n.key);if(n.key==="status")return e.jsx("td",{className:`aqp-td aqp-field--${n.key}`,children:e.jsx(ua,{status:t.status})},n.key);const i=n.exportValue(t),g=n.key==="company"?`aqp-td aqp-td--link aqp-field--${n.key}`:n.key==="amount"?`aqp-td aqp-td--amount aqp-field--${n.key}`:`aqp-td aqp-field--${n.key}`;return e.jsx("td",{className:g,children:i},n.key)})},t.id))})]})}),e.jsxs("div",{className:"aqp-pagination",children:[e.jsx("span",{className:"aqp-page-icon",children:U.length}),e.jsxs("span",{className:"aqp-total-label",children:["Total records: ",U.length]}),e.jsxs("div",{className:"aqp-page-btns",children:[e.jsx("button",{type:"button",className:"aqp-page-btn",onClick:()=>Q(t=>Math.max(1,t-1)),disabled:$===1,children:e.jsx(Bt,{})}),st.map(t=>e.jsx("button",{type:"button",className:`aqp-page-btn${$===t?" aqp-page-btn--active":""}`,onClick:()=>Q(t),children:t},t)),e.jsx("button",{type:"button",className:"aqp-page-btn",onClick:()=>Q(t=>Math.min(de,t+1)),disabled:$===de,children:e.jsx(Gt,{})})]})]})]})}),H?e.jsx("div",{className:"aqp-field-panel-overlay",onClick:()=>D(!1),children:e.jsxs("div",{className:"aqp-field-panel",onClick:t=>t.stopPropagation(),children:[e.jsxs("div",{className:"aqp-field-panel-header",children:[e.jsx("h2",{children:"Select Quotation Report Fields"}),e.jsxs("div",{className:"aqp-field-panel-actions",children:[e.jsx("button",{type:"button",className:"aqp-field-panel-btn aqp-field-panel-btn--ghost",onClick:()=>D(!1),children:"Close"}),e.jsx("button",{type:"button",className:"aqp-field-panel-btn aqp-field-panel-btn--blue",onClick:()=>Sa(!1),children:"Apply"}),e.jsx("button",{type:"button",className:"aqp-field-panel-btn aqp-field-panel-btn--green",onClick:()=>Sa(!0),children:"Save & Apply"})]})]}),e.jsxs("div",{className:"aqp-field-panel-grid",children:[e.jsxs("section",{className:"aqp-field-box",children:[e.jsx("div",{className:"aqp-field-box-header",children:"Quotation Fields"}),e.jsx("div",{className:"aqp-field-box-list",children:at.map(t=>e.jsxs("button",{type:"button",className:"aqp-field-option",onClick:()=>xt(t.key),children:[e.jsx("span",{children:t.label}),e.jsx("strong",{children:"+"})]},t.key))})]}),e.jsxs("section",{className:"aqp-field-box",children:[e.jsx("div",{className:"aqp-field-box-header",children:"Selected Fields"}),e.jsx("div",{className:"aqp-field-box-list",children:L.selectedFields.map(t=>{const n=Se.find(i=>i.key===t);return n?e.jsxs("div",{className:"aqp-field-selected",draggable:!0,onDragStart:()=>Pe(n.key),onDragOver:i=>i.preventDefault(),onDrop:()=>gt(n.key),children:[e.jsx("span",{children:n.label}),e.jsx("button",{type:"button",className:"aqp-field-remove",onClick:()=>bt(n.key),children:e.jsx(De,{})})]},n.key):null})})]})]})]})}):null,xe?e.jsx(M,{title:"Upload Account Quotation",onClose:qa,size:"aqp-modal--upload",footer:e.jsxs(e.Fragment,{children:[e.jsx("button",{type:"button",className:"aqp-btn aqp-btn--gray",onClick:qa,disabled:ge,children:"Close"}),e.jsx("button",{type:"submit",form:"aqp-upload-quotation-form",className:"aqp-btn aqp-btn--blue",disabled:ge,children:ge?"Saving...":"Save"})]}),children:e.jsxs("form",{id:"aqp-upload-quotation-form",className:"aqp-upload-form",onSubmit:it,children:[e.jsx("div",{className:"aqp-upload-note",children:"Please select the account from the Account List popup before saving the uploaded quotation."}),e.jsxs("div",{className:"aqp-upload-grid",children:[e.jsxs("label",{className:"aqp-form-field aqp-upload-grid__full",children:[e.jsx("span",{className:"aqp-form-label",children:"Select Account"}),e.jsxs("div",{className:"aqp-upload-account-picker",children:[e.jsx("input",{className:`aqp-upload-input${q.selectedAccountId?" aqp-upload-input--error":""}`,value:d.selectedAccountLabel,placeholder:"Click the search icon to select an account",readOnly:!0}),e.jsx("button",{type:"button",className:"aqp-upload-account-button",onClick:ot,"aria-label":"Search accounts",children:e.jsx(Wt,{})})]}),q.selectedAccountId?e.jsx("div",{className:"aqp-form-error",children:q.selectedAccountId}):null]}),re?e.jsxs("div",{className:"aqp-upload-account-card aqp-upload-grid__full",children:[e.jsx("div",{className:"aqp-upload-account-note",children:"Please double click on another account in the list if you want to change this selection."}),e.jsxs("div",{className:"aqp-upload-account-grid",children:[e.jsxs("div",{className:"aqp-upload-account-item",children:[e.jsx("span",{className:"aqp-upload-account-item-label",children:"Account No."}),e.jsx("span",{className:"aqp-upload-account-item-value",children:re.accountNumber||"-"})]}),e.jsxs("div",{className:"aqp-upload-account-item",children:[e.jsx("span",{className:"aqp-upload-account-item-label",children:"Account Name"}),e.jsx("span",{className:"aqp-upload-account-item-value",children:re.name||"-"})]}),e.jsxs("div",{className:"aqp-upload-account-item",children:[e.jsx("span",{className:"aqp-upload-account-item-label",children:"Email"}),e.jsx("span",{className:"aqp-upload-account-item-value",children:d.email||"-"})]}),e.jsxs("div",{className:"aqp-upload-account-item",children:[e.jsx("span",{className:"aqp-upload-account-item-label",children:"Phone"}),e.jsx("span",{className:"aqp-upload-account-item-value",children:d.phone||"-"})]}),e.jsxs("div",{className:"aqp-upload-account-item",children:[e.jsx("span",{className:"aqp-upload-account-item-label",children:"Account Owner"}),e.jsx("span",{className:"aqp-upload-account-item-value",children:d.accountOwner||"-"})]}),e.jsxs("div",{className:"aqp-upload-account-item aqp-upload-account-item--wide",children:[e.jsx("span",{className:"aqp-upload-account-item-label",children:"Address"}),e.jsx("span",{className:"aqp-upload-account-item-value",children:d.address||"-"})]})]})]}):null,e.jsxs("label",{className:"aqp-form-field",children:[e.jsx("span",{className:"aqp-form-label",children:"Quote Number"}),e.jsx("input",{className:`aqp-upload-input${q.quoteNumber?" aqp-upload-input--error":""}`,value:d.quoteNumber,onChange:t=>I("quoteNumber",t.target.value)}),q.quoteNumber?e.jsx("div",{className:"aqp-form-error",children:q.quoteNumber}):null]}),e.jsxs("label",{className:"aqp-form-field",children:[e.jsx("span",{className:"aqp-form-label",children:"Quotation Date"}),e.jsx("input",{type:"date",className:`aqp-upload-input${q.quotationDate?" aqp-upload-input--error":""}`,value:d.quotationDate,onChange:t=>I("quotationDate",t.target.value)}),q.quotationDate?e.jsx("div",{className:"aqp-form-error",children:q.quotationDate}):null]}),e.jsxs("label",{className:"aqp-form-field",children:[e.jsx("span",{className:"aqp-form-label",children:"Total Amount"}),e.jsxs("div",{className:"aqp-upload-field-inline",children:[e.jsx("input",{type:"number",min:"0",step:"0.01",className:`aqp-upload-input${q.totalAmount?" aqp-upload-input--error":""}`,value:d.totalAmount,onChange:t=>I("totalAmount",t.target.value)}),e.jsx("select",{className:"aqp-upload-select aqp-upload-select--currency",value:d.amountCurrency,onChange:t=>I("amountCurrency",t.target.value),children:Qa.map(t=>e.jsx("option",{value:t.value,children:t.label},t.value))})]}),q.totalAmount?e.jsx("div",{className:"aqp-form-error",children:q.totalAmount}):null]}),e.jsxs("label",{className:"aqp-form-field",children:[e.jsx("span",{className:"aqp-form-label",children:"Total Product Tax"}),e.jsxs("div",{className:"aqp-upload-field-inline",children:[e.jsx("input",{type:"number",min:"0",step:"0.01",className:"aqp-upload-input",value:d.totalProductTax,onChange:t=>I("totalProductTax",t.target.value)}),e.jsx("select",{className:"aqp-upload-select aqp-upload-select--currency",value:d.taxCurrency,onChange:t=>I("taxCurrency",t.target.value),children:Qa.map(t=>e.jsx("option",{value:t.value,children:t.label},t.value))})]})]}),e.jsxs("label",{className:"aqp-form-field",children:[e.jsx("span",{className:"aqp-form-label",children:"Quotation Status"}),e.jsx("select",{className:`aqp-upload-select${q.quotationStatus?" aqp-upload-select--error":""}`,value:d.quotationStatus,onChange:t=>I("quotationStatus",t.target.value),children:Yt.map(t=>e.jsx("option",{value:t.value,children:t.label},t.value||"select"))}),q.quotationStatus?e.jsx("div",{className:"aqp-form-error",children:q.quotationStatus}):null]}),e.jsxs("label",{className:"aqp-form-field",children:[e.jsx("span",{className:"aqp-form-label",children:"Valid Until Date"}),e.jsx("input",{type:"date",className:"aqp-upload-input",value:d.validUntilDate,onChange:t=>I("validUntilDate",t.target.value)})]}),e.jsxs("label",{className:"aqp-form-field",children:[e.jsx("span",{className:"aqp-form-label",children:"Contact Person"}),e.jsx("input",{className:"aqp-upload-input",value:d.contactPerson,onChange:t=>I("contactPerson",t.target.value)})]}),e.jsxs("label",{className:"aqp-form-field aqp-upload-grid__full",children:[e.jsx("span",{className:"aqp-form-label",children:"Address"}),e.jsx("textarea",{className:"aqp-textarea",rows:3,value:d.address,onChange:t=>I("address",t.target.value)})]}),e.jsxs("label",{className:"aqp-form-field",children:[e.jsx("span",{className:"aqp-form-label",children:"Email"}),e.jsx("input",{className:"aqp-upload-input",value:d.email,onChange:t=>I("email",t.target.value)})]}),e.jsxs("label",{className:"aqp-form-field",children:[e.jsx("span",{className:"aqp-form-label",children:"Phone"}),e.jsx("input",{className:"aqp-upload-input",value:d.phone,onChange:t=>I("phone",t.target.value)})]}),e.jsxs("label",{className:"aqp-form-field aqp-upload-grid__full",children:[e.jsx("span",{className:"aqp-form-label",children:"Quote File"}),e.jsx("input",{type:"file",accept:".pdf,.xls,.xlsx,application/pdf,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",className:`aqp-upload-file-input${q.quoteFile?" aqp-upload-file-input--error":""}`,onChange:rt}),e.jsx("div",{className:"aqp-upload-file-note",children:"Allowed file types: PDF, XLS, XLSX. Maximum size: 5 MB."}),d.quoteFileName?e.jsx("div",{className:"aqp-upload-file-name",children:d.quoteFileName}):null,q.quoteFile?e.jsx("div",{className:"aqp-form-error",children:q.quoteFile}):null]})]}),ba?e.jsx("div",{className:"aqp-upload-message",children:ba}):null]})}):null,xe&&Be?e.jsx(M,{title:"Account List",onClose:()=>ae(!1),size:"aqp-modal--xl",children:e.jsxs("div",{className:"aqp-account-list",children:[e.jsx("div",{className:"aqp-account-list-note",children:"Please double click on the account to select a account."}),e.jsx("div",{className:"aqp-account-list-table-wrap",children:e.jsxs("table",{className:"aqp-account-list-table",children:[e.jsxs("thead",{children:[e.jsxs("tr",{className:"aqp-account-list-header-row",children:[e.jsx("th",{children:"Account No."}),e.jsx("th",{children:"Account Name"}),e.jsx("th",{children:"Email"}),e.jsx("th",{children:"Phone"}),e.jsx("th",{children:"Account Owner"})]}),e.jsxs("tr",{className:"aqp-account-list-search-row",children:[e.jsx("th",{children:e.jsx("input",{className:"aqp-account-list-search-input",value:B.accountNumber,onChange:t=>ve("accountNumber",t.target.value),placeholder:"Search here ..."})}),e.jsx("th",{children:e.jsx("input",{className:"aqp-account-list-search-input",value:B.name,onChange:t=>ve("name",t.target.value),placeholder:"Search here ..."})}),e.jsx("th",{children:e.jsx("input",{className:"aqp-account-list-search-input",value:B.email,onChange:t=>ve("email",t.target.value),placeholder:"Search here ..."})}),e.jsx("th",{children:e.jsx("input",{className:"aqp-account-list-search-input",value:B.phone,onChange:t=>ve("phone",t.target.value),placeholder:"Search here ..."})}),e.jsx("th",{children:e.jsx("input",{className:"aqp-account-list-search-input",value:B.accountOwner,onChange:t=>ve("accountOwner",t.target.value),placeholder:"Search here ..."})})]})]}),e.jsx("tbody",{children:va.length>0?va.map(t=>e.jsxs("tr",{className:`aqp-account-list-row${d.selectedAccountId===t.id?" aqp-account-list-row--selected":""}`,onDoubleClick:()=>lt(t),children:[e.jsx("td",{children:t.accountNumber||"-"}),e.jsx("td",{children:t.name||"-"}),e.jsx("td",{children:t.email||"-"}),e.jsx("td",{children:t.phone||"-"}),e.jsx("td",{children:t.accountOwnerDisplay||t.accountOwner||"-"})]},t.id)):e.jsx("tr",{children:e.jsx("td",{colSpan:"5",className:"aqp-account-list-empty",children:"No accounts found."})})})]})}),e.jsxs("div",{className:"aqp-account-list-pagination",children:[e.jsxs("span",{className:"aqp-account-list-total",children:["Total records: ",Ne.length]}),e.jsxs("div",{className:"aqp-account-list-pagination-actions",children:[e.jsx("button",{type:"button",className:"aqp-account-list-page-button",onClick:()=>W(t=>Math.max(1,t-1)),disabled:G===1,children:"prev"}),tt.map(t=>e.jsx("button",{type:"button",className:`aqp-account-list-page-button${t===G?" aqp-account-list-page-button--active":""}`,onClick:()=>W(t),children:t},t)),e.jsx("button",{type:"button",className:"aqp-account-list-page-button",onClick:()=>W(t=>Math.min(ie,t+1)),disabled:G===ie,children:"next"})]})]})]})}):null,Re?e.jsx(M,{title:`Quotation Preview - ${Re.quotationNumber}`,onClose:()=>Fe(null),size:"aqp-modal--xl",footer:e.jsxs(e.Fragment,{children:[e.jsx("button",{type:"button",className:"aqp-btn aqp-btn--gray",onClick:()=>Fe(null),children:"Close"}),e.jsxs("button",{type:"button",className:"aqp-btn aqp-btn--gray",onClick:()=>pe(Re),children:[e.jsx(ra,{className:"aqp-btn-icon"}),"Print"]}),yt.some(t=>t.key==="pdf")?e.jsx("button",{type:"button",className:"aqp-btn aqp-btn--blue",onClick:()=>{const t=se;Fe(null),wa(t)},children:"View As PDF"}):null]}),children:e.jsx(Me,{documentData:Re})}):null,S?e.jsxs(M,{title:`View Quote - ${S.quotationNumber}`,onClose:Xe,size:"aqp-modal--xl",children:[e.jsx("div",{className:"aqp-view-top-actions",children:e.jsxs("div",{className:"aqp-modal-footer-group",children:[e.jsx("button",{type:"button",className:"aqp-btn aqp-btn--gray",onClick:Xe,children:"Close"}),e.jsx(Fa,{label:"Export CSV",busyLabel:"Generating...",successLabel:"CSV downloaded",title:"Download this quotation as a formatted CSV file",onClick:()=>Ca("csv")}),e.jsx(Fa,{label:"Export Excel",busyLabel:"Generating...",successLabel:"Excel downloaded",title:"Download this quotation as a formatted Excel file",onClick:()=>Ca("excel")}),e.jsxs("button",{type:"button",className:"aqp-btn aqp-btn--blue",onClick:()=>pe(S),children:[e.jsx(ra,{className:"aqp-btn-icon"}),"Print"]})]})}),e.jsxs("div",{className:"aqp-view-summary",children:[e.jsxs("div",{className:"aqp-view-summary__header",children:[e.jsx("div",{className:"aqp-view-summary__header-crm",children:e.jsx("div",{className:"aqp-view-summary__crm-badge",children:e.jsx("img",{src:Da,alt:"Swati Switchgears",className:"aqp-view-summary__crm-logo"})})}),e.jsxs("div",{className:"aqp-view-summary__header-info",children:[e.jsx("div",{className:"aqp-view-summary__quotation-actions",children:e.jsx("div",{className:"aqp-num-cell aqp-num-cell--inline",children:e.jsx("span",{className:`aqp-num-badge ${ke((_==null?void 0:_.status)||S.statusLabel)}`,children:C(S.quotationNumber)})})}),e.jsx("div",{className:"aqp-view-summary__quotation-company",children:C(S.companyName)})]}),e.jsx("div",{className:"aqp-view-summary__header-status",children:e.jsx(ua,{status:S.statusLabel})})]}),e.jsxs("div",{className:"aqp-view-summary__actions",role:"toolbar","aria-label":"Quotation actions",children:[e.jsx("span",{className:"aqp-view-summary__actions-title",children:"Quotation Actions"}),qt.filter(t=>t.key!=="view").map(t=>{const n=t.icon,i=X===(_==null?void 0:_.id);return e.jsxs("button",{type:"button",className:`aqp-view-action-btn aqp-view-action-btn--${t.key}`,onClick:()=>vt(t.key),disabled:i,title:t.label,children:[e.jsx(n,{className:`aqp-view-action-btn__icon${t.iconClass?` ${t.iconClass}`:""}`}),e.jsx("span",{className:"aqp-view-action-btn__label",children:t.label})]},t.key)})]}),e.jsxs("div",{className:"aqp-view-summary__grid",children:[e.jsxs("div",{children:[e.jsx("strong",{children:"Date:"})," ",C(S.quotationDate)]}),e.jsxs("div",{children:[e.jsx("strong",{children:"Valid Until:"})," ",C(S.validUntil)]}),e.jsxs("div",{children:[e.jsx("strong",{children:"Profile:"})," ",C(S.profileName)]}),e.jsxs("div",{children:[e.jsx("strong",{children:"Currency:"})," ",S.currency]}),e.jsxs("div",{children:[e.jsx("strong",{children:"Total:"})," ",w(S.total,S.currency)]}),e.jsxs("div",{children:[e.jsx("strong",{children:"Inquiry Ref:"})," ",C(S.customerReferenceNumber)]})]}),S.rejectionReason?e.jsxs("div",{className:"aqp-view-summary__alert",children:[e.jsx("strong",{children:"Rejection Reason:"})," ",S.rejectionReason]}):null]}),e.jsx(Me,{documentData:S})]}):null,P?e.jsx(M,{title:`View Account - ${P.company}`,onClose:()=>Ze(null),size:"aqp-modal--lg",footer:e.jsx("button",{type:"button",className:"aqp-btn aqp-btn--gray",onClick:()=>Ze(null),children:"Close"}),children:e.jsxs("div",{className:"aqp-account",children:[e.jsxs("div",{className:"aqp-account__grid",children:[e.jsxs("div",{children:[e.jsx("strong",{children:"Account No.:"})," ",C((b==null?void 0:b.accountNumber)||P.raw.clientAccountNumber)]}),e.jsxs("div",{children:[e.jsx("strong",{children:"Account Name:"})," ",C((b==null?void 0:b.name)||P.company)]}),e.jsxs("div",{children:[e.jsx("strong",{children:"Email:"})," ",C((b==null?void 0:b.email)||P.raw.email)]}),e.jsxs("div",{children:[e.jsx("strong",{children:"Phone:"})," ",C((b==null?void 0:b.phone)||P.raw.telephone)]}),e.jsxs("div",{children:[e.jsx("strong",{children:"Account Owner:"})," ",C((b==null?void 0:b.accountOwnerDisplay)||(b==null?void 0:b.accountOwner)||P.raw.selectedAccountOwner)]}),e.jsxs("div",{children:[e.jsx("strong",{children:"GSTIN:"})," ",C((b==null?void 0:b.gstin)||P.raw.gstin)]}),e.jsxs("div",{children:[e.jsx("strong",{children:"State Code:"})," ",C((b==null?void 0:b.stateCode)||P.raw.stateCode)]}),e.jsxs("div",{children:[e.jsx("strong",{children:"Contact Person:"})," ",C((b==null?void 0:b.contactPerson)||P.raw.contactPerson)]})]}),e.jsxs("div",{className:"aqp-account__section",children:[e.jsx("h3",{children:"Address"}),e.jsx("p",{children:C((b==null?void 0:b.address)||P.raw.clientAddressDetails)})]}),e.jsxs("div",{className:"aqp-account__section",children:[e.jsx("h3",{children:"Related Quotations"}),Aa.length===0?e.jsx("p",{children:"No related quotations found."}):e.jsxs("table",{className:"aqp-account__table",children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{children:"Quotation No."}),e.jsx("th",{children:"Date"}),e.jsx("th",{children:"Status"}),e.jsx("th",{children:"Amount"})]})}),e.jsx("tbody",{children:Aa.map(t=>e.jsxs("tr",{onClick:()=>ye(t),title:`Click to view ${t.num}`,children:[e.jsx("td",{className:"aqp-account__table-cell--num",children:e.jsx("button",{type:"button",className:`aqp-num-badge aqp-num-badge--button ${ke(t.status)}`,onClick:n=>{n.stopPropagation(),ye(t)},children:t.num})}),e.jsx("td",{children:t.date}),e.jsx("td",{children:t.statusLabel}),e.jsx("td",{children:t.amountLabel})]},t.id))})]})]})]})}):null,K?e.jsx(M,{title:"Approve Quote",onClose:()=>Oe(null),footer:e.jsxs(e.Fragment,{children:[e.jsx("button",{type:"button",className:"aqp-btn aqp-btn--gray",onClick:()=>Oe(null),disabled:X===K.id,children:"Cancel"}),e.jsx("button",{type:"button",className:"aqp-btn aqp-btn--blue",onClick:ft,disabled:X===K.id,children:X===K.id?"Approving...":"Approve"})]}),children:e.jsx("p",{children:"Are you sure you want to approve this quote?"})}):null,Z?e.jsxs(M,{title:"Reject Quote",onClose:()=>{$e(null),ne(""),fe("")},footer:e.jsxs(e.Fragment,{children:[e.jsx("button",{type:"button",className:"aqp-btn aqp-btn--gray",onClick:()=>{$e(null),ne(""),fe("")},disabled:X===Z.id,children:"Cancel"}),e.jsx("button",{type:"button",className:"aqp-btn aqp-btn--blue",onClick:jt,disabled:X===Z.id,children:X===Z.id?"Rejecting...":"Reject Quote"})]}),children:[e.jsxs("label",{className:"aqp-form-field",children:[e.jsx("span",{className:"aqp-form-label",children:"Rejection Reason"}),e.jsx("textarea",{className:`aqp-textarea${Le?" aqp-textarea--error":""}`,rows:5,value:ja,onChange:t=>{fe(t.target.value),Le&&ne("")},placeholder:"Enter rejection reason"})]}),Le?e.jsx("div",{className:"aqp-form-error",children:Le}):null]}):null]}):null},ps=Object.freeze(Object.defineProperty({__proto__:null,ACTIONS:ma,ModalShell:M,QuotationDocument:Me,QuotationPdfViewer:Ja,StatusBadge:ua,buildPrintableHtml:Ha,buildQuotationDocumentData:we,buildQuotationViewExportOptions:Ya,buildVisiblePages:pa,default:cs,formatListDate:Ga,formatStatusLabel:_e,getActionBadgeClassName:ke,getAllowedQuotationActions:da,getStatusClassName:Wa,resolveLinkedAccount:Xa,safeLower:v,toNumber:A,triggerBrowserPdfSave:pe},Symbol.toStringTag,{value:"Module"}));export{ma as A,M,Ja as Q,ua as S,Ga as a,we as b,Me as c,ea as d,pa as e,_e as f,ke as g,ps as h,Xa as r,v as s,pe as t};
