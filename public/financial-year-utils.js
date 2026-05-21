/* =========================================================
   POST91 FINANCIAL YEAR VALIDATION ENGINE
========================================================= */

const POST91_FY_COLLECTION = "financialYears";

/* =========================================================
   LOAD ACTIVE FINANCIAL YEAR
========================================================= */

async function getActiveFinancialYear(){
  try{
    let years = [];

    if(typeof loadFromCloudSmart === "function"){
      years = await loadFromCloudSmart(POST91_FY_COLLECTION);
    }else if(typeof loadFromCloud === "function"){
      years = await loadFromCloud(POST91_FY_COLLECTION);
    }

    let active = years.find(y=>y.isActive || y.status==="Active");

    if(active){
      localStorage.setItem("post91ActiveFinancialYear", JSON.stringify(active));
      return active;
    }

    let local = JSON.parse(localStorage.getItem("post91ActiveFinancialYear") || "{}");

    if(local && local.yearName){
      return local;
    }

    return null;

  }catch(err){
    console.error("Active financial year load error:", err);

    try{
      let local = JSON.parse(localStorage.getItem("post91ActiveFinancialYear") || "{}");
      if(local && local.yearName) return local;
    }catch(e){}

    return null;
  }
}

/* =========================================================
   DATE CHECK
========================================================= */

function isDateInsideFinancialYear(entryDate, fy){
  if(!entryDate || !fy)return false;

  let d = new Date(entryDate);
  let start = new Date(fy.startDate);
  let end = new Date(fy.endDate);

  if(isNaN(d) || isNaN(start) || isNaN(end))return false;

  return d >= start && d <= end;
}

/* =========================================================
   LOCK CHECK
========================================================= */

function isFinancialYearLocked(fy){
  return String(fy.status || "").toLowerCase() === "locked";
}

/* =========================================================
   MAIN VALIDATION
========================================================= */

async function validateFinancialYearForDate(entryDate){
  let fy = await getActiveFinancialYear();

  if(!fy){
    alert("No active financial year found. Please create and activate a financial year first.");
    return null;
  }

  if(isFinancialYearLocked(fy)){
    alert("The active financial year is locked. You cannot save transactions in a locked year.");
    return null;
  }

  if(!isDateInsideFinancialYear(entryDate, fy)){
    alert(
      "Transaction date is outside the active financial year.\n\n" +
      "Active Year: " + fy.yearName + "\n" +
      "Start: " + fy.startDate + "\n" +
      "End: " + fy.endDate
    );
    return null;
  }

  return fy;
}

/* =========================================================
   ATTACH FINANCIAL YEAR TO TRANSACTION DATA
========================================================= */

async function attachFinancialYearToTransaction(data, entryDate){
  let fy = await validateFinancialYearForDate(entryDate);

  if(!fy){
    return null;
  }

  data.financialYear = fy.yearName || "";
  data.financialYearId = fy.id || "";
  data.financialYearStart = fy.startDate || "";
  data.financialYearEnd = fy.endDate || "";

  return data;
}

/* =========================================================
   OPTIONAL REPORT FILTER
========================================================= */

async function filterByActiveFinancialYear(records, dateFieldNames=[]){
  let fy = await getActiveFinancialYear();

  if(!fy){
    return records || [];
  }

  return (records || []).filter(r=>{
    if(r.financialYear && r.financialYear === fy.yearName){
      return true;
    }

    for(let field of dateFieldNames){
      if(r[field] && isDateInsideFinancialYear(r[field], fy)){
        return true;
      }
    }

    return false;
  });
}

/* =========================================================
   DISPLAY ACTIVE FY
========================================================= */

async function showActiveFinancialYearBadge(elementId){
  let el = document.getElementById(elementId);
  if(!el)return;

  let fy = await getActiveFinancialYear();

  if(!fy){
    el.textContent = "No Active Financial Year";
    return;
  }

  el.textContent = `${fy.yearName} (${fy.startDate} to ${fy.endDate})`;
}