import { createApi } from "/api/index.js";

// Mock data for demonstration - replace with API call
const mockOrders = [
  {
    id: "ORD-20260309-001",
    status: "processing",
    icon: "fas fa-box",
    iconColor: "text-salmon-500",
    statusLabel: "處理中",
    statusBg: "bg-salmon-50",
    statusColor: "text-salmon-600",
    title: "頂級挪威鮮切鮭魚菲力 等",
    itemCount: 3,
    total: 1280,
    image: "/placeholder.jpg",
    timestamp: "2026/03/09 10:30",
    singleImage: true,
  },
  {
    id: "ORD-20260310-055",
    status: "established",
    icon: "fas fa-check",
    iconColor: "text-blue-500",
    statusLabel: "已成立",
    statusBg: "bg-blue-50",
    statusColor: "text-blue-600",
    title: "紐西蘭青口貝 等",
    itemCount: 1,
    total: 420,
    image: "/placeholder.jpg",
    timestamp: "2026/03/10 11:20",
    singleImage: true,
  },
  {
    id: "ORD-20260308-042",
    status: "pending",
    icon: "fas fa-wallet",
    iconColor: "text-orange-400",
    statusLabel: "待收貨",
    statusBg: "bg-orange-50",
    statusColor: "text-orange-600",
    title: "智利厚切鮭魚排 等",
    itemCount: 2,
    total: 770,
    images: ["/placeholder.jpg", "/placeholder.jpg"],
    timestamp: "2026/03/08 09:15",
    multiImage: true,
  },
  {
    id: "ORD-20260305-088",
    status: "completed",
    icon: "fas fa-check-circle",
    iconColor: "text-gray-400",
    statusLabel: "已完成",
    statusBg: "bg-gray-100",
    statusColor: "text-gray-500",
    title: "嚴選北海道生食級鮭魚卵",
    itemCount: 1,
    total: 890,
    image: "/placeholder.jpg",
    timestamp: "2026/03/05 14:20",
    singleImage: true,
    grayscale: true,
  },
  {
    id: "ORD-20260304-012",
    status: "cancelled",
    icon: "fas fa-times-circle",
    iconColor: "text-red-400",
    statusLabel: "已取消",
    statusBg: "bg-red-50",
    statusColor: "text-red-600",
    title: "日本冷凍扇貝 等",
    itemCount: 2,
    total: 650,
    image: "/placeholder.jpg",
    timestamp: "2026/03/04 16:45",
    singleImage: true,
  },
];

const STATUS_MAP = {
  all: null,
  processing: "processing",
  established: "established",
  pending: "pending",
  completed: "completed",
  cancelled: "cancelled",
};

// 0:草稿 = 處理中
// 1:已成立 = 已成立
// 2:已出貨 = 待收貨
// 3:已完成 = 已完成
// 4:已取消 = 已取消
// 5:上傳M3失敗 = 處理中
const STATUS_LABELS = {
  processing: "處理中",
  established: "已成立",
  pending: "待收貨",
  completed: "已完成",
  cancelled: "已取消",
};

class OrderListRenderer {
  constructor(containerSelector = "main") {
    this.container = document.querySelector(containerSelector);
    this.orders = [];
    this.currentFilter = "all";
    this.api = createApi();
  }

  /**
   * Fetch orders from API
   */
  async fetchOrders() {
    try {
      // Uncomment when API is ready
      // const response = await this.api.listOrders();
      // this.orders = response?.data || [];
      
      // For now, use mock data
      this.orders = mockOrders;
      return this.orders;
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      return [];
    }
  }

  /**
   * Get filtered orders based on current filter
   */
  getFilteredOrders() {
    const statusFilter = STATUS_MAP[this.currentFilter];
    if (!statusFilter) {
      return this.orders;
    }
    return this.orders.filter((order) => order.status === statusFilter);
  }

  /**
   * Generate single image HTML
   */
  renderSingleImage(order) {
    return `
      <div class="w-16 h-16 rounded-lg overflow-hidden shrink-0 border border-gray-100${
        order.grayscale ? " relative" : ""
      }">
        <img
          src="${order.image}"
          alt="${order.title}"
          class="w-full h-full object-contain${order.grayscale ? " grayscale-[20%]" : ""}"
        />
      </div>
    `;
  }

  /**
   * Generate multiple images HTML (overlapping style)
   */
  renderMultipleImages(order) {
    const images = order.images || [];
    return `
      <div class="flex -space-x-3 shrink-0">
        ${images
          .map(
            (img, idx) => `
          <div class="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-sm z-${20 - idx} bg-${idx === 0 ? "white" : "gray-100"}">
            <img
              src="${img}"
              alt="${order.title}"
              class="w-full h-full object-contain"
            />
          </div>
        `
          )
          .join("")}
      </div>
    `;
  }

  /**
   * Render single order item
   */
  renderOrderItem(order) {
    const imageHtml = order.multiImage
      ? this.renderMultipleImages(order)
      : this.renderSingleImage(order);

    const marginClass = order.multiImage ? "ml-2" : "";

    return `
      <div class="order-item bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden" data-order-id="${order.id}">
        <!-- Order Header -->
        <div class="px-4 py-3 flex justify-between items-center border-b border-gray-100 bg-gray-50/50">
          <div class="flex items-center gap-2">
            <i class="${order.icon} ${order.iconColor}"></i>
            <span class="text-sm font-bold text-gray-700">#${order.id}</span>
          </div>
          <span class="text-xs font-${order.status === "processing" ? "bold" : "medium"} ${order.statusColor} ${order.statusBg} px-2 py-1 rounded-md">
            ${order.statusLabel}
          </span>
        </div>
        <!-- Order Content -->
        <div class="p-4 flex items-center gap-3">
          ${imageHtml}
          <div class="flex-1 ${marginClass}">
            <h3 class="text-sm font-medium text-gray-800 line-clamp-1 mb-1">
              ${order.title}
            </h3>
            <p class="text-xs text-gray-500 mb-1">共 ${order.itemCount} 件商品</p>
            <p class="text-sm font-bold text-gray-800">
              總計: <span class="text-red-500">NT$ ${order.total.toLocaleString()}</span>
            </p>
          </div>
        </div>
        <!-- Order Footer / Actions -->
        <div class="px-4 py-3 border-t border-gray-100 flex justify-between items-center bg-white">
          <p class="text-xs text-gray-400">${order.timestamp}</p>
          <div class="flex gap-2">
            <a
              href="/orders/detail/index.html?id=${order.id}"
              class="px-3 py-1.5 text-xs font-medium text-gray-600 border border-gray-200 rounded-full hover:bg-gray-50 transition-colors"
            >
              查看詳情
            </a>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Render all filtered orders
   */
  renderOrders() {
    const filtered = this.getFilteredOrders();
    if (!this.container) return;

    this.container.innerHTML = filtered
      .map((order) => this.renderOrderItem(order))
      .join("");

    // Add click handlers
    this.attachEventListeners();
  }

  /**
   * Attach event listeners to order items
   */
  attachEventListeners() {
    const orderItems = this.container?.querySelectorAll(".order-item");
    orderItems?.forEach((item) => {
      item.addEventListener("click", (e) => {
        // Prevent event if clicking on link
        if (e.target.closest("a")) return;
        console.log("Order item clicked:", item.dataset.orderId);
      });
    });
  }

  /**
   * Set current filter and re-render
   */
  setFilter(filterKey) {
    if (!STATUS_MAP.hasOwnProperty(filterKey)) {
      console.warn(`Unknown filter: ${filterKey}`);
      return;
    }
    this.currentFilter = filterKey;
    this.updateTabUI(filterKey);
    this.renderOrders();
  }

  /**
   * Update tab UI styling
   */
  updateTabUI(activeFilter) {
    const tabs = document.querySelectorAll(".order-tabs a");
    tabs.forEach((tab) => {
      const tabFilter = tab.dataset.filter;
      if (tabFilter === activeFilter) {
        tab.classList.add("bg-salmon-500", "text-white");
        tab.classList.remove("bg-gray-100", "text-gray-600");
      } else {
        tab.classList.remove("bg-salmon-500", "text-white");
        tab.classList.add("bg-gray-100", "text-gray-600");
      }
    });
  }

  /**
   * Initialize the renderer
   */
  async init() {
    await this.fetchOrders();
    this.renderOrders();
    this.setupTabListeners();
  }

  /**
   * Setup tab click listeners
   */
  setupTabListeners() {
    const tabs = document.querySelectorAll(".order-tabs a");
    tabs.forEach((tab) => {
      tab.addEventListener("click", (e) => {
        e.preventDefault();
        const filter = tab.dataset.filter || "all";
        this.setFilter(filter);
      });
    });
  }
}

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", async () => {
  const renderer = new OrderListRenderer("main");
  await renderer.init();

  // Expose to window for debugging
  window.orderListRenderer = renderer;
});
