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

  function enhanceListTables(){
    document.querySelectorAll("table").forEach(table => {
      if(table.closest(".paper")) return;

      const headers = [...table.querySelectorAll("thead th")].map(th => th.textContent.trim().toLowerCase());
      const lastHeader = headers[headers.length - 1] || "";

      if(lastHeader === "action" || lastHeader === "actions"){
        table.classList.add("erp-list-table");
      }

      const firstHeader = headers[0] || "";
      if(firstHeader === "#" || firstHeader === "no" || firstHeader === "no."){
        table.classList.add("erp-numbered-table");
      }
    });
  }

  function pageType(){
    const path = currentPath();
    if(path.includes("master") || path.includes("settings") || path.includes("profile") || path.includes("user-management") || path.includes("financial-year")){
      return "master";
    }
    if(path.includes("invoice") || path.includes("quotation") || path.includes("delivery-order") || path.includes("voucher") || path.includes("expense-entry")){
      return "entry";
    }
    if(path.includes("report") || path.includes("ledger") || path.includes("profit-loss") || path.includes("vat-report") || path.includes("soa")){
      return "report";
    }
    return "workspace";
  }

  function enhanceCards(){
    document.body.classList.add("p91-page-" + pageType());

    document.querySelectorAll(".card, .section, .form-card").forEach(card => {
      if(card.closest(".paper")) return;

      const heading = card.querySelector("h2");
      const headingText = (heading?.textContent || "").toLowerCase();
      const hasTable = !!card.querySelector("table");
      const hasInputs = !!card.querySelector("input, select, textarea");

      if(hasTable || headingText.includes("saved") || headingText.includes("list")){
        card.classList.add("erp-list-card");
      }else if(hasInputs){
        card.classList.add("erp-form-card");
      }

      if(heading && !heading.parentElement.classList.contains("erp-card-title")){
        const title = document.createElement("div");
        title.className = "erp-card-title";
        heading.parentNode.insertBefore(title, heading);
        title.appendChild(heading);
      }
    });

    document.querySelectorAll(".btn-row").forEach(row => {
      row.classList.add("erp-action-row");
    });

    document.querySelectorAll(".total-box").forEach(box => {
      box.classList.add("erp-total-box");
    });
  }

  function escapeHtml(value){
    return String(value || "").replace(/[&<>"']/g, match => ({
      "&":"&amp;",
      "<":"&lt;",
      ">":"&gt;",
      '"':"&quot;",
      "'":"&#039;"
    }[match]));
  }

  function localCompanyProfile(){
    const fallbacks = [
      "post91CompanyProfile",
      "post91Company",
      "companyProfile"
    ];

    for(const key of fallbacks){
      try{
        const data = JSON.parse(localStorage.getItem(key) || "{}");
        if(data.companyName || data.businessName || data.name) return data;
      }catch(e){}
    }

    const headerName = document.querySelector(".company-info h3")?.textContent?.trim();
    return headerName ? { companyName: headerName } : {};
  }

  function companyDetails(profile){
    const details = profile || localCompanyProfile();
    const name = details.companyName || details.businessName || details.name || "Company Name";
    const address = details.address || details.companyAddress || "";
    const contact = [
      details.phone,
      details.mobile,
      details.email,
      details.website
    ].filter(Boolean).join(" | ");
    const registration = [
      details.vatNumber || details.vatIn ? `VAT IN: ${details.vatNumber || details.vatIn}` : "",
      details.crNumber || details.crNo ? `C.R. No: ${details.crNumber || details.crNo}` : ""
    ].filter(Boolean).join(" | ");

    return {
      name,
      lines: [address, contact, registration].filter(Boolean)
    };
  }

  function renderPrintCompany(profile){
    const company = companyDetails(profile);
    const nameEl = document.querySelector("[data-print-company-name]");
    const detailsEl = document.querySelector("[data-print-company-details]");

    if(nameEl) nameEl.textContent = company.name;
    if(detailsEl){
      detailsEl.innerHTML = company.lines.length
        ? company.lines.map(line => `<span>${escapeHtml(line)}</span>`).join("")
        : "<span>Company details not set</span>";
    }
  }

  async function loadReportCompanyProfile(){
    if(typeof window.loadFromCloudSmart !== "function" && typeof window.loadFromCloud !== "function") return;

    const loader = window.loadFromCloudSmart || window.loadFromCloud;
    const collections = ["companyProfile", "companyProfiles", "companies"];

    for(const collection of collections){
      try{
        const rows = await loader(collection);
        if(rows && rows.length){
          localStorage.setItem("post91CompanyProfile", JSON.stringify(rows[0]));
          renderPrintCompany(rows[0]);
          return;
        }
      }catch(e){}
    }
  }

  function reportPeriodText(){
    const from = document.getElementById("fromDate")?.value || "";
    const to = document.getElementById("toDate")?.value || "";
    if(from && to) return `${from} to ${to}`;
    if(from) return `From ${from}`;
    if(to) return `Up to ${to}`;
    return "All dates";
  }

  function reportTitleText(defaultTitle){
    return document.body.dataset.printSubject || defaultTitle;
  }

  function enhancePrintReport(){
    if(pageType() !== "report" || document.getElementById("p91PrintHeader")) return;

    const title = currentItem()[0];
    const generated = new Date().toLocaleString();
    const company = companyDetails();

    document.body.insertAdjacentHTML("afterbegin", `
      <div class="p91-print-header" id="p91PrintHeader">
        <div>
          <h1 data-print-company-name>${escapeHtml(company.name)}</h1>
          <p data-print-company-details>${company.lines.map(line => `<span>${escapeHtml(line)}</span>`).join("") || "<span>Company details not set</span>"}</p>
        </div>
        <div class="p91-print-report-title">
          <strong data-print-title>${reportTitleText(title)}</strong>
          <span data-print-period>${reportPeriodText()}</span>
        </div>
      </div>
      <div class="p91-print-footer" id="p91PrintFooter">
        <span>Generated: ${generated}</span>
        <span>Printed from company accounting records</span>
      </div>
    `);

    function refreshPrintMeta(){
      const reportTitle = document.querySelector("[data-print-title]");
      const period = document.querySelector("[data-print-period]");
      if(reportTitle) reportTitle.textContent = reportTitleText(title);
      if(period) period.textContent = reportPeriodText();
    }

    window.addEventListener("beforeprint", refreshPrintMeta);
    refreshPrintMeta();
    loadReportCompanyProfile();
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
    enhanceCards();
    setTimeout(enhanceCards, 200);
    enhancePrintReport();
    enhanceListTables();
    setInterval(enhanceListTables, 1200);
  }

  document.addEventListener("DOMContentLoaded", render);
})();
