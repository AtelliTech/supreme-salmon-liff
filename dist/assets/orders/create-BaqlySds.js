import"../modulepreload-polyfill-B5Qt9EMX.js";E();function E(){MicroModal.init({disableScroll:!0});const x=document.getElementById("order-item-title"),s=document.getElementById("order-item-list"),v=document.getElementById("open-add-product-modal"),n=document.getElementById("add-product-modal"),h=document.getElementById("add-product-backdrop"),I=document.getElementById("add-product-modal-close"),p=document.getElementById("add-product-list"),a={orderItems:[{id:"salmon-fillet-300g",name:"頂級挪威鮮切鮭魚菲力",spec:"300g (厚切)",price:380,qty:2,image:"/placeholder.jpg",alt:"鮭魚"},{id:"salmon-steak-500g",name:"智利厚切鮭魚排 家庭號",spec:"500g",price:520,qty:1,image:"/placeholder.jpg",alt:"鮭魚排"}]},g=[{id:"salmon-fillet-300g",name:"頂級挪威鮮切鮭魚菲力",spec:"300g (厚切)",price:380,image:"/placeholder.jpg",alt:"鮭魚"},{id:"salmon-steak-500g",name:"智利厚切鮭魚排 家庭號",spec:"500g",price:520,image:"/placeholder.jpg",alt:"鮭魚排"},{id:"salmon-belly-250g",name:"炙燒級鮭魚腹排",spec:"250g",price:320,image:"/placeholder.jpg",alt:"鮭魚腹排"},{id:"salmon-cube-600g",name:"鮭魚丁料理包",spec:"600g",price:460,image:"/placeholder.jpg",alt:"鮭魚丁"}],$=e=>{const t=Number(e);return Number.isFinite(t)?Math.max(0,Math.floor(t)):0},y=e=>`NT$ ${e}`,f=e=>{if(e){document.body.classList.add("overflow-hidden");return}document.body.classList.remove("overflow-hidden")},b=()=>{p.innerHTML=g.map(e=>{const t=a.orderItems.find(r=>r.id===e.id);return`
              <button
                type="button"
                data-add-product-id="${e.id}"
                class="w-full border border-gray-100 rounded-xl px-3 py-3 text-left flex items-center gap-3 hover:border-salmon-300 transition-colors"
                aria-label="加入 ${e.name}"
              >
                <div class="w-14 h-14 rounded-lg overflow-hidden border border-gray-100 shrink-0">
                  <img src="${e.image}" alt="${e.alt}" class="w-full h-full object-contain" />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-gray-800 line-clamp-1">${e.name}</p>
                  <p class="text-[11px] text-gray-400 mt-0.5">${e.spec}</p>
                  <p class="text-sm font-bold text-salmon-600 mt-1">${y(e.price)}</p>
                </div>
                <div class="text-[10px] rounded-full px-2 py-1 ${t?"bg-gray-100 text-gray-500":"bg-salmon-50 text-salmon-600"}">
                  ${t?"已在清單":"新增"}
                </div>
              </button>
            `}).join("")},c=()=>{const e=a.orderItems.length;if(x.textContent=`商品清單 (${e})`,!e){s.innerHTML=`
              <div class="text-center py-8 rounded-xl border border-dashed border-gray-200 bg-gray-50/80">
                <p class="text-sm text-gray-500">目前尚未加入商品</p>
                <p class="text-xs text-gray-400 mt-1">請點擊上方「新增」開始選購</p>
              </div>
            `,b();return}s.innerHTML=a.orderItems.map(t=>`
                <div class="flex gap-3" data-order-item-id="${t.id}">
                  <div class="w-16 h-16 rounded-lg overflow-hidden shrink-0 border border-gray-100">
                    <img src="${t.image}" alt="${t.alt}" class="w-full h-full object-contain" />
                  </div>

                  <div class="flex-1 min-w-0 flex flex-col">
                    <div class="flex justify-between items-start gap-2">
                      <h4 class="text-sm font-medium text-gray-800 line-clamp-1">${t.name}</h4>
                      <button
                        type="button"
                        data-remove-item-id="${t.id}"
                        class="text-[11px] text-red-500 bg-red-50 px-2 py-1 rounded-md shrink-0"
                        aria-label="刪除 ${t.name}"
                      >
                        刪除
                      </button>
                    </div>

                    <p class="text-[11px] text-gray-400 mt-0.5">${t.spec}</p>

                    <div class="mt-2 flex items-center justify-between gap-2">
                      <span class="text-salmon-600 font-bold text-sm">${y(t.price)}</span>

                      <div class="inline-flex items-center border border-gray-200 rounded-xl overflow-hidden">
                        <button
                          type="button"
                          data-qty-minus="${t.id}"
                          class="w-9 h-9 bg-gray-50 text-gray-600 hover:bg-gray-100 active:scale-95 transition-transform"
                          aria-label="減少數量"
                        >
                          <i class="fas fa-minus text-xs"></i>
                        </button>

                        <input
                          type="number"
                          min="0"
                          step="1"
                          inputmode="numeric"
                          data-qty-input="${t.id}"
                          value="${t.qty}"
                          class="w-14 text-center font-semibold text-gray-800 bg-white focus:outline-none"
                          aria-label="輸入數量"
                        />

                        <button
                          type="button"
                          data-qty-plus="${t.id}"
                          class="w-9 h-9 bg-gray-50 text-gray-600 hover:bg-gray-100 active:scale-95 transition-transform"
                          aria-label="增加數量"
                        >
                          <i class="fas fa-plus text-xs"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              `).join(""),b()},o=(e,t)=>{const r=$(t);a.orderItems=a.orderItems.map(d=>d.id===e?{...d,qty:r}:d),c()},w=e=>{const t=a.orderItems.find(d=>d.id===e);!t||!window.confirm(`確定要刪除「${t.name}」嗎？`)||(a.orderItems=a.orderItems.filter(d=>d.id!==e),c())},L=e=>{const t=g.find(d=>d.id===e);if(!t)return;const r=a.orderItems.find(d=>d.id===e);if(r){o(e,r.qty+1),i();return}a.orderItems=[...a.orderItems,{...t,qty:1}],c(),i()},q=()=>{n.classList.remove("hidden"),n.setAttribute("aria-hidden","false"),f(!0)},i=()=>{n.classList.add("hidden"),n.setAttribute("aria-hidden","true"),f(!1)};v.addEventListener("click",q),I.addEventListener("click",i),h.addEventListener("click",i),p.addEventListener("click",e=>{const t=e.target.closest("[data-add-product-id]");t&&L(t.dataset.addProductId||"")}),s.addEventListener("click",e=>{const t=e.target.closest("[data-qty-minus]");if(t){const l=t.dataset.qtyMinus||"",m=a.orderItems.find(u=>u.id===l);o(l,(m?.qty||0)-1);return}const r=e.target.closest("[data-qty-plus]");if(r){const l=r.dataset.qtyPlus||"",m=a.orderItems.find(u=>u.id===l);o(l,(m?.qty||0)+1);return}const d=e.target.closest("[data-remove-item-id]");d&&w(d.dataset.removeItemId||"")}),s.addEventListener("input",e=>{const t=e.target.closest("[data-qty-input]");t&&o(t.dataset.qtyInput||"",t.value)}),s.addEventListener("blur",e=>{const t=e.target.closest("[data-qty-input]");t&&o(t.dataset.qtyInput||"",t.value)},!0),document.addEventListener("keydown",e=>{e.key==="Escape"&&n.getAttribute("aria-hidden")==="false"&&i()}),document.getElementById("confirm-order-submit").addEventListener("click",()=>{MicroModal.close("confirm-order-modal")}),c()}
