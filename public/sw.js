if(!self.define){let e,s={};const a=(a,n)=>(a=new URL(a+".js",n).href,s[a]||new Promise((s=>{if("document"in self){const e=document.createElement("script");e.src=a,e.onload=s,document.head.appendChild(e)}else e=a,importScripts(a),s()})).then((()=>{let e=s[a];if(!e)throw new Error(`Module ${a} didn’t register its module`);return e})));self.define=(n,c)=>{const t=e||("document"in self?document.currentScript.src:"")||location.href;if(s[t])return;let i={};const r=e=>a(e,t),f={module:{uri:t},exports:i,require:r};s[t]=Promise.all(n.map((e=>f[e]||r(e)))).then((e=>(c(...e),i)))}}define(["./workbox-80ca14c3"],(function(e){"use strict";importScripts(),self.skipWaiting(),e.clientsClaim(),e.precacheAndRoute([{url:"/_next/static/OpOM7KuhM7TU0uljhrSxQ/_buildManifest.js",revision:"999f4ce1f87c2ed4208af6bfa0363ee5"},{url:"/_next/static/OpOM7KuhM7TU0uljhrSxQ/_ssgManifest.js",revision:"b6652df95db52feb4daf4eca35380933"},{url:"/_next/static/chunks/25e73069-4a515cdf22710e8d.js",revision:"4a515cdf22710e8d"},{url:"/_next/static/chunks/436-05f8d8efcb4d6803.js",revision:"05f8d8efcb4d6803"},{url:"/_next/static/chunks/503-4277b66f9b272aeb.js",revision:"4277b66f9b272aeb"},{url:"/_next/static/chunks/508-5ea478fe2a6e2775.js",revision:"5ea478fe2a6e2775"},{url:"/_next/static/chunks/77b6fc29-cffe6b9a0ec85bfa.js",revision:"cffe6b9a0ec85bfa"},{url:"/_next/static/chunks/914-f3cf0ac567767fbc.js",revision:"f3cf0ac567767fbc"},{url:"/_next/static/chunks/bb890685-5973c180fd3813a1.js",revision:"5973c180fd3813a1"},{url:"/_next/static/chunks/ce614c2e-cad399bda4510506.js",revision:"cad399bda4510506"},{url:"/_next/static/chunks/d8ec1434-88c0daf7eb277f9f.js",revision:"88c0daf7eb277f9f"},{url:"/_next/static/chunks/f05fa5e8-17eaf3829e71f9ea.js",revision:"17eaf3829e71f9ea"},{url:"/_next/static/chunks/framework-ac88a2a245aea9ab.js",revision:"ac88a2a245aea9ab"},{url:"/_next/static/chunks/main-e27bbefe99144e9e.js",revision:"e27bbefe99144e9e"},{url:"/_next/static/chunks/pages/404-95609d2d36dac0ed.js",revision:"95609d2d36dac0ed"},{url:"/_next/static/chunks/pages/_app-2fb80c1b3ed44caa.js",revision:"2fb80c1b3ed44caa"},{url:"/_next/static/chunks/pages/_error-d75eb46b4500d02f.js",revision:"d75eb46b4500d02f"},{url:"/_next/static/chunks/pages/chats-0189b6e03727b9b7.js",revision:"0189b6e03727b9b7"},{url:"/_next/static/chunks/pages/chats/chat/%5Bid%5D-523bdc0b54c41222.js",revision:"523bdc0b54c41222"},{url:"/_next/static/chunks/pages/chats/new-dcf9151475a2a2ae.js",revision:"dcf9151475a2a2ae"},{url:"/_next/static/chunks/pages/error-6d2e94724273c1aa.js",revision:"6d2e94724273c1aa"},{url:"/_next/static/chunks/pages/index-fbd387a020002fbe.js",revision:"fbd387a020002fbe"},{url:"/_next/static/chunks/pages/loading-ff7e5641cd4c35a2.js",revision:"ff7e5641cd4c35a2"},{url:"/_next/static/chunks/pages/notifications-a5911022f55875b8.js",revision:"a5911022f55875b8"},{url:"/_next/static/chunks/pages/posts/%5Bid%5D-c5b22a4b4d9b07f6.js",revision:"c5b22a4b4d9b07f6"},{url:"/_next/static/chunks/pages/profiles/%5Busername%5D-6aeede0910177fba.js",revision:"6aeede0910177fba"},{url:"/_next/static/chunks/pages/profiles/%5Busername%5D/followers-bda3b09b3da4b3b5.js",revision:"bda3b09b3da4b3b5"},{url:"/_next/static/chunks/pages/profiles/%5Busername%5D/following-6acfc8cfaf80b24b.js",revision:"6acfc8cfaf80b24b"},{url:"/_next/static/chunks/pages/search-955fa47f94a38aa3.js",revision:"955fa47f94a38aa3"},{url:"/_next/static/chunks/pages/signin-2d8f75c20116b170.js",revision:"2d8f75c20116b170"},{url:"/_next/static/chunks/pages/signup-1eed74c8855ad2a3.js",revision:"1eed74c8855ad2a3"},{url:"/_next/static/chunks/polyfills-c67a75d1b6f99dc8.js",revision:"837c0df77fd5009c9e46d446188ecfd0"},{url:"/_next/static/chunks/webpack-59c5c889f52620d6.js",revision:"59c5c889f52620d6"},{url:"/_next/static/css/6c9c1fe772e5bcc8.css",revision:"6c9c1fe772e5bcc8"},{url:"/favicon.ico",revision:"c30c7d42707a47a3f4591831641e50dc"},{url:"/images/dots.gif",revision:"71d2aae75d9ba41ad4ee81bfb14d5aca"},{url:"/images/profilePic.jpeg",revision:"d1adc698a142fd896508f6d128fa5df8"},{url:"/next.svg",revision:"8e061864f388b47f33a1c3780831193e"},{url:"/thirteen.svg",revision:"53f96b8290673ef9d2895908e69b2f92"},{url:"/vercel.svg",revision:"61c6b19abff40ea7acd577be818f3976"}],{ignoreURLParametersMatching:[]}),e.cleanupOutdatedCaches(),e.registerRoute("/",new e.NetworkFirst({cacheName:"start-url",plugins:[{cacheWillUpdate:async({request:e,response:s,event:a,state:n})=>s&&"opaqueredirect"===s.type?new Response(s.body,{status:200,statusText:"OK",headers:s.headers}):s}]}),"GET"),e.registerRoute(/^https:\/\/fonts\.(?:gstatic)\.com\/.*/i,new e.CacheFirst({cacheName:"google-fonts-webfonts",plugins:[new e.ExpirationPlugin({maxEntries:4,maxAgeSeconds:31536e3})]}),"GET"),e.registerRoute(/^https:\/\/fonts\.(?:googleapis)\.com\/.*/i,new e.StaleWhileRevalidate({cacheName:"google-fonts-stylesheets",plugins:[new e.ExpirationPlugin({maxEntries:4,maxAgeSeconds:604800})]}),"GET"),e.registerRoute(/\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,new e.StaleWhileRevalidate({cacheName:"static-font-assets",plugins:[new e.ExpirationPlugin({maxEntries:4,maxAgeSeconds:604800})]}),"GET"),e.registerRoute(/\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,new e.StaleWhileRevalidate({cacheName:"static-image-assets",plugins:[new e.ExpirationPlugin({maxEntries:64,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\/_next\/image\?url=.+$/i,new e.StaleWhileRevalidate({cacheName:"next-image",plugins:[new e.ExpirationPlugin({maxEntries:64,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:mp3|wav|ogg)$/i,new e.CacheFirst({cacheName:"static-audio-assets",plugins:[new e.RangeRequestsPlugin,new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:mp4)$/i,new e.CacheFirst({cacheName:"static-video-assets",plugins:[new e.RangeRequestsPlugin,new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:js)$/i,new e.StaleWhileRevalidate({cacheName:"static-js-assets",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:css|less)$/i,new e.StaleWhileRevalidate({cacheName:"static-style-assets",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\/_next\/data\/.+\/.+\.json$/i,new e.StaleWhileRevalidate({cacheName:"next-data",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:json|xml|csv)$/i,new e.NetworkFirst({cacheName:"static-data-assets",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute((({url:e})=>{if(!(self.origin===e.origin))return!1;const s=e.pathname;return!s.startsWith("/api/auth/")&&!!s.startsWith("/api/")}),new e.NetworkFirst({cacheName:"apis",networkTimeoutSeconds:10,plugins:[new e.ExpirationPlugin({maxEntries:16,maxAgeSeconds:86400})]}),"GET"),e.registerRoute((({url:e})=>{if(!(self.origin===e.origin))return!1;return!e.pathname.startsWith("/api/")}),new e.NetworkFirst({cacheName:"others",networkTimeoutSeconds:10,plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute((({url:e})=>!(self.origin===e.origin)),new e.NetworkFirst({cacheName:"cross-origin",networkTimeoutSeconds:10,plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:3600})]}),"GET")}));
