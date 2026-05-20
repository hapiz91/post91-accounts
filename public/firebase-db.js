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

  LEDGER: "ledgerEntries"
};

function getCurrentCompanyId(){

  try{

    const user =
      JSON.parse(localStorage.getItem("post91CurrentUser") || "{}");

    return user.companyId ||
           user.businessId ||
           user.email ||
           "default-company";

  }catch(e){

    return "default-company";
  }
}

/* =========================================================
   GENERIC SAVE
========================================================= */

async function saveToCloud(collection,data,id=null){

  try{

    data.companyId = getCurrentCompanyId();

    data.updatedAt = new Date().toISOString();

    if(!data.createdAt){

      data.createdAt = new Date().toISOString();
    }

    if(id){

      await db.collection(collection)
        .doc(id)
        .set(data,{merge:true});

      return id;
    }

    const ref =
      await db.collection(collection)
      .add(data);

    return ref.id;

  }catch(err){

    console.error(err);

    alert("Firebase save error");

    return null;
  }
}

/* =========================================================
   GENERIC LOAD
========================================================= */

async function loadFromCloud(collection){

  try{

    const snapshot =
      await db.collection(collection)
      .where(
        "companyId",
        "==",
        getCurrentCompanyId()
      )
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
   GENERIC DELETE
========================================================= */

async function deleteFromCloud(collection,id){

  try{

    await db.collection(collection)
      .doc(id)
      .delete();

    return true;

  }catch(err){

    console.error(err);

    return false;
  }
}