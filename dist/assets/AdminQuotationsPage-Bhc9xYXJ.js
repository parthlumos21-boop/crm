import{Y as Ye,bt as fa,an as Tt,A as Na,l as Me,al as ja,bH as va,r as h,j as e,bC as A,bI as ya,bJ as qa,bs as lt,bw as wa,bK as Sa,u as _a,s as Aa,V as Ca,bg as Pa,bq as Ta,bB as Ia,bE as Fa,B as Ea,b6 as Oa,aX as za,G as La,H as Qa,ai as $a,bG as ka,bF as Ra,T as Ua,n as Ma}from"./index-vL6jG44V.js";const Je=(t={})=>({id:t.id,userId:t.userId??t.user_id,companyId:t.companyId??t.company_id,entityType:t.entityType??t.entity_type??"",name:t.name??"",columns:Array.isArray(t.columns)?t.columns:[],filters:t.filters&&typeof t.filters=="object"?t.filters:{},sort:t.sort&&typeof t.sort=="object"?t.sort:{},isDefault:!!(t.isDefault??t.is_default),isShared:!!(t.isShared??t.is_shared)}),He={async listCustomViews(t){const s=await Ye.get("/custom-views",{params:t?{entityType:t}:{}});return(Array.isArray(s==null?void 0:s.data)?s.data:[]).map(Je)},async createCustomView(t){const s=await Ye.post("/custom-views",t);return Je((s==null?void 0:s.data)||{})},async updateCustomView(t,s){const l=await Ye.put(`/custom-views/${encodeURIComponent(t)}`,s);return Je((l==null?void 0:l.data)||{})},async upsertCustomViewByName(t){const s=(t==null?void 0:t.entityType)||"",l=String((t==null?void 0:t.name)||"").trim(),c=(await this.listCustomViews(s)).find(r=>String(r.name||"").trim()===l)||null;return c!=null&&c.id?this.updateCustomView(c.id,t):this.createCustomView(t)}},et=6,tt=8,rt="crm-admin-quotation-manager-layout",It="quotation_layout_preferences",Ft="Admin Quotation Manager Layout",Da=5*1024*1024,Va=["pdf","xls","xlsx"],Et={num:"",owner:"",date:"",company:"",amount:"",status:"",project:""},at={accountNumber:"",name:"",email:"",phone:"",accountOwner:""},Ba=[{value:"",label:"Select"},{value:"open",label:"Open"},{value:"approved",label:"Approved"},{value:"customer_approved",label:"Customer Approved"},{value:"customer_rejected",label:"Customer Rejected"},{value:"rejected",label:"Rejected"},{value:"cancelled",label:"Cancelled"}],Ot=[{value:"INR",label:"INR"},{value:"USD",label:"USD"},{value:"AED",label:"AED"},{value:"NZD",label:"NZ$"},{value:"CAD",label:"CAD"},{value:"SEK",label:"SEK"},{value:"SGD",label:"SGD"},{value:"AUD",label:"AUD"},{value:"JPY",label:"JPY"},{value:"EUR",label:"Euro"},{value:"GBP",label:"GBP"},{value:"QAR",label:"QAR"},{value:"SAR",label:"SAR"},{value:"OMR",label:"OMR"}],kt=()=>new Date().toISOString().slice(0,10),Ga=(t,s)=>{const l=new Date(t||kt());return l.setDate(l.getDate()+s),l.toISOString().slice(0,10)},st=()=>{const t=kt();return{selectedAccountId:"",selectedAccountLabel:"",clientAccountNumber:"",companyName:"",contactPerson:"",address:"",email:"",phone:"",accountOwner:"",quoteNumber:"",quotationDate:t,totalAmount:"",amountCurrency:"INR",totalProductTax:"",taxCurrency:"INR",quotationStatus:"",validUntilDate:Ga(t,30),quoteFile:null,quoteFileName:""}},we=[{key:"num",label:"Quotation Number",exportValue:t=>t.num},{key:"date",label:"Quotation Date",exportValue:t=>t.date},{key:"owner",label:"Quotation Owner",exportValue:t=>t.owner},{key:"company",label:"Company Name",exportValue:t=>t.company},{key:"project",label:"Project Name",exportValue:t=>t.project},{key:"amount",label:"Amount",exportValue:t=>t.amountLabel},{key:"status",label:"Status",exportValue:t=>t.statusLabel}],Ka=[{key:"num",label:"Quotation Number",type:"text",width:18},{key:"date",label:"Quotation Date",type:"date",align:"center",width:18},{key:"owner",label:"Quotation Owner",type:"text",width:22},{key:"company",label:"Company Name",type:"text",width:28},{key:"project",label:"Project Name",type:"text",width:28},{key:"amountLabel",label:"Amount",type:"text",width:18},{key:"statusLabel",label:"Status",type:"text",width:16}],Re=["num","owner","date","amount","status","company","project"],mt=(t=[],s="deal")=>{const l=t.filter(Boolean),c=(s==="account"?["num","owner","date","company","amount","status","project"]:["num","owner","date","amount","status","company","project"]).filter(r=>l.includes(r));return l.forEach(r=>{c.includes(r)||c.push(r)}),c},zt=()=>{try{const t=window.localStorage.getItem(rt),s=t?JSON.parse(t):null,l=Array.isArray(s==null?void 0:s.selectedFields)&&s.selectedFields.length>0?s.selectedFields.filter(o=>we.some(c=>c.key===o)):Re;return{selectedFields:mt(l)}}catch{return{selectedFields:Re}}},nt=(t={})=>{const s=Array.isArray(t==null?void 0:t.selectedFields)&&t.selectedFields.length>0?t.selectedFields.filter(l=>we.some(o=>o.key===l)):Re;return{selectedFields:mt(s.length>0?s:Re)}},T={brandKey:"swati",organizationName:"Swati Switchgears India Pvt Ltd",organizationLegalName:"Swati Switchgears (India) Pvt. Ltd.",organizationAddress:"36 Shubhlaxmi Industrial Estate, Sarkhej Bavla Road, Changodar, Ahmedabad - 382210",organizationAddressLines:["36 Shubhlaxmi Industrial Estate,","Sarkhej Bavla Road, Changodar,","Ahmedabad - 382210"],organizationEmail:"mkt@swatiswitchgears.com",organizationPhone:"9913536307",organizationGstin:"24AAACZ0615P1Z7",organizationStateCode:"24",website:"www.swatiswitchgears.com",organizationTagline:"",logoType:"image"},it={brandKey:"lumos",organizationName:"Lumos Building Automation Pvt Ltd",organizationLegalName:"Lumos Building Automation Pvt. Ltd.",organizationAddress:"Vadodara, Gujarat, India",organizationEmail:"sales@lumosbuildingautomation.com",organizationPhone:"+91 265 4000 222",organizationGstin:"24AAECL9020K1ZY",organizationStateCode:"24",website:"www.lumosbuildingautomation.com",organizationTagline:"Building automation, controls and smart infrastructure solutions.",logoType:"image"},Lt={swati:T,"swati-switch":T,"swati-switch-gear":T,lumos:it,"lumos-building":it},ht=[{key:"pdf",label:"View As PDF",icon:fa,iconClass:"aqp-action-icon--pdf"},{key:"preview",label:"Preview",icon:Tt},{key:"view",label:"View Quote",icon:Tt},{key:"approve",label:"Approve Quote",icon:Na},{key:"reject",label:"Reject Quote",icon:Me},{key:"clone",label:"Clone Quote",icon:ja},{key:"account",label:"View Account",icon:va}],q=t=>String(t||"").trim().toLowerCase(),Qt=t=>String(t||"").split(/\r?\n|,/).map(s=>s.trim()).filter(Boolean),Wa=(t={})=>[t.address,t.location,t.state].filter(Boolean).join(", "),Za=(t="")=>{const s=String(t||"").split(".");return s.length>1?q(s.pop()):""},$t=t=>{if(!t)return"Quote File is required.";const s=Za(t.name);return Va.includes(s)?t.size>Da?"Quote File size must be 5 MB or less.":"":"Only PDF, XLS and XLSX files are allowed."},De=(t={})=>{const s=q(t.profileKey);if(s&&Lt[s])return Lt[s];const l=q(t.profileName||t.organizationName);return l.includes("swati")?T:l.includes("lumos")?it:{}},Xa=(t={})=>De(t).brandKey==="swati",Ya=(t={})=>De(t).brandKey==="lumos",bt=t=>t==="lumos"?ka:t==="swati"?Ra:null,Rt=t=>t==="lumos"?"lumos":t==="swati"?"swati":"",Ja=(t={})=>{const s=De(t);return s.logoType?s.logoType==="image":q(t.profileName||t.organizationName).includes("swati")},Ut=t=>{if(!t)return"-";const s=new Date(t);if(Number.isNaN(s.getTime()))return String(t);const l=String(s.getDate()).padStart(2,"0"),o=String(s.getMonth()+1).padStart(2,"0"),c=s.getFullYear();return`${l}-${o}-${c}`},ot=t=>{if(!t)return"-";const s=new Date(t);return Number.isNaN(s.getTime())?String(t):new Intl.DateTimeFormat("en-GB",{day:"2-digit",month:"short",year:"numeric"}).format(s)},w=t=>{const s=Number.parseFloat(t);return Number.isFinite(s)?s:0},m=t=>String(t||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;"),xt=t=>{const s=q(t).replace(/[\s-]+/g,"_");return s?s==="accepted"?"approved":s==="new"?"draft":s:"draft"},Se=t=>{const s=xt(t),l={draft:"Draft",sent:"Sent",approved:"Approved",rejected:"Rejected",cancelled:"Cancelled",open:"Open"};return l[s]?l[s]:s.split("_").map(o=>o.charAt(0).toUpperCase()+o.slice(1)).join(" ")},Mt=t=>{const s=xt(t);return s==="approved"?"aqp-status--approved":s==="rejected"?"aqp-status--rejected":s==="sent"?"aqp-status--sent":"aqp-status--open"},ct=t=>{const s=xt(t);return s==="approved"||s==="cancelled"?"aqp-num-badge--orange":"aqp-num-badge--teal"},Ha=(t={})=>[t==null?void 0:t.name,t==null?void 0:t.username,t==null?void 0:t.email].map(s=>q(s)).filter(Boolean),es=(t,s)=>{var y,N,v,j,E;const l=q(t==null?void 0:t.role);if(l==="admin"||l==="super_admin")return ht.map(O=>O.key);const c=[s==null?void 0:s.owner,(y=s==null?void 0:s.raw)==null?void 0:y.selectedAccountOwner,(N=s==null?void 0:s.raw)==null?void 0:N.ownerName,(v=s==null?void 0:s.raw)==null?void 0:v.createdBy].map(O=>q(O)),r=Ha(t),i=c.some(O=>O&&r.includes(O)),d=!!((j=t==null?void 0:t.permissions)!=null&&j.approveQuotes||(E=t==null?void 0:t.permissions)!=null&&E.approveQuotation);if(l==="viewer"||!i&&!d)return["pdf","preview","view"];const f=["pdf","preview","view","clone"];return d&&f.push("approve","reject"),f},dt=(t,s)=>{const l=new Set(es(t,s));return ht.filter(o=>l.has(o.key))},ut=(t,s)=>{const o=Math.max(1,t-Math.floor(2.5)),c=Math.min(s,o+5-1),r=Math.max(1,c-5+1);return Array.from({length:c-r+1},(i,d)=>r+d)},R=t=>t||"-",ts=(...t)=>t.map(s=>String(s||"").trim()).filter(Boolean).join(", "),pt=(t={})=>{const l=(Array.isArray(t.lineItems)?t.lineItems:[]).filter(c=>String((c==null?void 0:c.description)||"").trim()).map((c,r)=>{const i=w(c.quantity||c.qty||0),d=w(c.rate||c.price||c.unitPrice||0),f=Number.isFinite(Number(c.amount))?Number(c.amount):i*d;return{id:c.id||`line-${r+1}`,srNo:r+1,description:c.description,quantity:i,unit:c.unit||"Nos",rate:d,amount:f}});if(l.length>0)return l;const o=[t.product,t.otherProduct,t.otherService,t.projectName].filter(Boolean).join(" / ");return!o&&!w(t.amount)?[]:[{id:t.id||"line-1",srNo:1,description:o||t.companyName||"Quotation Item",quantity:1,unit:"Nos",rate:w(t.amount),amount:w(t.amount)}]},Dt=t=>{const s=["","One","Two","Three","Four","Five","Six","Seven","Eight","Nine"],l=["Ten","Eleven","Twelve","Thirteen","Fourteen","Fifteen","Sixteen","Seventeen","Eighteen","Nineteen"],o=["","","Twenty","Thirty","Forty","Fifty","Sixty","Seventy","Eighty","Ninety"];return t===0?"":t<10?s[t]:t<20?l[t-10]:t<100?`${o[Math.floor(t/10)]}${t%10?` ${s[t%10]}`:""}`:`${s[Math.floor(t/100)]} Hundred${t%100?` ${Dt(t%100)}`:""}`},as=t=>{const s=Math.floor(Math.abs(w(t)));if(!s)return"Zero";const l=[{divisor:1e7,label:"Crore"},{divisor:1e5,label:"Lakh"},{divisor:1e3,label:"Thousand"},{divisor:1,label:""}];let o=s;const c=[];return l.forEach(({divisor:r,label:i})=>{if(o>=r){const d=Math.floor(o/r);o%=r,d>0&&(c.push(Dt(d)),i&&c.push(i))}}),c.join(" ").trim()},Vt=(t,s)=>{if(!t)return null;const l=s.find(r=>String(r.id)===String(t.selectedAccountId||""));if(l)return l;const o=q(t.clientAccountNumber);if(o){const r=s.find(i=>q(i.accountNumber)===o);if(r)return r}const c=q(t.companyName);if(c){const r=s.find(i=>q(i.name)===c);if(r)return r}return null},ke=(t,s)=>{var Q,fe,ae;const l=De(t),o=l.brandKey?l:T,c=Xa(t)||!l.brandKey,r=Ya(t),i=!!l.brandKey,d=o.brandKey||(c?"swati":r?"lumos":"swati"),f=bt(d),y=pt(t),N=y.reduce((Ve,M)=>Ve+w(M.amount),0),v=w(t.cgstAmount||t.cgst||0),j=w(t.sgstAmount||t.sgst||0),E=w(t.igstAmount||t.igst||0),O=w(t.taxAmount||0),_e=w(t.amount),ee=N+v+j+E+O,be=_e>0?Math.max(_e,ee):ee,Ae=t.logoType||l.logoType||(Ja(t)?"image":"text"),z=t.clientAddressDetails||ts(s==null?void 0:s.address,s==null?void 0:s.location,s==null?void 0:s.state)||"-",U=i?o.organizationName:t.organizationName||o.organizationName||t.profileName||T.organizationName,Ce=i?o.organizationLegalName||U:t.organizationLegalName||o.organizationLegalName||U,xe=i?o.organizationAddress||"":t.organizationAddress||o.organizationAddress||T.organizationAddress,te=o.organizationAddressLines||Qt(xe),Pe=i?o.organizationEmail||"":t.organizationEmail||o.organizationEmail||T.organizationEmail,ge=i?o.organizationPhone||"":t.organizationPhone||o.organizationPhone||T.organizationPhone,Te=i?o.organizationGstin||"":t.organizationGstin||o.organizationGstin||T.organizationGstin,L=i?o.organizationStateCode||"":t.organizationStateCode||o.organizationStateCode||T.organizationStateCode;return{id:t.id,quotationNumber:t.quotationNumber||"-",quotationDate:ot(t.quotationDate||t.createdAt),validUntil:ot(t.validUntil),currency:t.currency||o.currency||"INR",statusLabel:Se(t.status),profileName:t.profileName||"-",brandKey:d,brandClassName:Rt(d),logoSource:f,isSwatiDocument:c,isLumosDocument:r,organizationName:U,organizationLegalName:Ce,organizationAddress:xe,organizationAddressLines:te,organizationEmail:Pe,organizationPhone:ge,organizationGstin:Te,organizationStateCode:L,website:i?o.website||"":t.website||o.website||T.website,organizationTagline:t.organizationTagline||o.organizationTagline||"",logoType:Ae,companyName:t.companyName||(s==null?void 0:s.name)||"-",clientAccountNumber:t.clientAccountNumber||(s==null?void 0:s.accountNumber)||"-",contactPerson:t.contactPerson||(s==null?void 0:s.contactPerson)||"-",telephone:t.telephone||(s==null?void 0:s.phone)||(s==null?void 0:s.contactPhone)||"-",email:t.email||(s==null?void 0:s.email)||(s==null?void 0:s.contactEmail)||"-",gstin:t.gstin||(s==null?void 0:s.gstin)||"-",stateCode:t.stateCode||(s==null?void 0:s.stateCode)||"-",accountOwner:(s==null?void 0:s.accountOwnerDisplay)||t.selectedAccountOwner||(s==null?void 0:s.accountOwner)||"-",customerReferenceNumber:((Q=t.customerReference)==null?void 0:Q.number)||"-",customerReferenceDate:ot((fe=t.customerReference)==null?void 0:fe.date),customerReferenceSubject:((ae=t.customerReference)==null?void 0:ae.subject)||"-",quotationSubject:t.quotationSubject||"-",projectName:t.projectName||"-",clientAddressDetails:z,clientAddressLines:Qt(z==="-"?"":z),product:t.product||"-",otherProduct:t.otherProduct||"-",otherService:t.otherService||"-",deliveryTerms:t.deliveryTerms||"-",paymentTerms:t.paymentTerms||"-",warrantyTerms:t.warrantyTerms||"-",quotationNotes:t.quotationNotes||"-",rejectionReason:t.rejectionReason||"",lineItems:y,subtotal:N,cgst:v,sgst:j,igst:E,otherTax:O,total:be,amountInWords:`${as(be)} ${t.currency==="USD"?"US Dollars":t.currency==="EUR"?"Euros":"Rupees"} Only`}},ss=[{key:"srNo",label:"Sr No",type:"integer",align:"center",width:8},{key:"description",label:"Description",align:"left",width:48,wrap:!0},{key:"quantity",label:"Qty",type:"number",align:"right",width:10},{key:"unit",label:"Unit",align:"center",width:10},{key:"rate",label:"Rate",type:"currency",align:"right",width:16},{key:"amount",label:"Amount",type:"currency",align:"right",width:18}],ns=t=>{if(!t)return null;const s=d=>{const f=String(d??"").trim();return f&&f!=="-"?f:""},l=[{label:"Quotation No.",value:s(t.quotationNumber)},{label:"Quotation Date",value:s(t.quotationDate)},{label:"Valid Until",value:s(t.validUntil)},{label:"Status",value:s(t.statusLabel)},{label:"Currency",value:s(t.currency)},{label:"Profile",value:s(t.profileName)},{label:"Customer",value:s(t.companyName)},{label:"Account No.",value:s(t.clientAccountNumber)},{label:"Contact Person",value:s(t.contactPerson)},{label:"Telephone",value:s(t.telephone)},{label:"Email",value:s(t.email)},{label:"GSTIN",value:s(t.gstin)},{label:"State Code",value:s(t.stateCode)},{label:"Account Owner",value:s(t.accountOwner)},{label:"Customer Address",value:s(t.clientAddressDetails)},{label:"Project Name",value:s(t.projectName)},{label:"Quotation Subject",value:s(t.quotationSubject)},{label:"Inquiry Ref No",value:s(t.customerReferenceNumber)},{label:"Inquiry Ref Date",value:s(t.customerReferenceDate)},{label:"Inquiry Subject",value:s(t.customerReferenceSubject)},{label:"Delivery Terms",value:s(t.deliveryTerms)},{label:"Payment Terms",value:s(t.paymentTerms)},{label:"Warranty Terms",value:s(t.warrantyTerms)},{label:"Quotation Notes",value:s(t.quotationNotes)}].filter(d=>d.value);t.rejectionReason&&l.push({label:"Rejection Reason",value:t.rejectionReason});const o=(t.lineItems||[]).map(d=>({srNo:d.srNo,description:d.description,quantity:d.quantity,unit:d.unit,rate:d.rate,amount:d.amount})),c=[],r=(d,f)=>{!Number.isFinite(Number(f))||Number(f)===0||c.push({srNo:"",description:d,quantity:"",unit:"",rate:"",amount:Number(f)})};r("Subtotal",t.subtotal),r("CGST",t.cgst),r("SGST",t.sgst),r("IGST",t.igst),r("Other Tax",t.otherTax),r("Total",t.total),t.amountInWords&&c.push({srNo:"",description:`Amount in Words: ${t.amountInWords}`,quantity:"",unit:"",rate:"",amount:""});const i=[...o,...c];return{title:`Sales Quotation - ${s(t.quotationNumber)||"Draft"}`,subtitle:s(t.companyName)||s(t.organizationName),sheetName:"Quotation",companyName:t.organizationName,metadata:l,columns:ss,rows:i}},Bt=t=>{const s=t.logoSource||bt(t.brandKey),l=t.brandClassName||Rt(t.brandKey),o=t.lineItems.map(r=>`
    <tr>
      <td class="text-center">${r.srNo}</td>
      <td class="description-cell">${m(r.description)}</td>
      <td class="text-center">${m(r.quantity)}</td>
      <td class="text-center">${m(r.unit)}</td>
      <td class="money">${m(A(r.rate,t.currency))}</td>
      <td class="money">${m(A(r.amount,t.currency))}</td>
    </tr>
  `).join(""),c=s?`<div class="logo-wrap logo-wrap--${m(l||"default")}"><img src="${s}" alt="${m(t.organizationName)}" class="logo logo--${m(l||"default")}" /></div>`:`<div class="logo-text">${m(t.organizationName)}</div>`;return`<!doctype html>
  <html>
    <head>
      <meta charset="utf-8" />
      <title>${m(t.quotationNumber)} - Sales Quotation</title>
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
          width: 213px;
          height: 142px;
          max-width: 100%;
          max-height: 152px;
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
          width: 196px;
          height: 148px;
          max-height: 159px;
        }
        .logo--lumos {
          width: 311px;
          height: 142px;
          max-height: 152px;
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
        .items-table {
          width: 100%;
          max-width: 100%;
          table-layout: fixed;
        }
        thead { display: table-header-group; }
        tr { page-break-inside: avoid; }
        .items-table th,
        .items-table td {
          box-sizing: border-box;
          border: 1px solid #c9d5df;
          padding: 9px 8px;
          font-size: 10px;
          vertical-align: top;
          overflow-wrap: anywhere;
          word-break: break-word;
        }
        .items-table th:nth-child(1),
        .items-table td:nth-child(1) { width: 38px !important; }
        .items-table th:nth-child(2),
        .items-table td:nth-child(2) { width: auto !important; }
        .items-table th:nth-child(3),
        .items-table td:nth-child(3) { width: 52px !important; }
        .items-table th:nth-child(4),
        .items-table td:nth-child(4) { width: 58px !important; }
        .items-table th:nth-child(5),
        .items-table td:nth-child(5) { width: 84px !important; }
        .items-table th:nth-child(6),
        .items-table td:nth-child(6) { width: 96px !important; }
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
              ${c}
              <h2 class="company-name">${m(t.organizationName)}</h2>
              <div class="company-contact">
                ${m(t.organizationAddress)}<br />
                Email: ${m(t.organizationEmail)} | Phone: ${m(t.organizationPhone)} | GSTIN: ${m(t.organizationGstin)}
              </div>
            </div>
            <div class="party-grid">
              <div class="party-card">
                <div class="section-label">Customer Details</div>
                <div class="field-row"><strong>Customer Name</strong><span>${m(t.companyName)}</span></div>
                <div class="field-row"><strong>Client Account No.</strong><span>${m(t.clientAccountNumber)}</span></div>
                <div class="field-row"><strong>Contact Person</strong><span>${m(t.contactPerson)}</span></div>
                <div class="field-row"><strong>Phone</strong><span>${m(t.telephone)}</span></div>
                <div class="field-row"><strong>Email</strong><span>${m(t.email)}</span></div>
                <div class="field-row"><strong>GSTIN</strong><span>${m(t.gstin)}</span></div>
                <div class="field-row"><strong>Address</strong><span>${m(t.clientAddressDetails)}</span></div>
              </div>
              <div class="party-card">
                <div class="section-label">Sales Details</div>
                <div class="field-row"><strong>Sales Executive</strong><span>${m(t.accountOwner)}</span></div>
                <div class="field-row"><strong>Mobile Number</strong><span>${m(t.organizationPhone)}</span></div>
                <div class="field-row"><strong>Email Address</strong><span>${m(t.organizationEmail)}</span></div>
                <div class="field-row"><strong>Quotation Reference</strong><span>${m(t.quotationNumber)}</span></div>
              </div>
            </div>
            <h1>SALES QUOTATION</h1>
          </div>
          <div class="quotation-main">
            <div class="meta-grid">
              <div class="meta-cell">
                <div class="meta-label">Quotation No.</div>
                <div class="meta-value">${m(t.quotationNumber)}</div>
              </div>
              <div class="meta-cell">
                <div class="meta-label">Quotation Date</div>
                <div class="meta-value">${m(t.quotationDate)}</div>
              </div>
              <div class="meta-cell">
                <div class="meta-label">Valid Until</div>
                <div class="meta-value">${m(t.validUntil)}</div>
              </div>
              <div class="meta-cell">
                <div class="meta-label">Currency</div>
                <div class="meta-value">${m(t.currency)}</div>
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
                <div class="detail-row"><strong>Profile Name</strong><span>${m(t.profileName)}</span></div>
                <div class="detail-row"><strong>Project</strong><span>${m(t.projectName)}</span></div>
                <div class="detail-row"><strong>Account Owner</strong><span>${m(t.accountOwner)}</span></div>
                <div class="detail-row"><strong>Subject</strong><span>${m(t.quotationSubject)}</span></div>
                <div class="detail-row"><strong>Product</strong><span>${m([t.product,t.otherProduct].filter(r=>r&&r!=="-").join(" / ")||"-")}</span></div>
                <div class="detail-row"><strong>Service</strong><span>${m(t.otherService)}</span></div>
              </div>
              <div class="totals-card">
                <div class="section-label">Amount Summary</div>
                <div class="total-row"><strong>Sub Total</strong><span>${m(A(t.subtotal,t.currency))}</span></div>
                <div class="total-row"><strong>CGST</strong><span>${m(A(t.cgst,t.currency))}</span></div>
                <div class="total-row"><strong>SGST</strong><span>${m(A(t.sgst,t.currency))}</span></div>
                <div class="total-row"><strong>IGST</strong><span>${m(A(t.igst,t.currency))}</span></div>
                <div class="total-row"><strong>Other Tax</strong><span>${m(A(t.otherTax,t.currency))}</span></div>
                <div class="total-row grand-total"><strong>Total Amount</strong><span>${m(A(t.total,t.currency))}</span></div>
              </div>
            </div>

            <div class="amount-words"><strong>Amount in Words</strong>${m(t.amountInWords)}</div>

            <div class="terms-grid">
              <div class="terms-card">
                <h3 class="terms-title">Inquiry Reference</h3>
                <div class="terms-value">Number: ${m(t.customerReferenceNumber)}&#10;Date: ${m(t.customerReferenceDate)}&#10;Subject: ${m(t.customerReferenceSubject)}</div>
              </div>
              <div class="terms-card">
                <h3 class="terms-title">Terms &amp; Conditions</h3>
                <div class="terms-value">Delivery: ${m(t.deliveryTerms)}&#10;Payment: ${m(t.paymentTerms)}&#10;Warranty: ${m(t.warrantyTerms)}</div>
              </div>
              <div class="terms-card">
                <h3 class="terms-title">Quotation Notes</h3>
                <div class="terms-value">${m(t.quotationNotes)}</div>
              </div>
              <div class="terms-card">
                <h3 class="terms-title">Status</h3>
                <div class="terms-value">Status: ${m(t.statusLabel)}${t.rejectionReason?`&#10;Reason: ${m(t.rejectionReason)}`:""}</div>
              </div>
            </div>
          </div>
          <div class="quotation-footer">
            <strong>${m(t.organizationName)}</strong><br />
            Website: ${m(t.website||T.website)} | Email: ${m(t.organizationEmail)} | Phone: ${m(t.organizationPhone)}
          </div>
        </div>
      </div>
    </body>
  </html>`},he=t=>{if(!t)return;const s=document.title,l=`Quotation-${(t==null?void 0:t.quotationNumber)||"Document"}.pdf`,o=document.createElement("iframe");let c=null;o.title=l,o.setAttribute("aria-hidden","true"),o.style.position="fixed",o.style.left="-10000px",o.style.top="0",o.style.width="1024px",o.style.height="768px",o.style.border="0",o.style.opacity="0";const r=()=>{c&&window.clearTimeout(c),document.title=s,window.removeEventListener("afterprint",r),o.parentNode&&o.parentNode.removeChild(o)},i=()=>{const d=o.contentDocument;if(!d)return Promise.resolve();const f=Array.from(d.images||[]);return Promise.all(f.map(y=>y.complete?Promise.resolve():new Promise(N=>{y.onload=N,y.onerror=N})))};o.onload=()=>{i().then(()=>{const d=o.contentWindow;if(!d){r();return}document.title=l,window.addEventListener("afterprint",r),c=window.setTimeout(r,2500),d.focus(),d.print()})},document.title=l,document.body.appendChild(o),o.srcdoc=Bt(t)};function Gt({status:t}){return e.jsx("span",{className:`aqp-status ${Mt(t)}`,children:Se(t)})}function G({title:t,onClose:s,size:l="",children:o,footer:c}){return h.useEffect(()=>{const r=i=>{i.key==="Escape"&&s()};return document.addEventListener("keydown",r),()=>document.removeEventListener("keydown",r)},[s]),e.jsx("div",{className:"aqp-overlay",role:"presentation",onClick:s,children:e.jsxs("div",{className:`aqp-modal ${l}`.trim(),role:"dialog","aria-modal":"true",onClick:r=>r.stopPropagation(),children:[e.jsxs("div",{className:"aqp-modal-header",children:[e.jsx("span",{className:"aqp-modal-title",children:t}),e.jsx("button",{type:"button",className:"aqp-modal-close",onClick:s,"aria-label":"Close",children:e.jsx(Me,{})})]}),e.jsx("div",{className:"aqp-modal-body",children:o}),c?e.jsx("div",{className:"aqp-modal-footer",children:c}):null]})})}const os=({value:t,fieldKey:s,editable:l=!1,multiline:o=!1,className:c="",onCommit:r})=>{const[i,d]=h.useState(!1),[f,y]=h.useState(t||"");h.useEffect(()=>{i||y(t||"")},[i,t]);const N=()=>{const v=String(f||"").trim();d(!1),v!==String(t||"").trim()&&(r==null||r(s,v))};return!l||!s?e.jsx("span",{className:c,children:t}):i?o?e.jsx("textarea",{className:"aqp-doc-edit-input aqp-doc-edit-input--textarea",value:f,onChange:v=>y(v.target.value),onBlur:N,onKeyDown:v=>{v.key==="Escape"&&d(!1),(v.ctrlKey||v.metaKey)&&v.key==="Enter"&&N()},autoFocus:!0}):e.jsx("input",{className:"aqp-doc-edit-input",value:f,onChange:v=>y(v.target.value),onBlur:N,onKeyDown:v=>{v.key==="Escape"&&d(!1),v.key==="Enter"&&N()},autoFocus:!0}):e.jsxs("span",{className:`aqp-doc-editable ${c}`.trim(),children:[e.jsx("span",{className:"aqp-doc-editable-value",children:t}),e.jsx("button",{type:"button",className:"aqp-doc-edit-btn",onClick:()=>{y(t||""),d(!0)},"aria-label":"Edit quotation field",children:e.jsx(Ma,{})})]})},ls=(t,s,l)=>(o,c,r={})=>e.jsx(os,{fieldKey:o,value:c,editable:s,multiline:r.multiline,className:r.className,onCommit:l});function Ue({documentData:t,editable:s=!1,onEditField:l}){const o=t.logoSource||bt(t.brandKey),c=t.isLumosDocument?"lumos":t.isSwatiDocument?"swati":"default",r=[t.product,t.otherProduct].filter(d=>d&&d!=="-").join(" / ")||"-",i=ls(t,s,l);return e.jsx("div",{className:"aqp-doc aqp-print-scope",children:e.jsxs("div",{className:"aqp-doc__frame",children:[e.jsxs("div",{className:"aqp-doc__brand-head",children:[e.jsx("div",{className:`aqp-doc__logo-wrap aqp-doc__logo-wrap--${c}`,children:o?e.jsx("img",{src:o,alt:t.organizationName,className:`aqp-doc__brand-logo aqp-doc__brand-logo--${c}`}):e.jsx("div",{className:"aqp-doc__text-logo",children:t.organizationName})}),e.jsx("h2",{children:t.organizationName}),e.jsxs("p",{children:[t.organizationAddress,e.jsx("br",{}),"Email: ",t.organizationEmail," | Phone: ",t.organizationPhone," | GSTIN: ",t.organizationGstin]})]}),e.jsxs("div",{className:"aqp-doc__party-grid",children:[e.jsxs("section",{className:"aqp-doc__party-card",children:[e.jsx("div",{className:"aqp-doc__eyebrow",children:"Customer Details"}),e.jsxs("div",{className:"aqp-doc__field-row",children:[e.jsx("strong",{children:"Customer Name"}),i("companyName",t.companyName)]}),e.jsxs("div",{className:"aqp-doc__field-row",children:[e.jsx("strong",{children:"Client Account No."}),i("clientAccountNumber",t.clientAccountNumber)]}),e.jsxs("div",{className:"aqp-doc__field-row",children:[e.jsx("strong",{children:"Contact Person"}),i("contactPerson",t.contactPerson)]}),e.jsxs("div",{className:"aqp-doc__field-row",children:[e.jsx("strong",{children:"Phone"}),i("telephone",t.telephone)]}),e.jsxs("div",{className:"aqp-doc__field-row",children:[e.jsx("strong",{children:"Email"}),i("email",t.email)]}),e.jsxs("div",{className:"aqp-doc__field-row",children:[e.jsx("strong",{children:"GSTIN"}),i("gstin",t.gstin)]}),e.jsxs("div",{className:"aqp-doc__field-row",children:[e.jsx("strong",{children:"Address"}),i("clientAddressDetails",t.clientAddressDetails,{multiline:!0})]})]}),e.jsxs("section",{className:"aqp-doc__party-card",children:[e.jsx("div",{className:"aqp-doc__eyebrow",children:"Sales Details"}),e.jsxs("div",{className:"aqp-doc__field-row",children:[e.jsx("strong",{children:"Sales Executive"}),i("selectedAccountOwner",t.accountOwner)]}),e.jsxs("div",{className:"aqp-doc__field-row",children:[e.jsx("strong",{children:"Mobile Number"}),i("organizationPhone",t.organizationPhone)]}),e.jsxs("div",{className:"aqp-doc__field-row",children:[e.jsx("strong",{children:"Email Address"}),i("organizationEmail",t.organizationEmail)]}),e.jsxs("div",{className:"aqp-doc__field-row",children:[e.jsx("strong",{children:"Quotation Reference"}),i("quotationNumber",t.quotationNumber)]})]})]}),e.jsx("div",{className:"aqp-doc__title",children:"SALES QUOTATION"}),e.jsxs("div",{className:"aqp-doc__meta",children:[e.jsxs("div",{className:"aqp-doc__meta-cell",children:[e.jsx("span",{className:"aqp-doc__meta-label",children:"Quotation No."}),e.jsx("strong",{children:i("quotationNumber",t.quotationNumber)})]}),e.jsxs("div",{className:"aqp-doc__meta-cell",children:[e.jsx("span",{className:"aqp-doc__meta-label",children:"Quotation Date"}),e.jsx("strong",{children:i("quotationDate",t.quotationDate)})]}),e.jsxs("div",{className:"aqp-doc__meta-cell",children:[e.jsx("span",{className:"aqp-doc__meta-label",children:"Valid Until"}),e.jsx("strong",{children:i("validUntil",t.validUntil)})]}),e.jsxs("div",{className:"aqp-doc__meta-cell",children:[e.jsx("span",{className:"aqp-doc__meta-label",children:"Currency"}),e.jsx("strong",{children:i("currency",t.currency)})]})]}),e.jsxs("table",{className:"aqp-doc__table",children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{style:{width:"56px"},children:"Sr."}),e.jsx("th",{children:"Description"}),e.jsx("th",{style:{width:"80px"},children:"Qty"}),e.jsx("th",{style:{width:"88px"},children:"Unit"}),e.jsx("th",{style:{width:"120px"},children:"Rate"}),e.jsx("th",{style:{width:"140px"},children:"Amount"})]})}),e.jsx("tbody",{children:t.lineItems.length===0?e.jsx("tr",{children:e.jsx("td",{colSpan:6,children:"No quotation items available."})}):t.lineItems.map(d=>e.jsxs("tr",{children:[e.jsx("td",{className:"aqp-doc__num",children:d.srNo}),e.jsx("td",{className:"aqp-doc__description",children:i(`lineItems.${d.srNo-1}.description`,d.description,{multiline:!0})}),e.jsx("td",{className:"aqp-doc__num",children:i(`lineItems.${d.srNo-1}.quantity`,d.quantity)}),e.jsx("td",{className:"aqp-doc__num",children:i(`lineItems.${d.srNo-1}.unit`,d.unit)}),e.jsx("td",{className:"aqp-doc__amount",children:i(`lineItems.${d.srNo-1}.rate`,A(d.rate,t.currency))}),e.jsx("td",{className:"aqp-doc__amount",children:A(d.amount,t.currency)})]},d.id))})]}),e.jsxs("div",{className:"aqp-doc__summary",children:[e.jsxs("div",{className:"aqp-doc__summary-card",children:[e.jsx("div",{className:"aqp-doc__eyebrow",children:"Quotation Details"}),e.jsxs("div",{className:"aqp-doc__kv-row",children:[e.jsx("strong",{children:"Profile Name"}),i("profileName",t.profileName)]}),e.jsxs("div",{className:"aqp-doc__kv-row",children:[e.jsx("strong",{children:"Project"}),i("projectName",t.projectName)]}),e.jsxs("div",{className:"aqp-doc__kv-row",children:[e.jsx("strong",{children:"Account Owner"}),i("selectedAccountOwner",t.accountOwner)]}),e.jsxs("div",{className:"aqp-doc__kv-row",children:[e.jsx("strong",{children:"Subject"}),i("quotationSubject",t.quotationSubject)]}),e.jsxs("div",{className:"aqp-doc__kv-row",children:[e.jsx("strong",{children:"Product"}),i("product",r)]}),e.jsxs("div",{className:"aqp-doc__kv-row",children:[e.jsx("strong",{children:"Service"}),i("otherService",t.otherService)]})]}),e.jsxs("div",{className:"aqp-doc__totals",children:[e.jsx("div",{className:"aqp-doc__eyebrow",children:"Amount Summary"}),e.jsxs("div",{className:"aqp-doc__kv-row",children:[e.jsx("strong",{children:"Sub Total"}),e.jsx("span",{children:A(t.subtotal,t.currency)})]}),e.jsxs("div",{className:"aqp-doc__kv-row",children:[e.jsx("strong",{children:"CGST"}),e.jsx("span",{children:A(t.cgst,t.currency)})]}),e.jsxs("div",{className:"aqp-doc__kv-row",children:[e.jsx("strong",{children:"SGST"}),e.jsx("span",{children:A(t.sgst,t.currency)})]}),e.jsxs("div",{className:"aqp-doc__kv-row",children:[e.jsx("strong",{children:"IGST"}),e.jsx("span",{children:A(t.igst,t.currency)})]}),e.jsxs("div",{className:"aqp-doc__kv-row",children:[e.jsx("strong",{children:"Other Tax"}),e.jsx("span",{children:A(t.otherTax,t.currency)})]}),e.jsxs("div",{className:"aqp-doc__kv-row aqp-doc__grand-total",children:[e.jsx("strong",{children:"Total Amount"}),e.jsx("span",{children:A(t.total,t.currency)})]})]})]}),e.jsxs("div",{className:"aqp-doc__amount-words",children:[e.jsx("strong",{children:"Amount in Words"}),e.jsx("span",{children:t.amountInWords})]}),e.jsxs("div",{className:"aqp-doc__terms",children:[e.jsxs("section",{className:"aqp-doc__terms-card",children:[e.jsx("h4",{children:"Inquiry Reference"}),e.jsxs("p",{children:[e.jsx("strong",{children:"Number:"})," ",i("customerReference.number",t.customerReferenceNumber)]}),e.jsxs("p",{children:[e.jsx("strong",{children:"Date:"})," ",i("customerReference.date",t.customerReferenceDate)]}),e.jsxs("p",{children:[e.jsx("strong",{children:"Subject:"})," ",i("customerReference.subject",t.customerReferenceSubject)]})]}),e.jsxs("section",{className:"aqp-doc__terms-card",children:[e.jsx("h4",{children:"Terms & Conditions"}),e.jsxs("p",{children:[e.jsx("strong",{children:"Delivery:"})," ",i("deliveryTerms",t.deliveryTerms)]}),e.jsxs("p",{children:[e.jsx("strong",{children:"Payment:"})," ",i("paymentTerms",t.paymentTerms)]}),e.jsxs("p",{children:[e.jsx("strong",{children:"Warranty:"})," ",i("warrantyTerms",t.warrantyTerms)]})]}),e.jsxs("section",{className:"aqp-doc__terms-card",children:[e.jsx("h4",{children:"Quotation Notes"}),e.jsx("p",{children:i("quotationNotes",t.quotationNotes,{multiline:!0})})]}),e.jsxs("section",{className:"aqp-doc__terms-card",children:[e.jsx("h4",{children:"Status"}),e.jsxs("p",{children:[e.jsx("strong",{children:"Status:"})," ",t.statusLabel]}),t.rejectionReason?e.jsxs("p",{children:[e.jsx("strong",{children:"Reason:"})," ",t.rejectionReason]}):null]})]}),e.jsxs("div",{className:"aqp-doc__footer",children:[e.jsx("strong",{children:t.organizationName}),e.jsx("br",{}),"Website: ",t.website||T.website," | Email: ",t.organizationEmail," | Phone: ",t.organizationPhone]})]})})}function Kt({documentData:t,title:s,subtitle:l,onBack:o,onPrint:c,onDownload:r}){const[i,d]=h.useState(100),[f,y]=h.useState(!1);h.useEffect(()=>{d(100)},[t]),h.useEffect(()=>{if(!f)return;const j=()=>y(!1);return window.addEventListener("click",j),()=>window.removeEventListener("click",j)},[f]);const N=s||`QUOTATION - ${(t==null?void 0:t.quotationNumber)||"-"}`,v=l||(t==null?void 0:t.companyName)||"-";return e.jsxs("div",{className:"aqp-page aqp-page--pdf",children:[e.jsxs("div",{className:"aqp-pdf-toolbar",children:[e.jsxs("div",{className:"aqp-pdf-toolbar-copy",children:[e.jsx("h1",{children:N}),e.jsx("p",{children:v})]}),e.jsxs("div",{className:"aqp-pdf-toolbar-actions",children:[e.jsx("button",{type:"button",className:"aqp-btn aqp-btn--gray",onClick:o,children:"Back"}),e.jsx("button",{type:"button",className:"aqp-pdf-close-btn",onClick:o,"aria-label":"Close quotation PDF",children:e.jsx(Me,{})}),e.jsx("div",{className:"aqp-pdf-toolbar-status",children:e.jsx("span",{children:"PDF View"})}),e.jsxs("div",{className:"aqp-pdf-toolbar-zoom",children:[e.jsx("button",{type:"button",className:"aqp-pdf-icon-btn",onClick:()=>d(j=>Math.max(70,j-10)),"aria-label":"Zoom out",children:e.jsx(ya,{})}),e.jsxs("span",{className:"aqp-pdf-zoom-value",children:[i,"%"]}),e.jsx("button",{type:"button",className:"aqp-pdf-icon-btn",onClick:()=>d(j=>Math.min(160,j+10)),"aria-label":"Zoom in",children:e.jsx(qa,{})})]}),e.jsxs("button",{type:"button",className:"aqp-pdf-action-btn",onClick:c,"aria-label":"Print quotation",children:[e.jsx(lt,{}),"Print"]}),e.jsxs("button",{type:"button",className:"aqp-pdf-action-btn",onClick:()=>{if(typeof r=="function"){r();return}he(t)},"aria-label":"Download quotation PDF",children:[e.jsx(wa,{}),"Download PDF"]}),e.jsxs("div",{className:"aqp-pdf-more",children:[e.jsx("button",{type:"button",className:`aqp-pdf-icon-btn${f?" aqp-pdf-icon-btn--active":""}`,"aria-label":"More options",onClick:j=>{j.stopPropagation(),y(E=>!E)},"aria-expanded":f,"aria-haspopup":"menu",children:e.jsx(Sa,{})}),f?e.jsxs("div",{className:"aqp-action-menu aqp-action-menu--viewer",onClick:j=>j.stopPropagation(),children:[e.jsx("button",{type:"button",className:"aqp-action-item",onClick:()=>{d(100),y(!1)},children:"Reset Zoom"}),e.jsx("button",{type:"button",className:"aqp-action-item",onClick:()=>{d(90),y(!1)},children:"Fit Document"}),e.jsx("button",{type:"button",className:"aqp-action-item",onClick:()=>{c(),y(!1)},children:"Print / Save PDF"})]}):null]})]})]}),e.jsx("div",{className:"aqp-pdf-workspace",children:e.jsx("div",{className:"aqp-pdf-stage",children:e.jsx("div",{className:"aqp-pdf-canvas",children:e.jsx("div",{className:"aqp-pdf-zoom-surface",style:{zoom:i/100},children:e.jsx(Ue,{documentData:t})})})})})]})}const rs=({allowUsers:t=!1,generatorPath:s="/admin/quotations"})=>{const l=_a(),{user:o}=Aa(),{quotations:c,quotationsLoading:r,quotationsError:i,accounts:d,createQuotation:f,updateQuotation:y,addNotification:N}=Ca(),v=t||o&&(o.role==="admin"||o.role==="super_admin");h.useEffect(()=>{v||l("/unauthorized",{replace:!0})},[v,l]);const[j,E]=h.useState("account"),[O]=h.useState(!1),[_e,ee]=h.useState(!1),[be,Ae]=h.useState(zt),[z,U]=h.useState(zt),[Ce,xe]=h.useState(""),[te,Pe]=h.useState(""),[ge,Te]=h.useState(Et),[L,Q]=h.useState(1),[fe,ae]=h.useState(!1),[Ve,M]=h.useState(!1),[p,se]=h.useState(st),[S,D]=h.useState({}),[gt,$]=h.useState(""),[Ne,ft]=h.useState(!1),[K,Be]=h.useState(at),[W,Z]=h.useState(1),[ne,Ge]=h.useState(null),[Ke,Nt]=h.useState(null),[I,oe]=h.useState(null),[We,Ie]=h.useState(!1),[C,jt]=h.useState(null),[X,Ze]=h.useState(null),[Y,Xe]=h.useState(null),[vt,Fe]=h.useState(""),[Ee,je]=h.useState(""),[le,Oe]=h.useState(""),[yt,Wt]=Pa(),ve=yt.get("view")||"",re=h.useMemo(()=>mt(be.selectedFields,j).map(a=>we.find(n=>n.key===a)).filter(Boolean),[be.selectedFields,j]),Zt=h.useMemo(()=>we.filter(a=>!z.selectedFields.includes(a.key)),[z.selectedFields]),ie=h.useMemo(()=>d.map((a,n)=>Ta(a,n,{recordSource:"admin-quotation-view"})).sort(Ia),[d]),ce=h.useMemo(()=>ie.find(a=>String(a.id)===String(p.selectedAccountId||""))||null,[ie,p.selectedAccountId]),ye=h.useMemo(()=>ie.filter(a=>Object.entries(K).every(([n,u])=>{const x=q(u);if(!x)return!0;const b=n==="accountOwner"?a.accountOwnerDisplay||a.accountOwner||"":a[n];return q(b).includes(x)})),[K,ie]),de=h.useMemo(()=>Math.max(1,Math.ceil(ye.length/tt)),[ye.length]),Xt=h.useMemo(()=>ut(W,de),[W,de]),qt=h.useMemo(()=>{const a=(W-1)*tt;return ye.slice(a,a+tt)},[W,ye]),ue=h.useMemo(()=>c.map((a,n)=>{const u=Vt(a,ie),x=w(a.amount)||pt(a).reduce((b,P)=>b+w(P.amount),0);return{id:a.id||`quotation-${n}`,num:a.quotationNumber||`Quotation ${n+1}`,owner:(u==null?void 0:u.accountOwnerDisplay)||a.selectedAccountOwner||(u==null?void 0:u.accountOwner)||"-",date:Ut(a.quotationDate||a.createdAt),dateSort:a.quotationDate||a.createdAt||"",company:a.companyName||(u==null?void 0:u.name)||a.clientName||"-",amount:x,amountLabel:A(x,a.currency||"INR"),status:a.status||"draft",statusLabel:Se(a.status),project:a.projectName||a.product||a.otherProduct||a.otherService||"-",profileName:a.profileName||"-",linkedAccount:u,raw:a}}).sort((a,n)=>new Date(n.dateSort||0).getTime()-new Date(a.dateSort||0).getTime()),[ie,c]),V=h.useMemo(()=>ue.filter(a=>j!=="account"&&j!=="deal"?!1:Object.entries(ge).every(([n,u])=>{const x=q(u);if(!x)return!0;const b=n==="amount"?`${a.amount} ${a.amountLabel}`:n==="status"?a.statusLabel:a[n];return q(b).includes(x)})),[j,ge,ue]),pe=h.useMemo(()=>Math.max(1,Math.ceil(V.length/et)),[V.length]),Yt=h.useMemo(()=>ut(L,pe),[L,pe]),ze=h.useMemo(()=>{const a=(L-1)*et;return V.slice(a,a+et)},[V,L]);h.useEffect(()=>{Q(a=>Math.min(a,pe))},[pe]),h.useEffect(()=>{Z(a=>Math.min(a,de))},[de]),h.useEffect(()=>{let a=!0;return(async()=>{try{const u=await He.listCustomViews(It);if(!a)return;const x=u.find(P=>P.name===Ft)||null;if(!x)return;const b=nt({selectedFields:x.columns});xe(String(x.id||"")),Ae(b),U(b),window.localStorage.setItem(rt,JSON.stringify(b))}catch{}})(),()=>{a=!1}},[]);const wt=a=>{const n=new URLSearchParams(yt);a?n.set("view",a):n.delete("view"),Wt(n,{replace:!0})},Jt=()=>{se(st()),D({}),$(""),Be(at),Z(1),M(!1),ae(!0)},St=()=>{Ne||(ae(!1),M(!1),D({}),$(""))},F=(a,n)=>{se(u=>({...u,[a]:n})),$(""),D(u=>u[a]?{...u,[a]:""}:u)},Ht=()=>{$(""),Be(at),Z(1),M(!0)},qe=(a,n)=>{Be(u=>({...u,[a]:n})),Z(1)},ea=a=>{se(n=>({...n,selectedAccountId:a.id||"",selectedAccountLabel:[a.accountNumber,a.name].filter(Boolean).join(" - "),clientAccountNumber:a.accountNumber||"",companyName:a.name||"",contactPerson:a.contactPerson||"",address:Wa(a),email:a.contactEmail||a.email||"",phone:a.contactMobile||a.contactPhone||a.phone||"",accountOwner:a.accountOwnerName||a.accountOwner||""})),D(n=>({...n,selectedAccountId:""})),$(""),M(!1)},ta=a=>{var x;const n=((x=a.target.files)==null?void 0:x[0])||null,u=$t(n);if(u){se(b=>({...b,quoteFile:null,quoteFileName:""})),D(b=>({...b,quoteFile:u})),a.target.value="";return}se(b=>({...b,quoteFile:n,quoteFileName:(n==null?void 0:n.name)||""})),D(b=>({...b,quoteFile:""})),$("")},aa=async a=>{var P,_,me;if(a.preventDefault(),Ne)return;const n={};p.selectedAccountId||(n.selectedAccountId="Please select an account from Account List."),p.quoteNumber.trim()||(n.quoteNumber="Quote Number is required."),p.quotationDate||(n.quotationDate="Quotation Date is required."),String(p.totalAmount).trim()||(n.totalAmount="Total Amount is required."),p.quotationStatus||(n.quotationStatus="Quotation Status is required.");const u=$t(p.quoteFile);if(u&&(n.quoteFile=u),D(n),$(""),Object.keys(n).length>0)return;const x={quotationNumber:p.quoteNumber.trim(),quotationDate:p.quotationDate,validUntil:p.validUntilDate||p.quotationDate,amount:Number.parseFloat(p.totalAmount)||0,totalAmount:Number.parseFloat(p.totalAmount)||0,taxAmount:Number.parseFloat(p.totalProductTax)||0,productTax:Number.parseFloat(p.totalProductTax)||0,currency:p.amountCurrency||"INR",taxCurrency:p.taxCurrency||p.amountCurrency||"INR",status:p.quotationStatus,clientName:p.contactPerson||p.companyName||p.clientAccountNumber,companyName:p.companyName,clientAccountNumber:p.clientAccountNumber,contactPerson:p.contactPerson,telephone:p.phone,email:p.email,clientAddressDetails:p.address,selectedAccountId:p.selectedAccountId,selectedAccountOwner:p.accountOwner,quotationFileName:((P=p.quoteFile)==null?void 0:P.name)||"",quotationFileSize:((_=p.quoteFile)==null?void 0:_.size)||0,quotationFileType:((me=p.quoteFile)==null?void 0:me.type)||"",projectName:(ce==null?void 0:ce.projectName)||p.companyName||p.clientAccountNumber};ft(!0);const b=await f(x);if(ft(!1),!b.success){const B=b.code==="DUPLICATE_QUOTATION"||b.status===409,k=b.message||"Unable to upload quotation.";$(k),B?N("warning","Duplicate quotation",k):N("error","Error",k);return}N("success","Success","Quotation uploaded successfully."),E("account"),Q(1),Te(Et),ae(!1),M(!1),se(st()),D({}),$("")},Le=(a,n=!0)=>{oe(a),Ie(n),n&&wt(a.id)},_t=()=>{oe(null),(We||ve)&&(Ie(!1),wt(""))};h.useEffect(()=>{if(!ve){We&&(oe(null),Ie(!1));return}const a=ue.find(n=>{var u;return String(n.id)===String(ve)||String(((u=n.raw)==null?void 0:u.id)||"")===String(ve)});a&&(Ie(!0),oe(n=>(n==null?void 0:n.id)===a.id?n:a))},[ue,ve,We]);const sa=a=>a?ue.filter(n=>String(n.raw.selectedAccountId||"")===String(a.id||"")||q(n.raw.clientAccountNumber)===q(a.accountNumber)||q(n.company)===q(a.name)):[],na=a=>{Nt(a)},oa=()=>{Nt(null)},la=()=>{he(J)},ra=()=>{J&&he(J)},ia=async a=>{const n=nt(a),u={entityType:It,name:Ft,columns:n.selectedFields,filters:{},sort:{},isDefault:!1,isShared:!1},x=Ce?await He.updateCustomView(Ce,u):await He.upsertCustomViewByName(u);x!=null&&x.id&&xe(String(x.id))},At=async a=>{if(z.selectedFields.length===0){N("error","Field selection required","Select at least one quotation field.");return}const n=nt(z);if(Ae(n),a){window.localStorage.setItem(rt,JSON.stringify(n));try{await ia(n)}catch{N("warning","Saved locally","The quotation layout was saved in this browser, but database sync is unavailable right now.")}}ee(!1)},ca=a=>{U(n=>n.selectedFields.includes(a)?n:{...n,selectedFields:[...n.selectedFields,a]})},da=a=>{U(n=>n.selectedFields.length<=1?n:{...n,selectedFields:n.selectedFields.filter(u=>u!==a)})},ua=a=>{!te||te===a||(U(n=>{const u=n.selectedFields.indexOf(te),x=n.selectedFields.indexOf(a);if(u<0||x<0)return n;const b=[...n.selectedFields];return b.splice(u,1),b.splice(x,0,te),{...n,selectedFields:b}}),Pe(""))},pa=a=>{const n=`Quotation_Manager_${j}_${new Date().toISOString().slice(0,10)}`,u=[{label:"View",value:j.toUpperCase()},{label:"Total Records",value:String(V.length)},{label:"Generated On",value:new Date().toLocaleString("en-IN")}],x=V.map(b=>{var P,_;return{date:b.dateSort||((P=b.raw)==null?void 0:P.quotationDate)||((_=b.raw)==null?void 0:_.createdAt)||"",owner:b.owner||"",company:b.company||"",project:b.project||"",num:b.num||"",amountLabel:b.amountLabel||"",statusLabel:b.statusLabel||Se(b.status),oldStatus:b.oldStatus||"",newStatus:b.newStatus||"",convertToPo:b.convertToPo||"",poValueJobNo:b.poValueJobNo||"",reasonForLostOrder:b.reasonForLostOrder||""}});Ua({filename:`${n}.xlsx`,title:"Quotation Manager",subtitle:`${j.toUpperCase()} quotations`,sheetName:"Quotation Manager",metadata:u,columns:Ka,rows:x}),N("success","Excel exported","Quotation manager data exported to Excel.")},ma=async()=>{if(!X)return;Oe(X.id);const a=await y(X.id,{status:"approved",rejectionReason:"",approvedAt:new Date().toISOString()});if(Oe(""),!a.success){N("error","Approval failed",a.message||"Unable to approve this quotation.");return}Ze(null),N("success","Quotation approved","The quotation status has been updated to Approved.")},ha=async()=>{const a=vt.trim();if(!a){je("Rejection reason is required.");return}if(!Y)return;je(""),Oe(Y.id);const n=await y(Y.id,{status:"rejected",rejectionReason:a,rejectedAt:new Date().toISOString()});if(Oe(""),!n.success){N("error","Reject failed",n.message||"Unable to reject this quotation.");return}Xe(null),Fe(""),N("success","Quotation rejected","The quotation has been rejected and the reason was saved.")},Ct=a=>{const n=Number.parseFloat(String(a||"").replace(/[^\d.-]/g,""));return Number.isFinite(n)?n:0},ba=(a={},n="",u="")=>{if(n.startsWith("customerReference.")){const[,x]=n.split(".");return{customerReference:{...a.customerReference||{},[x]:u}}}if(n.startsWith("lineItems.")){const[,x,b]=n.split("."),P=Number.parseInt(x,10),me=(Array.isArray(a.lineItems)&&a.lineItems.length>0?a.lineItems:pt(a)).map((B,k)=>{if(k!==P)return B;const H={...B};return b==="quantity"?H.quantity=Ct(u):b==="rate"?H.rate=Ct(u):H[b]=u,H.amount=w(H.quantity)*w(H.rate),H});return{lineItems:me,amount:me.reduce((B,k)=>B+w(k.amount),0),totalAmount:me.reduce((B,k)=>B+w(k.amount),0)}}return{[n]:u}},xa=async(a,n)=>{if(!(I!=null&&I.id)||!a)return;const u=I.raw||{},x=ba(u,a,n),b={...u,...x};oe(_=>(_==null?void 0:_.id)===I.id?{..._,raw:b}:_);const P=await y(I.id,x);if(!P.success){N("error","Quotation update failed",P.message||"Unable to save quotation field."),oe(_=>(_==null?void 0:_.id)===I.id?{..._,raw:u}:_);return}N("success","Quotation updated","Quotation field saved.")},Qe=ne?ke(ne.raw,ne.linkedAccount):null,J=Ke?ke(Ke.raw,Ke.linkedAccount):null,$e=I?ke(I.raw,I.linkedAccount):null,ga=ne?dt(o,ne):[];I&&dt(o,I);const g=(C==null?void 0:C.linkedAccount)||null,Pt=h.useMemo(()=>sa(g),[g,ue]);return v?J?e.jsx(Kt,{documentData:J,title:`QUOTATION - ${J.quotationNumber}`,subtitle:J.companyName,onBack:oa,onPrint:la,onDownload:ra}):e.jsxs("div",{className:"aqp-page",children:[e.jsx("div",{className:"aqp-titlebar",children:e.jsx("h1",{className:"aqp-title",children:"Quotation Manager"})}),e.jsxs("div",{className:"aqp-tab-bar",children:[e.jsxs("div",{className:"aqp-tabs",children:[e.jsx("button",{type:"button",className:`aqp-tab${j==="account"?" aqp-tab--active":""}`,onClick:()=>E("account"),children:"ACCOUNT"}),e.jsx("button",{type:"button",className:`aqp-tab${j==="deal"?" aqp-tab--active":""}`,onClick:()=>E("deal"),children:"DEAL"})]}),e.jsxs("div",{className:"aqp-tab-actions",children:[e.jsxs("button",{type:"button",className:"aqp-btn aqp-btn--gray",onClick:Jt,children:[e.jsx(Fa,{className:"aqp-btn-icon"}),"Upload Quotation"]}),e.jsxs("button",{type:"button",className:"aqp-btn aqp-btn--red aqp-btn--generate",onClick:()=>l(s,{state:{openGenerator:!0}}),children:[e.jsx(Ea,{className:"aqp-btn-icon"}),"Generate Quotation"]})]})]}),e.jsx("div",{className:"aqp-content-wrapper",children:e.jsxs("div",{className:"aqp-main-content",children:[e.jsx("div",{className:"aqp-report-controls",children:e.jsx("div",{className:"aqp-report-controls-left",children:e.jsx("div",{className:"aqp-report-export",children:e.jsx(Oa,{label:"Export",title:"Export quotation manager",className:"aqp-report-export",items:[{key:"quotation-manager-excel",label:"Export to Excel",badge:"XLSX",onClick:()=>pa()}]})})})}),e.jsx("div",{className:"aqp-table-wrap",children:e.jsxs("table",{className:"aqp-table",children:[e.jsxs("thead",{children:[e.jsx("tr",{className:"aqp-thead-row",children:re.map(a=>e.jsxs("th",{className:`aqp-th aqp-field--${a.key}`,children:[a.label," ",e.jsx(za,{className:"aqp-sort-icon"})]},a.key))}),e.jsx("tr",{className:"aqp-search-row",children:re.map(a=>e.jsx("th",{className:`aqp-search-th aqp-field--${a.key}`,children:e.jsx("input",{className:"aqp-search-input",value:ge[a.key]||"",onChange:n=>{Te(u=>({...u,[a.key]:n.target.value})),Q(1)},placeholder:"Search "+a.label})},a.key))})]}),e.jsx("tbody",{children:r&&ze.length===0?e.jsx("tr",{className:"aqp-row",children:e.jsx("td",{className:"aqp-td",colSpan:Math.max(1,re.length),children:"Loading quotations..."})}):i&&ze.length===0?e.jsx("tr",{className:"aqp-row",children:e.jsx("td",{className:"aqp-td",colSpan:Math.max(1,re.length),children:i})}):ze.length===0?e.jsx("tr",{className:"aqp-row",children:e.jsx("td",{className:"aqp-td",colSpan:Math.max(1,re.length),children:"No quotations found."})}):ze.map(a=>e.jsx("tr",{className:"aqp-row",onClick:()=>Le(a),title:`Click to view ${a.num}`,children:re.map(n=>{if(n.key==="num")return e.jsx("td",{className:`aqp-td aqp-td--num aqp-field--${n.key}`,children:e.jsx("button",{type:"button",className:`aqp-num-badge aqp-num-badge--button ${ct(a.status)}`,onClick:b=>{b.stopPropagation(),Le(a)},children:a.num})},n.key);if(n.key==="status")return e.jsx("td",{className:`aqp-td aqp-field--${n.key}`,children:e.jsx(Gt,{status:a.status})},n.key);const u=n.exportValue(a),x=n.key==="company"?`aqp-td aqp-td--link aqp-field--${n.key}`:n.key==="amount"?`aqp-td aqp-td--amount aqp-field--${n.key}`:`aqp-td aqp-field--${n.key}`;return e.jsx("td",{className:x,children:u},n.key)})},a.id))})]})}),e.jsxs("div",{className:"aqp-pagination",children:[e.jsx("span",{className:"aqp-page-icon",children:V.length}),e.jsxs("span",{className:"aqp-total-label",children:["Total records: ",V.length]}),e.jsxs("div",{className:"aqp-page-btns",children:[e.jsx("button",{type:"button",className:"aqp-page-btn",onClick:()=>Q(a=>Math.max(1,a-1)),disabled:L===1,children:e.jsx(La,{})}),Yt.map(a=>e.jsx("button",{type:"button",className:`aqp-page-btn${L===a?" aqp-page-btn--active":""}`,onClick:()=>Q(a),children:a},a)),e.jsx("button",{type:"button",className:"aqp-page-btn",onClick:()=>Q(a=>Math.min(pe,a+1)),disabled:L===pe,children:e.jsx(Qa,{})})]})]})]})}),_e?e.jsx("div",{className:"aqp-field-panel-overlay",onClick:()=>ee(!1),children:e.jsxs("div",{className:"aqp-field-panel",onClick:a=>a.stopPropagation(),children:[e.jsxs("div",{className:"aqp-field-panel-header",children:[e.jsx("h2",{children:"Select Quotation Report Fields"}),e.jsxs("div",{className:"aqp-field-panel-actions",children:[e.jsx("button",{type:"button",className:"aqp-field-panel-btn aqp-field-panel-btn--ghost",onClick:()=>ee(!1),children:"Close"}),e.jsx("button",{type:"button",className:"aqp-field-panel-btn aqp-field-panel-btn--blue",onClick:()=>At(!1),children:"Apply"}),e.jsx("button",{type:"button",className:"aqp-field-panel-btn aqp-field-panel-btn--green",onClick:()=>At(!0),children:"Save & Apply"})]})]}),e.jsxs("div",{className:"aqp-field-panel-grid",children:[e.jsxs("section",{className:"aqp-field-box",children:[e.jsx("div",{className:"aqp-field-box-header",children:"Quotation Fields"}),e.jsx("div",{className:"aqp-field-box-list",children:Zt.map(a=>e.jsxs("button",{type:"button",className:"aqp-field-option",onClick:()=>ca(a.key),children:[e.jsx("span",{children:a.label}),e.jsx("strong",{children:"+"})]},a.key))})]}),e.jsxs("section",{className:"aqp-field-box",children:[e.jsx("div",{className:"aqp-field-box-header",children:"Selected Fields"}),e.jsx("div",{className:"aqp-field-box-list",children:z.selectedFields.map(a=>{const n=we.find(u=>u.key===a);return n?e.jsxs("div",{className:"aqp-field-selected",draggable:!0,onDragStart:()=>Pe(n.key),onDragOver:u=>u.preventDefault(),onDrop:()=>ua(n.key),children:[e.jsx("span",{children:n.label}),e.jsx("button",{type:"button",className:"aqp-field-remove",onClick:()=>da(n.key),children:e.jsx(Me,{})})]},n.key):null})})]})]})]})}):null,fe?e.jsx(G,{title:"Upload Account Quotation",onClose:St,size:"aqp-modal--upload",footer:e.jsxs(e.Fragment,{children:[e.jsx("button",{type:"button",className:"aqp-btn aqp-btn--gray",onClick:St,disabled:Ne,children:"Close"}),e.jsx("button",{type:"submit",form:"aqp-upload-quotation-form",className:"aqp-btn aqp-btn--blue",disabled:Ne,children:Ne?"Saving...":"Save"})]}),children:e.jsxs("form",{id:"aqp-upload-quotation-form",className:"aqp-upload-form",onSubmit:aa,children:[e.jsx("div",{className:"aqp-upload-note",children:"Please select the account from the Account List popup before saving the uploaded quotation."}),e.jsxs("div",{className:"aqp-upload-grid",children:[e.jsxs("label",{className:"aqp-form-field aqp-upload-grid__full",children:[e.jsx("span",{className:"aqp-form-label aqp-form-label--required",children:"Select Account"}),e.jsxs("div",{className:"aqp-upload-account-picker",children:[e.jsx("input",{className:`aqp-upload-input${S.selectedAccountId?" aqp-upload-input--error":""}`,value:p.selectedAccountLabel,placeholder:"Click the search icon to select an account",readOnly:!0}),e.jsx("button",{type:"button",className:"aqp-upload-account-button",onClick:Ht,"aria-label":"Search accounts",children:e.jsx($a,{})})]}),S.selectedAccountId?e.jsx("div",{className:"aqp-form-error",children:S.selectedAccountId}):null]}),ce?e.jsxs("div",{className:"aqp-upload-account-card aqp-upload-grid__full",children:[e.jsx("div",{className:"aqp-upload-account-note",children:"Please double click on another account in the list if you want to change this selection."}),e.jsxs("div",{className:"aqp-upload-account-grid",children:[e.jsxs("div",{className:"aqp-upload-account-item",children:[e.jsx("span",{className:"aqp-upload-account-item-label",children:"Account No."}),e.jsx("span",{className:"aqp-upload-account-item-value",children:ce.accountNumber||"-"})]}),e.jsxs("div",{className:"aqp-upload-account-item",children:[e.jsx("span",{className:"aqp-upload-account-item-label",children:"Account Name"}),e.jsx("span",{className:"aqp-upload-account-item-value",children:ce.name||"-"})]}),e.jsxs("div",{className:"aqp-upload-account-item",children:[e.jsx("span",{className:"aqp-upload-account-item-label",children:"Email"}),e.jsx("span",{className:"aqp-upload-account-item-value",children:p.email||"-"})]}),e.jsxs("div",{className:"aqp-upload-account-item",children:[e.jsx("span",{className:"aqp-upload-account-item-label",children:"Phone"}),e.jsx("span",{className:"aqp-upload-account-item-value",children:p.phone||"-"})]}),e.jsxs("div",{className:"aqp-upload-account-item",children:[e.jsx("span",{className:"aqp-upload-account-item-label",children:"Account Owner"}),e.jsx("span",{className:"aqp-upload-account-item-value",children:p.accountOwner||"-"})]}),e.jsxs("div",{className:"aqp-upload-account-item aqp-upload-account-item--wide",children:[e.jsx("span",{className:"aqp-upload-account-item-label",children:"Address"}),e.jsx("span",{className:"aqp-upload-account-item-value",children:p.address||"-"})]})]})]}):null,e.jsxs("label",{className:"aqp-form-field",children:[e.jsx("span",{className:"aqp-form-label aqp-form-label--required",children:"Quote Number"}),e.jsx("input",{className:`aqp-upload-input${S.quoteNumber?" aqp-upload-input--error":""}`,value:p.quoteNumber,onChange:a=>F("quoteNumber",a.target.value)}),S.quoteNumber?e.jsx("div",{className:"aqp-form-error",children:S.quoteNumber}):null]}),e.jsxs("label",{className:"aqp-form-field",children:[e.jsx("span",{className:"aqp-form-label aqp-form-label--required",children:"Quotation Date"}),e.jsx("input",{type:"date",className:`aqp-upload-input${S.quotationDate?" aqp-upload-input--error":""}`,value:p.quotationDate,onChange:a=>F("quotationDate",a.target.value)}),S.quotationDate?e.jsx("div",{className:"aqp-form-error",children:S.quotationDate}):null]}),e.jsxs("label",{className:"aqp-form-field",children:[e.jsx("span",{className:"aqp-form-label aqp-form-label--required",children:"Total Amount"}),e.jsxs("div",{className:"aqp-upload-field-inline",children:[e.jsx("input",{type:"number",min:"0",step:"0.01",className:`aqp-upload-input${S.totalAmount?" aqp-upload-input--error":""}`,value:p.totalAmount,onChange:a=>F("totalAmount",a.target.value)}),e.jsx("select",{className:"aqp-upload-select aqp-upload-select--currency",value:p.amountCurrency,onChange:a=>F("amountCurrency",a.target.value),children:Ot.map(a=>e.jsx("option",{value:a.value,children:a.label},a.value))})]}),S.totalAmount?e.jsx("div",{className:"aqp-form-error",children:S.totalAmount}):null]}),e.jsxs("label",{className:"aqp-form-field",children:[e.jsx("span",{className:"aqp-form-label",children:"Total Product Tax"}),e.jsxs("div",{className:"aqp-upload-field-inline",children:[e.jsx("input",{type:"number",min:"0",step:"0.01",className:"aqp-upload-input",value:p.totalProductTax,onChange:a=>F("totalProductTax",a.target.value)}),e.jsx("select",{className:"aqp-upload-select aqp-upload-select--currency",value:p.taxCurrency,onChange:a=>F("taxCurrency",a.target.value),children:Ot.map(a=>e.jsx("option",{value:a.value,children:a.label},a.value))})]})]}),e.jsxs("label",{className:"aqp-form-field",children:[e.jsx("span",{className:"aqp-form-label aqp-form-label--required",children:"Quotation Status"}),e.jsx("select",{className:`aqp-upload-select${S.quotationStatus?" aqp-upload-select--error":""}`,value:p.quotationStatus,onChange:a=>F("quotationStatus",a.target.value),children:Ba.map(a=>e.jsx("option",{value:a.value,children:a.label},a.value||"select"))}),S.quotationStatus?e.jsx("div",{className:"aqp-form-error",children:S.quotationStatus}):null]}),e.jsxs("label",{className:"aqp-form-field",children:[e.jsx("span",{className:"aqp-form-label",children:"Valid Until Date"}),e.jsx("input",{type:"date",className:"aqp-upload-input",value:p.validUntilDate,onChange:a=>F("validUntilDate",a.target.value)})]}),e.jsxs("label",{className:"aqp-form-field",children:[e.jsx("span",{className:"aqp-form-label",children:"Contact Person"}),e.jsx("input",{className:"aqp-upload-input",value:p.contactPerson,onChange:a=>F("contactPerson",a.target.value)})]}),e.jsxs("label",{className:"aqp-form-field aqp-upload-grid__full",children:[e.jsx("span",{className:"aqp-form-label",children:"Address"}),e.jsx("textarea",{className:"aqp-textarea",rows:3,value:p.address,onChange:a=>F("address",a.target.value)})]}),e.jsxs("label",{className:"aqp-form-field",children:[e.jsx("span",{className:"aqp-form-label",children:"Email"}),e.jsx("input",{className:"aqp-upload-input",value:p.email,onChange:a=>F("email",a.target.value)})]}),e.jsxs("label",{className:"aqp-form-field",children:[e.jsx("span",{className:"aqp-form-label",children:"Phone"}),e.jsx("input",{className:"aqp-upload-input",value:p.phone,onChange:a=>F("phone",a.target.value)})]}),e.jsxs("label",{className:"aqp-form-field aqp-upload-grid__full",children:[e.jsx("span",{className:"aqp-form-label aqp-form-label--required",children:"Quote File"}),e.jsx("input",{type:"file",accept:".pdf,.xls,.xlsx,application/pdf,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",className:`aqp-upload-file-input${S.quoteFile?" aqp-upload-file-input--error":""}`,onChange:ta}),e.jsx("div",{className:"aqp-upload-file-note",children:"Allowed file types: PDF, XLS, XLSX. Maximum size: 5 MB."}),p.quoteFileName?e.jsx("div",{className:"aqp-upload-file-name",children:p.quoteFileName}):null,S.quoteFile?e.jsx("div",{className:"aqp-form-error",children:S.quoteFile}):null]})]}),gt?e.jsx("div",{className:"aqp-upload-message",children:gt}):null]})}):null,fe&&Ve?e.jsx(G,{title:"Account List",onClose:()=>M(!1),size:"aqp-modal--xl",children:e.jsxs("div",{className:"aqp-account-list",children:[e.jsx("div",{className:"aqp-account-list-note",children:"Please double click on the account to select a account."}),e.jsx("div",{className:"aqp-account-list-table-wrap",children:e.jsxs("table",{className:"aqp-account-list-table",children:[e.jsxs("thead",{children:[e.jsxs("tr",{className:"aqp-account-list-header-row",children:[e.jsx("th",{children:"Account No."}),e.jsx("th",{children:"Account Name"}),e.jsx("th",{children:"Email"}),e.jsx("th",{children:"Phone"}),e.jsx("th",{children:"Account Owner"})]}),e.jsxs("tr",{className:"aqp-account-list-search-row",children:[e.jsx("th",{children:e.jsx("input",{className:"aqp-account-list-search-input",value:K.accountNumber,onChange:a=>qe("accountNumber",a.target.value),placeholder:"Search here ..."})}),e.jsx("th",{children:e.jsx("input",{className:"aqp-account-list-search-input",value:K.name,onChange:a=>qe("name",a.target.value),placeholder:"Search here ..."})}),e.jsx("th",{children:e.jsx("input",{className:"aqp-account-list-search-input",value:K.email,onChange:a=>qe("email",a.target.value),placeholder:"Search here ..."})}),e.jsx("th",{children:e.jsx("input",{className:"aqp-account-list-search-input",value:K.phone,onChange:a=>qe("phone",a.target.value),placeholder:"Search here ..."})}),e.jsx("th",{children:e.jsx("input",{className:"aqp-account-list-search-input",value:K.accountOwner,onChange:a=>qe("accountOwner",a.target.value),placeholder:"Search here ..."})})]})]}),e.jsx("tbody",{children:qt.length>0?qt.map(a=>e.jsxs("tr",{className:`aqp-account-list-row${p.selectedAccountId===a.id?" aqp-account-list-row--selected":""}`,onDoubleClick:()=>ea(a),children:[e.jsx("td",{children:a.accountNumber||"-"}),e.jsx("td",{children:a.name||"-"}),e.jsx("td",{children:a.email||"-"}),e.jsx("td",{children:a.phone||"-"}),e.jsx("td",{children:a.accountOwnerDisplay||a.accountOwner||"-"})]},a.id)):e.jsx("tr",{children:e.jsx("td",{colSpan:"5",className:"aqp-account-list-empty",children:"No accounts found."})})})]})}),e.jsxs("div",{className:"aqp-account-list-pagination",children:[e.jsxs("span",{className:"aqp-account-list-total",children:["Total records: ",ye.length]}),e.jsxs("div",{className:"aqp-account-list-pagination-actions",children:[e.jsx("button",{type:"button",className:"aqp-account-list-page-button",onClick:()=>Z(a=>Math.max(1,a-1)),disabled:W===1,children:"prev"}),Xt.map(a=>e.jsx("button",{type:"button",className:`aqp-account-list-page-button${a===W?" aqp-account-list-page-button--active":""}`,onClick:()=>Z(a),children:a},a)),e.jsx("button",{type:"button",className:"aqp-account-list-page-button",onClick:()=>Z(a=>Math.min(de,a+1)),disabled:W===de,children:"next"})]})]})]})}):null,Qe?e.jsx(G,{title:`Quotation Preview - ${Qe.quotationNumber}`,onClose:()=>Ge(null),size:"aqp-modal--xl",footer:e.jsxs(e.Fragment,{children:[e.jsx("button",{type:"button",className:"aqp-btn aqp-btn--gray",onClick:()=>Ge(null),children:"Close"}),e.jsxs("button",{type:"button",className:"aqp-btn aqp-btn--gray",onClick:()=>he(Qe),children:[e.jsx(lt,{className:"aqp-btn-icon"}),"Print"]}),ga.some(a=>a.key==="pdf")?e.jsx("button",{type:"button",className:"aqp-btn aqp-btn--blue",onClick:()=>{const a=ne;Ge(null),na(a)},children:"View As PDF"}):null]}),children:e.jsx(Ue,{documentData:Qe})}):null,$e?e.jsxs(G,{title:`View Quotation - ${$e.quotationNumber}`,onClose:_t,size:"aqp-modal--xl",children:[e.jsx("div",{className:"aqp-view-top-actions",children:e.jsxs("div",{className:"aqp-modal-footer-group",children:[e.jsx("button",{type:"button",className:"aqp-btn aqp-btn--gray",onClick:_t,children:"Close"}),e.jsxs("button",{type:"button",className:"aqp-btn aqp-btn--blue",onClick:()=>he($e),children:[e.jsx(lt,{className:"aqp-btn-icon"}),"Print"]})]})}),e.jsx("div",{className:"aqp-view-quotation-document",children:e.jsx(Ue,{documentData:$e,editable:!0,onEditField:xa})})]}):null,C?e.jsx(G,{title:`View Account - ${C.company}`,onClose:()=>jt(null),size:"aqp-modal--lg",footer:e.jsx("button",{type:"button",className:"aqp-btn aqp-btn--gray",onClick:()=>jt(null),children:"Close"}),children:e.jsxs("div",{className:"aqp-account",children:[e.jsxs("div",{className:"aqp-account__grid",children:[e.jsxs("div",{children:[e.jsx("strong",{children:"Account No.:"})," ",R((g==null?void 0:g.accountNumber)||C.raw.clientAccountNumber)]}),e.jsxs("div",{children:[e.jsx("strong",{children:"Account Name:"})," ",R((g==null?void 0:g.name)||C.company)]}),e.jsxs("div",{children:[e.jsx("strong",{children:"Email:"})," ",R((g==null?void 0:g.email)||C.raw.email)]}),e.jsxs("div",{children:[e.jsx("strong",{children:"Phone:"})," ",R((g==null?void 0:g.phone)||C.raw.telephone)]}),e.jsxs("div",{children:[e.jsx("strong",{children:"Account Owner:"})," ",R((g==null?void 0:g.accountOwnerDisplay)||(g==null?void 0:g.accountOwner)||C.raw.selectedAccountOwner)]}),e.jsxs("div",{children:[e.jsx("strong",{children:"GSTIN:"})," ",R((g==null?void 0:g.gstin)||C.raw.gstin)]}),e.jsxs("div",{children:[e.jsx("strong",{children:"State Code:"})," ",R((g==null?void 0:g.stateCode)||C.raw.stateCode)]}),e.jsxs("div",{children:[e.jsx("strong",{children:"Contact Person:"})," ",R((g==null?void 0:g.contactPerson)||C.raw.contactPerson)]})]}),e.jsxs("div",{className:"aqp-account__section",children:[e.jsx("h3",{children:"Address"}),e.jsx("p",{children:R((g==null?void 0:g.address)||C.raw.clientAddressDetails)})]}),e.jsxs("div",{className:"aqp-account__section",children:[e.jsx("h3",{children:"Related Quotations"}),Pt.length===0?e.jsx("p",{children:"No related quotations found."}):e.jsxs("table",{className:"aqp-account__table",children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{children:"Quotation No."}),e.jsx("th",{children:"Date"}),e.jsx("th",{children:"Status"}),e.jsx("th",{children:"Amount"})]})}),e.jsx("tbody",{children:Pt.map(a=>e.jsxs("tr",{onClick:()=>Le(a),title:`Click to view ${a.num}`,children:[e.jsx("td",{className:"aqp-account__table-cell--num",children:e.jsx("button",{type:"button",className:`aqp-num-badge aqp-num-badge--button ${ct(a.status)}`,onClick:n=>{n.stopPropagation(),Le(a)},children:a.num})}),e.jsx("td",{children:a.date}),e.jsx("td",{children:a.statusLabel}),e.jsx("td",{children:a.amountLabel})]},a.id))})]})]})]})}):null,X?e.jsx(G,{title:"Approve Quote",onClose:()=>Ze(null),footer:e.jsxs(e.Fragment,{children:[e.jsx("button",{type:"button",className:"aqp-btn aqp-btn--gray",onClick:()=>Ze(null),disabled:le===X.id,children:"Cancel"}),e.jsx("button",{type:"button",className:"aqp-btn aqp-btn--blue",onClick:ma,disabled:le===X.id,children:le===X.id?"Approving...":"Approve"})]}),children:e.jsx("p",{children:"Are you sure you want to approve this quote?"})}):null,Y?e.jsxs(G,{title:"Reject Quote",onClose:()=>{Xe(null),je(""),Fe("")},footer:e.jsxs(e.Fragment,{children:[e.jsx("button",{type:"button",className:"aqp-btn aqp-btn--gray",onClick:()=>{Xe(null),je(""),Fe("")},disabled:le===Y.id,children:"Cancel"}),e.jsx("button",{type:"button",className:"aqp-btn aqp-btn--blue",onClick:ha,disabled:le===Y.id,children:le===Y.id?"Rejecting...":"Reject Quote"})]}),children:[e.jsxs("label",{className:"aqp-form-field",children:[e.jsx("span",{className:"aqp-form-label",children:"Rejection Reason"}),e.jsx("textarea",{className:`aqp-textarea${Ee?" aqp-textarea--error":""}`,rows:5,value:vt,onChange:a=>{Fe(a.target.value),Ee&&je("")},placeholder:"Enter rejection reason"})]}),Ee?e.jsx("div",{className:"aqp-form-error",children:Ee}):null]}):null]}):null},cs=Object.freeze(Object.defineProperty({__proto__:null,ACTIONS:ht,ModalShell:G,QuotationDocument:Ue,QuotationPdfViewer:Kt,StatusBadge:Gt,buildPrintableHtml:Bt,buildQuotationDocumentData:ke,buildQuotationViewExportOptions:ns,buildVisiblePages:ut,default:rs,formatListDate:Ut,formatStatusLabel:Se,getActionBadgeClassName:ct,getAllowedQuotationActions:dt,getStatusClassName:Mt,resolveLinkedAccount:Vt,safeLower:q,toNumber:w,triggerBrowserPdfSave:he},Symbol.toStringTag,{value:"Module"}));export{ht as A,G as M,Kt as Q,Gt as S,Ut as a,ke as b,Ue as c,He as d,ut as e,Se as f,ct as g,cs as h,Vt as r,q as s,he as t};
