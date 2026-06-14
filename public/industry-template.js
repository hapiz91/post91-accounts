function normalizeIndustryTemplateKey(templateKey){
  const raw = String(templateKey || "")
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

  const aliases = {
    service: "services",
    service_company: "services",
    service_provider: "services",
    services_company: "services",
    spare_parts_shop: "spare_parts",
    spare_parts: "spare_parts",
    garage_workshop: "garage",
    workshop: "garage",
    pump: "pump_service",
    pump_service_business: "pump_service",
    retail_shop: "retail",
    retail_trading: "retail",
    contracting_company: "contracting",
    contractor: "contracting",
    consultancy: "professional_services",
    consulting: "professional_services",
    professional_service: "professional_services",
    professional_services: "professional_services"
  };

  return aliases[raw] || raw || "general";
}

function getIndustryTemplate(templateKey){

  const key = normalizeIndustryTemplateKey(templateKey);

  const templates = {

    general: {
      key: "general",
      name: "General Business",
      dashboardTitle: "Business Dashboard",
      quotationTitle: "Quotation",
      deliveryTitle: "Delivery Note",
      invoiceTitle: "Sales Invoice",
      itemName: "Item / Service",
      typeName: "Type",
      showTechnicalDetails: false,

      itemFields: {
        showPumpFields: false,
        showSpareFields: false,
        showGarageFields: false,
        showTradingFields: true
      }
    },

    trading: {
      key: "trading",
      name: "Trading",
      dashboardTitle: "Trading Dashboard",
      quotationTitle: "Sales Quotation",
      deliveryTitle: "Delivery Order",
      invoiceTitle: "Sales Invoice",
      itemName: "Item",
      typeName: "Item Type",
      showTechnicalDetails: false,

      itemFields: {
        showPumpFields: false,
        showSpareFields: false,
        showGarageFields: false,
        showTradingFields: true
      }
    },

    spare_parts: {
      key: "spare_parts",
      name: "Spare Parts Shop",
      dashboardTitle: "Spare Parts Dashboard",
      quotationTitle: "Parts Quotation",
      deliveryTitle: "Parts Delivery Order",
      invoiceTitle: "Parts Sales Invoice",
      itemName: "Part / Item",
      typeName: "Vehicle / Machine Type",
      showTechnicalDetails: false,

      itemFields: {
        showPumpFields: false,
        showSpareFields: true,
        showGarageFields: false,
        showTradingFields: true
      }
    },

    garage: {
      key: "garage",
      name: "Garage / Workshop",
      dashboardTitle: "Garage Dashboard",
      quotationTitle: "Repair Quotation",
      deliveryTitle: "Job Delivery Order",
      invoiceTitle: "Repair Invoice",
      itemName: "Service / Part",
      typeName: "Vehicle / Machine Type",
      showTechnicalDetails: true,
      technicalTitle: "Vehicle / Job Details",

      itemFields: {
        showPumpFields: false,
        showSpareFields: true,
        showGarageFields: true,
        showTradingFields: true
      }
    },

    pump_service: {
      key: "pump_service",
      name: "Pump Service",
      dashboardTitle: "Pump Service Dashboard",
      quotationTitle: "Pump Service Quotation",
      deliveryTitle: "Pump Service Delivery Order",
      invoiceTitle: "Pump Service Invoice",
      itemName: "Service / Part",
      typeName: "Pump / Machine Type",
      showTechnicalDetails: true,
      technicalTitle: "Pump / Vehicle / Technical Details",

      itemFields: {
        showPumpFields: true,
        showSpareFields: true,
        showGarageFields: false,
        showTradingFields: true
      }
    },

    services: {
      key: "services",
      name: "Services Company",
      dashboardTitle: "Services Dashboard",
      quotationTitle: "Service Quotation",
      deliveryTitle: "Service Delivery Note",
      invoiceTitle: "Service Invoice",
      itemName: "Service",
      typeName: "Service Type",
      showTechnicalDetails: false,

      itemFields: {
        showPumpFields: false,
        showSpareFields: false,
        showGarageFields: false,
        showTradingFields: false
      }
    },

    contracting: {
      key: "contracting",
      name: "Contracting Company",
      dashboardTitle: "Contracting Dashboard",
      quotationTitle: "Contract Quotation",
      deliveryTitle: "Work Completion Note",
      invoiceTitle: "Contract Invoice",
      itemName: "Work / Service",
      typeName: "Work Type",
      showTechnicalDetails: false,

      itemFields: {
        showPumpFields: false,
        showSpareFields: false,
        showGarageFields: false,
        showTradingFields: false
      }
    },

    retail: {
      key: "retail",
      name: "Retail Shop",
      dashboardTitle: "Retail Dashboard",
      quotationTitle: "Sales Quotation",
      deliveryTitle: "Delivery Order",
      invoiceTitle: "Retail Invoice",
      itemName: "Product",
      typeName: "Product Type",
      showTechnicalDetails: false,

      itemFields: {
        showPumpFields: false,
        showSpareFields: false,
        showGarageFields: false,
        showTradingFields: true
      }
    },

    manufacturing: {
      key: "manufacturing",
      name: "Manufacturing",
      dashboardTitle: "Manufacturing Dashboard",
      quotationTitle: "Product Quotation",
      deliveryTitle: "Dispatch Note",
      invoiceTitle: "Sales Invoice",
      itemName: "Finished Good / Material",
      typeName: "Product Type",
      showTechnicalDetails: false,

      itemFields: {
        showPumpFields: false,
        showSpareFields: false,
        showGarageFields: false,
        showTradingFields: true
      }
    },

    professional_services: {
      key: "professional_services",
      name: "Professional Services",
      dashboardTitle: "Professional Services Dashboard",
      quotationTitle: "Fee Quotation",
      deliveryTitle: "Service Note",
      invoiceTitle: "Fee Invoice",
      itemName: "Service / Fee",
      typeName: "Service Type",
      showTechnicalDetails: false,

      itemFields: {
        showPumpFields: false,
        showSpareFields: false,
        showGarageFields: false,
        showTradingFields: false
      }
    },

    logistics: {
      key: "logistics",
      name: "Logistics / Transport",
      dashboardTitle: "Logistics Dashboard",
      quotationTitle: "Transport Quotation",
      deliveryTitle: "Delivery Note",
      invoiceTitle: "Transport Invoice",
      itemName: "Service / Route",
      typeName: "Service Type",
      showTechnicalDetails: false,

      itemFields: {
        showPumpFields: false,
        showSpareFields: false,
        showGarageFields: false,
        showTradingFields: false
      }
    }

  };

  return templates[key] || templates.general;
}
