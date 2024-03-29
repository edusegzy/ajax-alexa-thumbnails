/**
 * Ajax Alexa Thumbnails - 0.4
 * 
 * @author		Eric Ferraiuolo <eferraiuolo@gmail.com>
 * @copyright	2008 Eric Ferraiuolo
 * @license		GNU LGPL <http://www.gnu.org/licenses/lgpl.html>
 */


YAHOO.namespace("EDF.Thumbnail");YAHOO.EDF.Thumbnail=function(){var F=YAHOO.lang;var I=YAHOO.util.Connect;var C={source:null,size:"Small",anchor:true};var G=null;var D=false;var H=null;var B=null;function J(K){function L(N){return(N.indexOf("http://")===0?true:false);}var M=L(K)?7:0;return K.substring(M,K.indexOf("/",M)>=M?K.indexOf("/",M):K.length);}function A(L,N){var K=document.createElement("img");K.setAttribute("alt",L);K.setAttribute("src",N);var M;if(G.anchor){M=document.createElement("a");M.setAttribute("href",L);M.appendChild(K);}else{M=K;}return M;}var E={init:function(K){if(F.isString(K.source)){H={};B={};G=F.merge(C,(K||{}));D=true;}else{D=false;}return this;},getThumbnail:function(L,N){if(!D){return this;}if(!F.isString(L)){return this;}if(!F.isFunction(N)){return this;}var K=J(L);if(K in B){N(A(L,B[K]));}else{if(K in H){H[K].push(N);}else{H[K]=[N];var M=G.source+"?url="+L+"&size="+G.size.substr(0,1).toUpperCase()+G.size.substr(1);I.asyncRequest("GET",M,{success:function(O){B[K]=O.responseText;while(H[K].length>0){H[K].shift()(A(L,B[K]));}delete H[K];},failure:function(O){N(null);}});}}return this;}};return E;}();YAHOO.register("EDF.Thumbnail",YAHOO.EDF.Thumbnail,{version:"0.4",build:"1"});