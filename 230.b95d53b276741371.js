(()=>{"use strict";var u,d={230:(u,m,T)=>{class S extends class R{constructor(){this.hidden=!0}}{static create(e,t,n){const i=new S;return i.color=e,i.containerIndex=t,i.hidden=n,i}}class o{constructor(){this.resolved=!1,this._size=0,this.items=[],this.selected=!1}getTopColorCount(){return o.getTopColorCount(this)}static getTopColorCount(e){if(o.isEmpty(e))return 0;let t=1;const n=o.peek(e);let i=o.size(e)-2;for(;i>=0&&e.items[i].color===n;)t++,i--;return t}peek(){return o.peek(this)}static peek(e){const t=o.size(e);if(0==t)throw Error("Container is empty.");return e.items[t-1].color}size(){return this._size}static size(e){return e._size}pop(){return o.pop(this)}static pop(e){const t=e.size();if(0==t)throw Error("Container is empty.");const n=e.items[t-1].color;return e.items[t-1].color=void 0,o.afterChange(e),n}push(e){o.push(this,e)}static push(e,t){const n=o.size(e);if(4==n)throw Error("Size limit exists.");e.items[n].color=t,o.afterChange(e)}isEmpty(){return o.isEmpty(this)}static isEmpty(e){return void 0===e.items[0].color}isFull(){return o.isFull(this)}static isFull(e){return 4===o.size(e)}static afterChange(e){o.calculateSize(e),o.checkResolved(e)}static calculateSize(e){e._size=e.items.findIndex(t=>void 0===t.color),-1===e._size&&(e._size=4)}static checkResolved(e){e.resolved=4===o.size(e)&&e.items.every(t=>t.color===o.peek(e))}static create(e){const t=new o;t.index=e;for(let n=0;n<4;n++)t.items.push(S.create(void 0,e,!1));return o.afterChange(t),t}static isResolved(e){return e.resolved}static equals(e,t){if(o.size(e)!==o.size(t))return!1;for(let n=0;n<o.size(e);n++)if(e.items[n].color!==t.items[n].color)return!1;return!0}static hasOnlyThreeOfOneColor(e){return 3===o.size(e)&&e.items[0].color===e.items[1].color&&e.items[0].color===e.items[2].color}static hasOnlyTwoOfOneColor(e){return 2===o.size(e)&&e.items[0].color===e.items[1].color}static hasOnlyOneOfOneColor(e){return 1===o.size(e)}static hasOnlyOneColor(e){return!o.isEmpty(e)&&e.items.every(t=>void 0===t.color||t.color===e.items[0].color)}static containerClone(e){const t=o.create(e.index);return e.items.forEach((n,i)=>t.items[i].color=n.color),o.afterChange(t),t}static containersClone(e){return e.map(t=>o.containerClone(t))}}class I{constructor(){this.containers=[]}}function C(s){let e=!0,t=0;for(;t<s.containers.length;){let n=s.containers[t];o.isEmpty(n)?t++:o.isResolved(n)?s.containers.splice(t,1):(e=!1,t++)}return e}function N(s){const e=new I;return e.containers=s.containers.map(t=>o.containerClone(t)),e}function z(s,e){return s.containers.filter(t=>o.equals(t,e)).length}function k(s,e){return s.some(t=>function x(s,e){if(s.containers.length!==e.containers.length)return!1;for(let t=0;t<s.containers.length;t++)if(z(e,s.containers[t])!==z(s,s.containers[t]))return!1;return!0}(t,e))}function O(s,e){e instanceof I?k(s,e)||s.push(e):s=[...s,...e]}class a{constructor(e,t,n){this.notes="",this.iFrom=e,this.iTo=t,this.color=n}clone(){const e=new a(this.iFrom,this.iTo,this.color);return e.notes=this.notes,e}equals(e){return this.iFrom===e.iFrom&&this.iTo===e.iTo&&this.color===e.color}}var h=(()=>{return(s=h||(h={}))[s.CANCEL=0]="CANCEL",s[s.NO_SOLUTION=1]="NO_SOLUTION",s[s.SOLUTION=2]="SOLUTION",s[s.BEST_SOLUTION=3]="BEST_SOLUTION",h;var s})();class g{constructor(){this.stepCount=0,this.oldBoards=[],this.steps=[]}}function E(s,e,t,n,i){s=N(s);for(let r=0;r<n;r++)o.push(s.containers[t],o.pop(s.containers[e])),i.steps.push(new a(s.containers[e].index,s.containers[t].index,s.containers[t].items[o.size(s.containers[t])-1].color));return i.board=s,i.stepCount=i.stepCount+n,O(i.oldBoards,s),s}class M{constructor(){this.steps=[]}}class Z{constructor(){this.solutions=[]}}class G{constructor(){this.containers=[],this.oldBoards=[],this.steps=[],this.solutions=new Z,this.bestSolution=void 0,this.counter=0,this.logicFunctions=[]}}function F(s,e,t){if(s.counter++,C(e))return void L(s);const n=function $(s,e){const t=new g;let n=!0;for(;n;)n=!1,s.logicFunctions.forEach(i=>{const r=i(e);r.stepCount>0&&(n=!0,e=r.board,t.stepCount=t.stepCount+r.stepCount,O(t.oldBoards,r.oldBoards),t.steps=[...t.steps,...r.steps])});return t.board=e,t}(s,e);if(n.stepCount>0&&(e=n.board,t+=n.stepCount,O(s.oldBoards,n.oldBoards),s.steps=[...s.steps,...n.steps],C(e)))L(s);else for(let i=0;i<e.containers.length;i++)for(let r=0;r<e.containers.length;r++)i!==r&&K(s,e,i,r,t)}function K(s,e,t,n,i){o.isEmpty(e.containers[t])||o.isFull(e.containers[n])||!o.isEmpty(e.containers[n])&&o.peek(e.containers[t])!=o.peek(e.containers[n])||1==o.size(e.containers[t])&&o.isEmpty(e.containers[n])||o.hasOnlyThreeOfOneColor(e.containers[t])||o.hasOnlyOneColor(e.containers[t])&&o.isEmpty(e.containers[n])||(e=function H(s,e,t){return s=N(s),o.push(s.containers[t],o.pop(s.containers[e])),s}(e,t,n),!k(s.oldBoards,e)&&(s.steps.push(new a(e.containers[t].index,e.containers[n].index,e.containers[n].items[o.size(e.containers[n])-1].color)),O(s.oldBoards,e),F(s,e,i+1),function J(s,e){for(;s.steps.length>e;)s.steps.pop()}(s,i)))}function L(s){const e=function Q(s){const e=s.steps;let r=0,p=!0;for(;p;){for(p=!1,r=0;r<e.length-1;){let c=r+1;for(;c<e.length&&(e[r].iFrom!==e[c].iTo||e[r].iTo!==e[c].iFrom)&&e[r].iFrom!==e[c].iFrom&&e[r].iFrom!==e[c].iTo&&e[r].iTo!==e[c].iFrom&&e[r].iTo!==e[c].iTo;)c++;c<e.length&&e[r].iFrom===e[c].iTo&&e[r].iTo===e[c].iFrom?(e.splice(c,1),e.splice(r,1),p=!0):r++}for(r=0;r<e.length-1;){let l=r+1;for(;l<e.length&&e[r].iTo!==e[l].iFrom;)l++;if(l<e.length&&e[r].iTo===e[l].iFrom){let c=l-1,v=!1;for(;r<c;){if((e[c].iFrom===e[l].iFrom||e[c].iFrom===e[l].iTo||e[c].iTo===e[l].iFrom||e[c].iTo===e[l].iTo)&&e[c].color!==e[l].color){v=!0;break}c--}!1===v?(e[r].iTo=e[l].iTo,e[r].notes="Updated by optimization 2",e.splice(l,1),p=!0):r++}else r++}for(r=0;r<e.length-1;)e[r].iFrom===e[r].iTo?(e.splice(r,1),p=!0):r++}return s}(function j(s){const e=new M;return e.steps=[],s.forEach(t=>e.steps.push(t.clone())),e}(s.steps));(function Y(s,e){return!s.solutions.some(t=>function q(s,e){if(s.steps.length!==e.steps.length)return!1;for(let t=0;t<s.steps.length;t++)if(!s.steps[t].equals(e.steps[t]))return!1;return!0}(t,e))&&(s.solutions.push(e),!0)})(s.solutions,e)&&(void 0===s.bestSolution||e.steps.length<s.bestSolution.steps.length)&&(s.bestSolution=e,w(h.SOLUTION,e))}function w(s,e){postMessage({result:s,solution:e})}addEventListener("message",({data:s})=>{!function X(s){const e=new G;e.containers=s,e.oldBoards=[],e.steps=[],e.solutions.solutions=[],e.bestSolution=void 0,e.counter=0,e.logicFunctions.push(function U(){return e=>{const t=new g;let n=!0;for(;n;){n=!1;for(let i=0;i<e.containers.length;i++)if(o.hasOnlyThreeOfOneColor(e.containers[i])){const r=s(e,e.containers[i].items[0].color,i);if(-1!==r){e=E(e,r,i,1,t),n=!0;break}}}return t};function s(e,t,n){for(let i=0;i<e.containers.length;i++)if(i!==n&&!o.isEmpty(e.containers[i])&&o.peek(e.containers[i])===t)return i;return-1}}()),e.logicFunctions.push(function B(){return e=>{const t=new g;let n=!0;for(;n;){n=!1;for(let i=0;i<e.containers.length;i++)if(o.hasOnlyTwoOfOneColor(e.containers[i])){const r=s(e,e.containers[i].items[0].color,i);if(-1!==r){e=E(e,r,i,2,t),n=!0;break}}}return t};function s(e,t,n){for(let i=0;i<e.containers.length;i++)if(i!==n&&o.size(e.containers[i])>1&&e.containers[i].items[o.size(e.containers[i])-1].color===t&&e.containers[i].items[o.size(e.containers[i])-2].color===t)return i;return-1}}()),e.logicFunctions.push(function y(){return e=>{const t=new g;let n=!0;for(;n;){n=!1;for(let i=0;i<e.containers.length;i++)if(o.hasOnlyOneOfOneColor(e.containers[i])){const r=s(e,e.containers[i].items[0].color,i);if(-1!==r){e=E(e,r,i,3,t),n=!0;break}}}return t};function s(e,t,n){for(let i=0;i<e.containers.length;i++)if(i!==n&&4==o.size(e.containers[i])&&e.containers[i].items[o.size(e.containers[i])-1].color===t&&e.containers[i].items[o.size(e.containers[i])-2].color===t&&e.containers[i].items[o.size(e.containers[i])-3].color===t)return i;return-1}}()),F(e,N(function A(s){const e=new I;return void 0!==s&&(e.containers=s,e.containers.forEach(t=>o.afterChange(t))),e}(e.containers)),0),void 0===e.bestSolution?w(h.NO_SOLUTION,void 0):w(h.BEST_SOLUTION,e.bestSolution)}(s)})}},f={};f.m=d,f.u=u=>u+".acfd0029abcdacc9.js",f.o=(u,m)=>Object.prototype.hasOwnProperty.call(u,m),f.tt=()=>(void 0===u&&(u={createScriptURL:m=>m},typeof trustedTypes<"u"&&trustedTypes.createPolicy&&(u=trustedTypes.createPolicy("angular#bundler",u))),u),f.tu=u=>f.tt().createScriptURL(u),f.p="",f.b=self.location+"",d[230](0,{},f)})();