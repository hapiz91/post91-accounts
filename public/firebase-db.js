/* =========================================================
   POST91 FIREBASE DATABASE ENGINE
========================================================= */

const COLLECTIONS = {
  CUSTOMERS: "customers",
  ITEMS: "items",
  CATEGORIES: "categories",
  BRANDS: "brands",
  MACHINE_TYPES: "machineTypes",

  CASH_BANK_ACCOUNTS: "cashBankAccounts",

  QUOTATIONS: "quotations",
  DELIVERY_ORDERS: "deliveryOrders",
  SALES_INVOICES: "salesInvoices",

  RECEIPTS: "receiptVouchers",
  PAYMENTS: "paymentVouchers",

  PURCHASE_INVOICES: "purchaseInvoices",
  EXPENSES: "expenseEntries",

  LEDGER: "ledgerEntries"
};

/* =========================================================
   COMPANY / TENANT ID
========================================================= */

function normalizeCompanyId(v){
  return String(v || "")
    .trim()
    .toLowerCase();
}

function getCurrentCompanyId(){
  try{
    const user = JSON.parse(localStorage.getItem("post91CurrentUser") || "{}");

    return normalizeCompanyId(
      user.companyId ||
      user.businessId ||
      user.ownerEmail ||
      user.parentCompanyId ||
      user.email ||
      "default-company"
    );
  }catch(e){
    return "default-company";
  }
}

function attachCompanyId(data){
  data.companyId = getCurrentCompanyId();
  data.updatedAt = new Date().toISOString();

  if(!data.createdAt){
    data.createdAt = new Date().toISOString();
  }

  return data;
}

/* =========================================================
   GENERIC SAVE
========================================================= */

async function saveToCloud(collection,data,id=null){
  try{
    data = attachCompanyId(data);

    if(id){
      await db.collection(collection)
        .doc(id)
        .set(data,{merge:true});

      clearCloudCache(collection);
      return id;
    }

    const ref = await db.collection(collection).add(data);

    clearCloudCache(collection);
    return ref.id;

  }catch(err){
    console.error(err);
    alert("Firebase save error: " + (err.message || err));
    return null;
  }
}

/* =========================================================
   GENERIC LOAD
========================================================= */

const CACHE_TIME = 10 * 60 * 1000;

function cacheKey(collection){
  return "post91_cache_" + getCurrentCompanyId() + "_" + collection;
}

function cacheTimeKey(collection){
  return "post91_cache_time_" + getCurrentCompanyId() + "_" + collection;
}

function clearCloudCache(collection=null){
  if(collection){
    localStorage.removeItem(cacheKey(collection));
    localStorage.removeItem(cacheTimeKey(collection));
    return;
  }

  Object.keys(localStorage).forEach(k=>{
    if(k.startsWith("post91_cache_") || k.startsWith("post91_cache_time_")){
      localStorage.removeItem(k);
    }
  });
}

async function loadFromCloud(collection, forceRefresh=false){
  try{
    const now = Date.now();
    const cKey = cacheKey(collection);
    const tKey = cacheTimeKey(collection);

    const cached = localStorage.getItem(cKey);
    const cachedTime = Number(localStorage.getItem(tKey) || 0);

    if(!forceRefresh && cached && now - cachedTime < CACHE_TIME){
      return JSON.parse(cached);
    }

    const companyId = getCurrentCompanyId();

    let snapshot = await db.collection(collection)
      .where("companyId","==",companyId)
      .get();

    let arr=[];

    snapshot.forEach(doc=>{
      arr.push({
        id:doc.id,
        ...doc.data()
      });
    });

    localStorage.setItem(cKey, JSON.stringify(arr));
    localStorage.setItem(tKey, String(now));

    return arr;

  }catch(err){
    console.error(err);

    try{
      const cached = localStorage.getItem(cacheKey(collection));
      if(cached){
        return JSON.parse(cached);
      }
    }catch(e){}

    return [];
  }
}

/* =========================================================
   LOAD WITH LEGACY FALLBACK
   This helps old migrated data where companyId may be:
   - mixed case email
   - missing
   - stored as old email
========================================================= */

async function loadFromCloudSmart(collection){
  try{
    let companyId = getCurrentCompanyId();

    let exact = await loadFromCloud(collection);

    if(exact.length > 0){
      return exact;
    }

    const user = JSON.parse(localStorage.getItem("post91CurrentUser") || "{}");

    const possibleIds = [
      user.companyId,
      user.businessId,
      user.ownerEmail,
      user.parentCompanyId,
      user.email
    ]
    .map(x=>String(x || "").trim())
    .filter(Boolean);

    let all = [];

    for(const id of possibleIds){
      const snap = await db.collection(collection)
        .where("companyId","==",id)
        .get();

      snap.forEach(doc=>{
        if(!all.find(x=>x.id===doc.id)){
          all.push({id:doc.id,...doc.data()});
        }
      });
    }

    return all;

  }catch(err){
    console.error(err);
    return [];
  }
}

/* =========================================================
   GENERIC DELETE
========================================================= */

async function deleteFromCloud(collection,id){
  try{
    await db.collection(collection).doc(id).delete();

    clearCloudCache(collection);
    return true;

  }catch(err){
    console.error(err);
    alert("Firebase delete error: " + (err.message || err));
    return false;
  }
}

/* =========================================================
   UPDATE OLD DOCUMENTS COMPANY ID
   Run only when needed from browser console:
   fixCompanyIdForCollection("salesInvoices")
========================================================= */

async function fixCompanyIdForCollection(collection){
  const companyId = getCurrentCompanyId();

  const snap = await db.collection(collection).get();

  let count = 0;

  for(const doc of snap.docs){
    const data = doc.data();

    if(
      !data.companyId ||
      String(data.companyId).trim().toLowerCase() !== companyId
    ){
      await db.collection(collection).doc(doc.id).set({
        companyId,
        updatedAt:new Date().toISOString()
      },{merge:true});

      count++;
    }
  }

  console.log("Updated companyId documents:", collection, count);
  alert("Updated " + count + " records in " + collection);
}

if(typeof loadFromCloudSmart === "undefined"){
  var loadFromCloudSmart = loadFromCloud;
}