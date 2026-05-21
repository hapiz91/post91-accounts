function getIndustryTemplate(templateKey){

  const templates = {

    general: {
      key: "general",
      name: "General Business",
      dashboardTitle: "Business Dashboard",

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

      itemFields: {
        showPumpFields: false,
        showSpareFields: false,
        showGarageFields: false,
        showTradingFields: false
      }
    }

  };

  return templates[templateKey] || templates.general;
}