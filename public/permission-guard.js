/* =========================================================
   POST91 ACCOUNTS - PERMISSION GUARD
========================================================= */

const PAGE_PERMISSION_MAP = {
  "/dashboard.html": "dashboard",
  "/dashboard-report.html": "dashboard",
  "/financial-year.html": "financialYear",
  "/company-profile.html": "companyProfile",
  "/business-profile.html": "companyProfile",
  "/user-management.html": "userManagement",
  "/users.html": "userManagement",
  "/customer-master.html": "customerMaster",
  "/customers.html": "customerMaster",
  "/supplier-master.html": "supplierMaster",
  "/suppliers.html": "supplierMaster",
  "/item-master.html": "itemMaster",
  "/items.html": "itemMaster",
  "/cash-bank-master.html": "cashBankMaster",
  "/banks.html": "cashBankMaster",
  "/quotation.html": "quotation",
  "/delivery-order.html": "deliveryOrder",
  "/sales-invoice.html": "salesInvoice",
  "/receipt-voucher.html": "receiptVoucher",
  "/receipts.html": "receiptVoucher",
  "/purchase-invoice.html": "purchaseInvoice",
  "/payment-voucher.html": "paymentVoucher",
  "/supplier-payments.html": "paymentVoucher",
  "/expense-entry.html": "expenseEntry",
  "/expenses.html": "expenseEntry",
  "/sales-report.html": "salesReport",
  "/customer-ledger.html": "customerLedger",
  "/soa.html": "customerLedger",
  "/supplier-ledger.html": "supplierLedger",
  "/supplier-soa.html": "supplierLedger",
  "/stock-ledger.html": "stockLedger",
  "/cash-bank-ledger.html": "cashBankLedger",
  "/cash-bank-book.html": "cashBankLedger",
  "/profit-loss.html": "profitLoss",
  "/vat-report.html": "vatReport",
  "/backup-restore.html": "backupRestore",
  "/opening-balance.html": "financialYear",
  "/settings.html": "settings",
  "/theme-branding.html": "companyProfile"
};

const LINK_PERMISSION_MAP = {
  "dashboard.html": "dashboard",
  "dashboard-report.html": "dashboard",
  "financial-year.html": "financialYear",
  "company-profile.html": "companyProfile",
  "business-profile.html": "companyProfile",
  "user-management.html": "userManagement",
  "users.html": "userManagement",
  "customer-master.html": "customerMaster",
  "customers.html": "customerMaster",
  "supplier-master.html": "supplierMaster",
  "suppliers.html": "supplierMaster",
  "item-master.html": "itemMaster",
  "items.html": "itemMaster",
  "cash-bank-master.html": "cashBankMaster",
  "banks.html": "cashBankMaster",
  "quotation.html": "quotation",
  "delivery-order.html": "deliveryOrder",
  "sales-invoice.html": "salesInvoice",
  "receipt-voucher.html": "receiptVoucher",
  "receipts.html": "receiptVoucher",
  "purchase-invoice.html": "purchaseInvoice",
  "payment-voucher.html": "paymentVoucher",
  "supplier-payments.html": "paymentVoucher",
  "expense-entry.html": "expenseEntry",
  "expenses.html": "expenseEntry",
  "sales-report.html": "salesReport",
  "customer-ledger.html": "customerLedger",
  "soa.html": "customerLedger",
  "supplier-ledger.html": "supplierLedger",
  "supplier-soa.html": "supplierLedger",
  "stock-ledger.html": "stockLedger",
  "cash-bank-ledger.html": "cashBankLedger",
  "cash-bank-book.html": "cashBankLedger",
  "profit-loss.html": "profitLoss",
  "vat-report.html": "vatReport",
  "backup-restore.html": "backupRestore",
  "opening-balance.html": "financialYear",
  "settings.html": "settings",
  "theme-branding.html": "companyProfile"
};

function getLoggedUser(){
  return JSON.parse(localStorage.getItem("post91CurrentUser") || "null");
}

function isMainAdmin(user){
  if(!user)return false;

  return (
    user.role === "Admin" ||
    user.isAdmin === true ||
    user.owner === true ||
    user.accountType === "Owner"
  );
}

function getUserPermissions(user){
  if(!user)return [];

  if(isMainAdmin(user)){
    return Object.values(PAGE_PERMISSION_MAP);
  }

  return user.permissions || [];
}

function hasPermission(permission){
  const user=getLoggedUser();

  if(!user)return false;

  if(isMainAdmin(user))return true;

  const permissions=getUserPermissions(user);

  return permissions.includes(permission);
}

function guardCurrentPage(){
  const user=getLoggedUser();

  if(!user){
    alert("Please login first.");
    window.location.href="/login.html";
    return;
  }

  if(user.accountActive===false){
    alert("Your login is inactive. Please contact admin.");
    localStorage.removeItem("post91CurrentUser");
    window.location.href="/login.html";
    return;
  }

  const path=window.location.pathname;
  const required=PAGE_PERMISSION_MAP[path];

  if(required && !hasPermission(required)){
    alert("Access denied. You do not have permission for this module.");
    window.location.href="/dashboard.html";
  }
}

function applyMenuPermissions(){
  const user=getLoggedUser();

  if(!user)return;

  if(isMainAdmin(user))return;

  const permissions=getUserPermissions(user);

  document.querySelectorAll("a[href]").forEach(a=>{
    let href=a.getAttribute("href") || "";
    let clean=href.replace("/", "").split("?")[0];
    let required=LINK_PERMISSION_MAP[clean];

    if(required && !permissions.includes(required)){
      a.style.display="none";
    }
  });
}

function applyPermissionGuard(){
  guardCurrentPage();
  applyMenuPermissions();
}

document.addEventListener("DOMContentLoaded", applyPermissionGuard);
