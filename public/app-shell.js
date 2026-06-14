(function(){
  const groups = [
    {
      name: "Workspace",
      items: [
        ["Dashboard", "/dashboard.html", "Overview and quick actions"],
        ["Dashboard Report", "/dashboard-report.html", "MIS summary"]
      ]
    },
    {
      name: "Masters",
      items: [
        ["Customer Master", "/customer-master.html", "Customers"],
        ["Supplier Master", "/supplier-master.html", "Suppliers"],
        ["Item Master", "/item-master.html", "Items and categories"],
        ["Cash / Bank Master", "/cash-bank-master.html", "Accounts"]
      ]
    },
    {
      name: "Transactions",
      items: [
        ["Quotation", "/quotation.html", "Customer quotes"],
        ["Delivery Order", "/delivery-order.html", "Delivery documents"],
        ["Sales Invoice", "/sales-invoice.html", "Sales and VAT"],
        ["Receipt Voucher", "/receipt-voucher.html", "Customer receipts"],
        ["Purchase Invoice", "/purchase-invoice.html", "Purchases"],
        ["Payment Voucher", "/payment-voucher.html", "Supplier payments"],
        ["Expense Entry", "/expense-entry.html", "Business expenses"]
      ]
    },
    {
      name: "Reports",
      items: [
        ["Sales Report", "/sales-report.html", "Sales summary"],
        ["Customer Ledger", "/customer-ledger.html", "Receivables"],
        ["Supplier Ledger", "/supplier-ledger.html", "Payables"],
        ["Stock Ledger", "/stock-ledger.html", "Stock movement"],
        ["Cash / Bank Ledger", "/cash-bank-ledger.html", "Cash and bank"],
        ["Profit & Loss", "/profit-loss.html", "Profitability"],
        ["VAT Report", "/vat-report.html", "VAT position"]
      ]
    },
    {
      name: "Admin",
      items: [
        ["Financial Year", "/financial-year.html", "Accounting years"],
        ["Company Profile", "/company-profile.html", "Company details"],
        ["Settings", "/settings.html", "Numbering and defaults"],
        ["User Management", "/user-management.html", "Users and access"],
        ["Backup & Restore", "/backup-restore.html", "Export and restore data"]
      ]
    }
  ];

  function currentPath(){
    let path = window.location.pathname || "/dashboard.html";
    if(path === "/") path = "/dashboard.html";
    return path;
  }

  function currentItem(){
    const path = currentPath();
    for(const group of groups){
      const found = group.items.find(item => item[1] === path);
      if(found) return found;
    }
    return [document.title.replace("| Post91 Accounts", "").trim() || "Post91 Accounts", path, ""];
  }

  function makeLink(item){
    const active = item[1] === currentPath() ? " active" : "";
    return `<a class="p91-shell-link${active}" href="${item[1]}">${item[0]}<span>${item[2]}</span></a>`;
  }

  function closePanel(){
    const panel = document.getElementById("p91ShellPanel");
    if(panel) panel.classList.remove("show");
    document.querySelectorAll(".p91-shell-nav button").forEach(btn => btn.classList.remove("active"));
  }

  function openGroup(index, button){
    const panel = document.getElementById("p91ShellPanel");
    if(!panel) return;
    const isOpen = panel.classList.contains("show") && panel.dataset.group === String(index);
    closePanel();
    if(isOpen) return;
    panel.dataset.group = String(index);
    panel.innerHTML = groups[index].items.map(makeLink).join("");
    panel.classList.add("show");
    button.classList.add("active");
    applyExistingPermissions();
  }

  function toggleDrawer(){
    const drawer = document.getElementById("p91ShellDrawer");
    if(drawer) drawer.classList.toggle("show");
  }

  function logout(){
    localStorage.removeItem("post91CurrentUser");
    localStorage.removeItem("post91LoggedInUser");
    sessionStorage.clear();
    window.location.href = "/login.html";
  }

  function applyExistingPermissions(){
    if(typeof window.applyMenuPermissions === "function"){
      window.applyMenuPermissions();
    }
  }

  function fieldWrap(el){
    if(!el) return null;
    const direct = el.closest(".grid > div, .grid3 > div, .form-body .grid > div");
    return direct || el.parentElement;
  }

  function selectedStatusValue(select){
    if(!select) return "";
    const options = [...select.options].map(option => option.value || option.textContent.trim());
    if(String(select.value || "").toLowerCase() === "cancelled") return select.value;
    if(options.includes("Submitted")) return "Submitted";
    if(options.includes("Posted")) return "Posted";
    if(options.includes("Active")) return "Active";
    return select.value || options[0] || "";
  }

  function setSelectValue(select, value){
    if(!select || !value) return;
    const option = [...select.options].find(item => (item.value || item.textContent.trim()) === value);
    if(option) select.value = option.value || option.textContent.trim();
  }

  function documentKeyForField(el){
    const map = {
      quotationNo: "quotation",
      doNo: "deliveryOrder",
      invoiceNo: "salesInvoice",
      purchaseNo: "purchaseInvoice",
      receiptNo: "receiptVoucher",
      paymentNo: "paymentVoucher",
      expenseNo: "expenseEntry"
    };

    return map[el?.id] || "";
  }

  function documentNumberMode(el){
    const key = documentKeyForField(el);
    if(!key) return "Automatic";

    try{
      const settings = JSON.parse(localStorage.getItem("post91Settings") || "{}");
      return settings.documentNumbering?.[key]?.mode || "Automatic";
    }catch(e){
      return "Automatic";
    }
  }

  function enhanceEntryPage(){
    const form = document.getElementById("docForm") || document.getElementById("expenseForm");
    if(!form || document.getElementById("p91DocMeta")) return;

    const autoFields = [
      ["Document No", ["quotationNo","doNo","invoiceNo","purchaseNo","receiptNo","paymentNo","expenseNo"]],
      ["Status", ["docStatus","status"]],
      ["Payment", ["paymentStatus"]]
    ];

    const active = [];

    autoFields.forEach(([label, ids]) => {
      const el = ids.map(id => document.getElementById(id)).find(Boolean);
      if(!el) return;

      if(el.tagName === "SELECT" && (el.id === "docStatus" || el.id === "status")){
        setSelectValue(el, selectedStatusValue(el));
      }

      const wrap = fieldWrap(el);
      const isDocumentNo = label === "Document No";
      const isManualNo = isDocumentNo && documentNumberMode(el) === "Manual";

      if(wrap && !isManualNo) wrap.classList.add("erp-auto-field");
      if(wrap && isManualNo) wrap.classList.add("erp-manual-doc-field");

      active.push({ label, el });
    });

    if(active.length === 0) return;

    const meta = document.createElement("div");
    meta.className = "erp-doc-meta";
    meta.id = "p91DocMeta";
    meta.innerHTML = active.map((item, index) => `
      <div class="erp-doc-pill">
        <span>${item.label}</span>
        <b data-p91-meta-index="${index}">-</b>
      </div>
    `).join("");

    form.insertBefore(meta, form.firstElementChild);

    function refreshMeta(){
      active.forEach((item, index) => {
        if(item.el.tagName === "SELECT" && (item.el.id === "docStatus" || item.el.id === "status")){
          setSelectValue(item.el, selectedStatusValue(item.el));
        }
        const target = meta.querySelector(`[data-p91-meta-index="${index}"]`);
        if(target) target.textContent = item.el.value || "-";
      });
    }

    active.forEach(item => {
      item.el.addEventListener("input", refreshMeta);
      item.el.addEventListener("change", refreshMeta);
    });

    refreshMeta();
    setInterval(refreshMeta, 700);
  }

  function render(){
    if(document.getElementById("p91Shell")) return;

    const page = currentItem()[0];
    document.body.classList.add("post91-shell-ready");

    const navButtons = groups.map((group, index) => {
      const active = group.items.some(item => item[1] === currentPath()) ? " active" : "";
      return `<button type="button" class="${active}" data-p91-group="${index}">${group.name}</button>`;
    }).join("");

    const drawer = groups.map(group => `
      <div class="p91-shell-drawer-section">
        <div class="p91-shell-drawer-title">${group.name}</div>
        ${group.items.map(item => {
          const active = item[1] === currentPath() ? " active" : "";
          return `<a class="${active}" href="${item[1]}">${item[0]}</a>`;
        }).join("")}
      </div>
    `).join("");

    document.body.insertAdjacentHTML("afterbegin", `
      <div class="p91-shell" id="p91Shell">
        <div class="p91-shell-bar">
          <a class="p91-shell-brand" href="/dashboard.html">
            <img class="p91-shell-logo" src="/images/post91-logo.png" alt="Post91">
            <span class="p91-shell-brand-text">
              <span class="p91-shell-brand-title">Post91 Accounts</span>
              <span class="p91-shell-page">${page}</span>
            </span>
          </a>
          <nav class="p91-shell-nav" aria-label="Post91 modules">${navButtons}</nav>
          <div class="p91-shell-actions">
            <a class="p91-shell-action" href="/dashboard.html">Dashboard</a>
            <button class="p91-shell-action danger" type="button" id="p91Logout">Logout</button>
          </div>
          <button class="p91-shell-mobile" type="button" id="p91Menu">Menu</button>
        </div>
        <div class="p91-shell-panel" id="p91ShellPanel"></div>
      </div>
      <div class="p91-shell-drawer" id="p91ShellDrawer">${drawer}</div>
    `);

    document.querySelectorAll("[data-p91-group]").forEach(button => {
      button.addEventListener("click", () => openGroup(Number(button.dataset.p91Group), button));
    });
    document.getElementById("p91Menu").addEventListener("click", toggleDrawer);
    document.getElementById("p91Logout").addEventListener("click", logout);
    document.addEventListener("click", event => {
      if(!event.target.closest(".p91-shell")) closePanel();
    });
    document.addEventListener("keydown", event => {
      if(event.key === "Escape"){
        closePanel();
        const drawer = document.getElementById("p91ShellDrawer");
        if(drawer) drawer.classList.remove("show");
      }
    });

    applyExistingPermissions();
    setTimeout(applyExistingPermissions, 100);
    enhanceEntryPage();
    setTimeout(enhanceEntryPage, 200);
  }

  document.addEventListener("DOMContentLoaded", render);
})();
