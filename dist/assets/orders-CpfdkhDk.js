import"./modulepreload-polyfill-B5Qt9EMX.js";import{c as l}from"./index-D8eY4bh5.js";const n=[{id:"ORD-20260309-001",status:"processing",icon:"fas fa-box",iconColor:"text-salmon-500",statusLabel:"處理中",statusBg:"bg-salmon-50",statusColor:"text-salmon-600",title:"頂級挪威鮮切鮭魚菲力 等",itemCount:3,total:1280,image:"/placeholder.jpg",timestamp:"2026/03/09 10:30",singleImage:!0},{id:"ORD-20260310-055",status:"established",icon:"fas fa-check",iconColor:"text-blue-500",statusLabel:"已成立",statusBg:"bg-blue-50",statusColor:"text-blue-600",title:"紐西蘭青口貝 等",itemCount:1,total:420,image:"/placeholder.jpg",timestamp:"2026/03/10 11:20",singleImage:!0},{id:"ORD-20260308-042",status:"pending",icon:"fas fa-wallet",iconColor:"text-orange-400",statusLabel:"待收貨",statusBg:"bg-orange-50",statusColor:"text-orange-600",title:"智利厚切鮭魚排 等",itemCount:2,total:770,images:["/placeholder.jpg","/placeholder.jpg"],timestamp:"2026/03/08 09:15",multiImage:!0},{id:"ORD-20260305-088",status:"completed",icon:"fas fa-check-circle",iconColor:"text-gray-400",statusLabel:"已完成",statusBg:"bg-gray-100",statusColor:"text-gray-500",title:"嚴選北海道生食級鮭魚卵",itemCount:1,total:890,image:"/placeholder.jpg",timestamp:"2026/03/05 14:20",singleImage:!0,grayscale:!0},{id:"ORD-20260304-012",status:"cancelled",icon:"fas fa-times-circle",iconColor:"text-red-400",statusLabel:"已取消",statusBg:"bg-red-50",statusColor:"text-red-600",title:"日本冷凍扇貝 等",itemCount:2,total:650,image:"/placeholder.jpg",timestamp:"2026/03/04 16:45",singleImage:!0}],i={all:null,processing:"processing",established:"established",pending:"pending",completed:"completed",cancelled:"cancelled"};class o{constructor(e="main"){this.container=document.querySelector(e),this.orders=[],this.currentFilter="all",this.api=l()}async fetchOrders(){try{return this.orders=n,this.orders}catch(e){return console.error("Failed to fetch orders:",e),[]}}getFilteredOrders(){const e=i[this.currentFilter];return e?this.orders.filter(t=>t.status===e):this.orders}renderSingleImage(e){return`
      <div class="w-16 h-16 rounded-lg overflow-hidden shrink-0 border border-gray-100${e.grayscale?" relative":""}">
        <img
          src="${e.image}"
          alt="${e.title}"
          class="w-full h-full object-contain${e.grayscale?" grayscale-[20%]":""}"
        />
      </div>
    `}renderMultipleImages(e){return`
      <div class="flex -space-x-3 shrink-0">
        ${(e.images||[]).map((s,r)=>`
          <div class="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-sm z-${20-r} bg-${r===0?"white":"gray-100"}">
            <img
              src="${s}"
              alt="${e.title}"
              class="w-full h-full object-contain"
            />
          </div>
        `).join("")}
      </div>
    `}renderOrderItem(e){const t=e.multiImage?this.renderMultipleImages(e):this.renderSingleImage(e),s=e.multiImage?"ml-2":"";return`
      <div class="order-item bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden" data-order-id="${e.id}">
        <!-- Order Header -->
        <div class="px-4 py-3 flex justify-between items-center border-b border-gray-100 bg-gray-50/50">
          <div class="flex items-center gap-2">
            <i class="${e.icon} ${e.iconColor}"></i>
            <span class="text-sm font-bold text-gray-700">#${e.id}</span>
          </div>
          <span class="text-xs font-${e.status==="processing"?"bold":"medium"} ${e.statusColor} ${e.statusBg} px-2 py-1 rounded-md">
            ${e.statusLabel}
          </span>
        </div>
        <!-- Order Content -->
        <div class="p-4 flex items-center gap-3">
          ${t}
          <div class="flex-1 ${s}">
            <h3 class="text-sm font-medium text-gray-800 line-clamp-1 mb-1">
              ${e.title}
            </h3>
            <p class="text-xs text-gray-500 mb-1">共 ${e.itemCount} 件商品</p>
            <p class="text-sm font-bold text-gray-800">
              總計: <span class="text-red-500">NT$ ${e.total.toLocaleString()}</span>
            </p>
          </div>
        </div>
        <!-- Order Footer / Actions -->
        <div class="px-4 py-3 border-t border-gray-100 flex justify-between items-center bg-white">
          <p class="text-xs text-gray-400">${e.timestamp}</p>
          <div class="flex gap-2">
            <a
              href="/orders/detail/index.html?id=${e.id}"
              class="px-3 py-1.5 text-xs font-medium text-gray-600 border border-gray-200 rounded-full hover:bg-gray-50 transition-colors"
            >
              查看詳情
            </a>
          </div>
        </div>
      </div>
    `}renderOrders(){const e=this.getFilteredOrders();this.container&&(this.container.innerHTML=e.map(t=>this.renderOrderItem(t)).join(""),this.attachEventListeners())}attachEventListeners(){this.container?.querySelectorAll(".order-item")?.forEach(t=>{t.addEventListener("click",s=>{s.target.closest("a")||console.log("Order item clicked:",t.dataset.orderId)})})}setFilter(e){if(!i.hasOwnProperty(e)){console.warn(`Unknown filter: ${e}`);return}this.currentFilter=e,this.updateTabUI(e),this.renderOrders()}updateTabUI(e){document.querySelectorAll(".order-tabs a").forEach(s=>{s.dataset.filter===e?(s.classList.add("bg-salmon-500","text-white"),s.classList.remove("bg-gray-100","text-gray-600")):(s.classList.remove("bg-salmon-500","text-white"),s.classList.add("bg-gray-100","text-gray-600"))})}async init(){await this.fetchOrders(),this.renderOrders(),this.setupTabListeners()}setupTabListeners(){document.querySelectorAll(".order-tabs a").forEach(t=>{t.addEventListener("click",s=>{s.preventDefault();const r=t.dataset.filter||"all";this.setFilter(r)})})}}document.addEventListener("DOMContentLoaded",async()=>{const a=new o("main");await a.init(),window.orderListRenderer=a});
