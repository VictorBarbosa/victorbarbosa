import{c as x,d as y,e as I}from"./chunk-UJQTAKBF.js";import"./chunk-WMEG6PAA.js";import{b as w}from"./chunk-Q7UXK23U.js";import{h as k,i as h}from"./chunk-H3GX5QFY.js";import{b as g}from"./chunk-MCRJI3T3.js";import{b as f,c as O}from"./chunk-IXHHFXOK.js";import{c as o,d as C,g as S,h as A,k as E}from"./chunk-5HD7INVB.js";import{e as u}from"./chunk-VKCBYPZP.js";var V=":host{display:-ms-flexbox;display:flex;position:relative;-ms-flex-align:center;align-items:center;-ms-flex-pack:center;justify-content:center;max-width:100%;height:200px;font-size:22px;text-align:center}.assistive-focusable{left:0;right:0;top:0;bottom:0;position:absolute;z-index:1;pointer-events:none}.assistive-focusable:focus{outline:none}.picker-opts{-webkit-padding-start:16px;padding-inline-start:16px;-webkit-padding-end:16px;padding-inline-end:16px;padding-top:0px;padding-bottom:0px;min-width:26px;max-height:200px;outline:none;text-align:inherit;-webkit-scroll-snap-type:y mandatory;-ms-scroll-snap-type:y mandatory;scroll-snap-type:y mandatory;overflow-x:hidden;overflow-y:scroll;scrollbar-width:none}.picker-item-empty{padding-left:0;padding-right:0;padding-top:0;padding-bottom:0;margin-left:0;margin-right:0;margin-top:0;margin-bottom:0;display:block;width:100%;height:34px;border:0px;outline:none;background:transparent;color:inherit;font-family:var(--ion-font-family, inherit);font-size:inherit;line-height:34px;text-align:inherit;text-overflow:ellipsis;white-space:nowrap;overflow:hidden}.picker-opts::-webkit-scrollbar{display:none}::slotted(ion-picker-column-option){display:block;scroll-snap-align:center}.picker-item-empty,:host(:not([disabled])) ::slotted(ion-picker-column-option.option-disabled){scroll-snap-align:none}::slotted([slot=prefix]),::slotted([slot=suffix]){max-width:200px;text-overflow:ellipsis;white-space:nowrap;overflow:hidden}::slotted([slot=prefix]){-webkit-padding-start:16px;padding-inline-start:16px;-webkit-padding-end:16px;padding-inline-end:16px;padding-top:0;padding-bottom:0;-ms-flex-pack:end;justify-content:end}::slotted([slot=suffix]){-webkit-padding-start:16px;padding-inline-start:16px;-webkit-padding-end:16px;padding-inline-end:16px;padding-top:0;padding-bottom:0;-ms-flex-pack:start;justify-content:start}:host(.picker-column-disabled) .picker-opts{overflow-y:hidden}:host(.picker-column-disabled) ::slotted(ion-picker-column-option){cursor:default;opacity:0.4;pointer-events:none}@media (any-hover: hover){:host(:focus) .picker-opts{outline:none;background:rgba(var(--ion-color-base-rgb), 0.2)}}",N=V,M=class{constructor(s){E(this,s),this.ionChange=A(this,"ionChange",7),this.isScrolling=!1,this.isColumnVisible=!1,this.canExitInputMode=!0,this.updateValueTextOnScroll=!1,this.centerPickerItemInView=(e,t=!0,i=!0)=>{let{isColumnVisible:n,scrollEl:a}=this;if(n&&a){let l=e.offsetTop-3*e.clientHeight+e.clientHeight/2;a.scrollTop!==l&&(this.canExitInputMode=i,this.updateValueTextOnScroll=!1,a.scroll({top:l,left:0,behavior:t?"smooth":void 0}))}},this.setPickerItemActiveState=(e,t)=>{t?e.classList.add(m):e.classList.remove(m)},this.inputModeChange=e=>{if(!this.numericInput)return;let{useInputMode:t,inputModeColumn:i}=e.detail,n=i===void 0||i===this.el;if(!t||!n){this.setInputModeActive(!1);return}this.setInputModeActive(!0)},this.setInputModeActive=e=>{if(this.isScrolling){this.scrollEndCallback=()=>{this.isActive=e};return}this.isActive=e},this.initializeScrollListener=()=>{let e=f("ios"),{el:t,scrollEl:i}=this,n,a=this.activeItem,l=()=>{h(()=>{var p;if(!i)return;n&&(clearTimeout(n),n=void 0),this.isScrolling||(e&&x(),this.isScrolling=!0);let c=i.getBoundingClientRect(),P=c.x+c.width/2,L=c.y+c.height/2,b=t.getRootNode(),v=b instanceof ShadowRoot?b:g;if(v===void 0)return;let r=v.elementsFromPoint(P,L).find(d=>d.tagName==="ION-PICKER-COLUMN-OPTION");a!==void 0&&this.setPickerItemActiveState(a,!1),!(r===void 0||r.disabled)&&(r!==a&&(e&&y(),this.canExitInputMode&&this.exitInputMode()),a=r,this.setPickerItemActiveState(r,!0),this.updateValueTextOnScroll&&((p=this.assistiveFocusable)===null||p===void 0||p.setAttribute("aria-valuetext",this.getOptionValueText(r))),n=setTimeout(()=>{this.isScrolling=!1,this.updateValueTextOnScroll=!0,e&&I();let{scrollEndCallback:d}=this;d&&(d(),this.scrollEndCallback=void 0),this.canExitInputMode=!0,this.setValue(r.value)},250))})};h(()=>{i&&(i.addEventListener("scroll",l),this.destroyScrollListener=()=>{i.removeEventListener("scroll",l)})})},this.exitInputMode=()=>{let{parentEl:e}=this;e!=null&&(e.exitInputMode(),this.el.classList.remove("picker-column-active"))},this.findNextOption=(e=1)=>{let{activeItem:t}=this;if(!t)return null;let i=t,n=t.nextElementSibling;for(;n!=null;){if(e>0&&e--,n.tagName==="ION-PICKER-COLUMN-OPTION"&&!n.disabled&&e===0)return n;i=n,n=n.nextElementSibling}return i},this.findPreviousOption=(e=1)=>{let{activeItem:t}=this;if(!t)return null;let i=t,n=t.previousElementSibling;for(;n!=null;){if(e>0&&e--,n.tagName==="ION-PICKER-COLUMN-OPTION"&&!n.disabled&&e===0)return n;i=n,n=n.previousElementSibling}return i},this.onKeyDown=e=>{let t=f("mobile"),i=null;switch(e.key){case"ArrowDown":i=t?this.findPreviousOption():this.findNextOption();break;case"ArrowUp":i=t?this.findNextOption():this.findPreviousOption();break;case"PageUp":i=t?this.findNextOption(5):this.findPreviousOption(5);break;case"PageDown":i=t?this.findPreviousOption(5):this.findNextOption(5);break;case"Home":i=this.el.querySelector("ion-picker-column-option:first-of-type");break;case"End":i=this.el.querySelector("ion-picker-column-option:last-of-type");break}i!==null&&(this.setValue(i.value),e.preventDefault())},this.getOptionValueText=e=>{var t;return e?(t=e.getAttribute("aria-label"))!==null&&t!==void 0?t:e.innerText:""},this.renderAssistiveFocusable=()=>{let{activeItem:e}=this,t=this.getOptionValueText(e);return o("div",{ref:i=>this.assistiveFocusable=i,class:"assistive-focusable",role:"slider",tabindex:this.disabled?void 0:0,"aria-label":this.ariaLabel,"aria-valuemin":0,"aria-valuemax":0,"aria-valuenow":0,"aria-valuetext":t,"aria-orientation":"vertical",onKeyDown:i=>this.onKeyDown(i)})},this.ariaLabel=null,this.isActive=!1,this.disabled=!1,this.value=void 0,this.color="primary",this.numericInput=!1}ariaLabelChanged(s){this.ariaLabel=s}valueChange(){this.isColumnVisible&&this.scrollActiveItemIntoView(!0)}componentWillLoad(){let s=this.parentEl=this.el.closest("ion-picker"),e=t=>{if(t[t.length-1].isIntersecting){let{activeItem:n,el:a}=this;this.isColumnVisible=!0;let l=k(a).querySelector(`.${m}`);l&&this.setPickerItemActiveState(l,!1),this.scrollActiveItemIntoView(),n&&this.setPickerItemActiveState(n,!0),this.initializeScrollListener()}else this.isColumnVisible=!1,this.destroyScrollListener&&(this.destroyScrollListener(),this.destroyScrollListener=void 0)};new IntersectionObserver(e,{threshold:.001,root:this.parentEl}).observe(this.el),s!==null&&s.addEventListener("ionInputModeChange",t=>this.inputModeChange(t))}componentDidRender(){let{el:s,activeItem:e,isColumnVisible:t,value:i}=this;if(t&&!e){let n=s.querySelector("ion-picker-column-option");n!==null&&n.value!==i&&this.setValue(n.value)}}scrollActiveItemIntoView(s=!1){return u(this,null,function*(){let e=this.activeItem;e&&this.centerPickerItemInView(e,s,!1)})}setValue(s){return u(this,null,function*(){this.disabled===!0||this.value===s||(this.value=s,this.ionChange.emit({value:s}))})}setFocus(){return u(this,null,function*(){this.assistiveFocusable&&this.assistiveFocusable.focus()})}connectedCallback(){var s;this.ariaLabel=(s=this.el.getAttribute("aria-label"))!==null&&s!==void 0?s:"Select a value"}get activeItem(){let{value:s}=this;return Array.from(this.el.querySelectorAll("ion-picker-column-option")).find(t=>!this.disabled&&t.disabled?!1:t.value===s)}render(){let{color:s,disabled:e,isActive:t,numericInput:i}=this,n=O(this);return o(C,{key:"d60736ce74c0e8c774a163272b78fbad32993ec2",class:w(s,{[n]:!0,"picker-column-active":t,"picker-column-numeric-input":i,"picker-column-disabled":e})},this.renderAssistiveFocusable(),o("slot",{key:"74611112ef154b343ae29a773f8cd8a01cc1447d",name:"prefix"}),o("div",{key:"af772d2b61b7eb41a567593d290b80a50b7caa72","aria-hidden":"true",class:"picker-opts",ref:a=>{this.scrollEl=a},tabIndex:-1},o("div",{key:"4b646ee97bcf8ed541b9798c91dff189eec41dd1",class:"picker-item-empty","aria-hidden":"true"},"\xA0"),o("div",{key:"a44d1a10d20a13aeb47f9871b09e291aa7f216bd",class:"picker-item-empty","aria-hidden":"true"},"\xA0"),o("div",{key:"6a481715bd68fa68dc2a76c2e867ce771ea680b0",class:"picker-item-empty","aria-hidden":"true"},"\xA0"),o("slot",{key:"23236e731b1ad432c104761ebeec91697a6b7643"}),o("div",{key:"58a6c1f35a3ff0b26acaceebfd477d74b6dcfd6d",class:"picker-item-empty","aria-hidden":"true"},"\xA0"),o("div",{key:"ea864872dec6dc363406d1bd9101b1bf21944db6",class:"picker-item-empty","aria-hidden":"true"},"\xA0"),o("div",{key:"28cc4c570d0dd59f491eef2b15a5ed706d28b7bb",class:"picker-item-empty","aria-hidden":"true"},"\xA0")),o("slot",{key:"cff1cc0bea732a5ce22bb451c5ea404a84af1993",name:"suffix"}))}get el(){return S(this)}static get watchers(){return{"aria-label":["ariaLabelChanged"],value:["valueChange"]}}},m="option-active";M.style=N;export{M as ion_picker_column};
