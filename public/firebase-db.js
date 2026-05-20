/* =========================================================
   POST91 FIREBASE DATABASE ENGINE
========================================================= */

const COLLECTIONS = {
  CUSTOMERS: "customers",
  ITEMS: "items",
  CATEGORIES: "categories",
  BRANDS: "brands",
  MACHINE_TYPES: "machineTypes",

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

      return id;
    }

    const ref = await db.collection(collection).add(data);
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

async function loadFromCloud(collection){
  try{
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

    return arr;

  }catch(err){
    console.error(err);
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