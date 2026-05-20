document.addEventListener("DOMContentLoaded", () => {
  loadRegistrations();
});

async function loadRegistrations() {
  const table = document.getElementById("registrationTable");

  try {
    table.innerHTML = `
      <tr>
        <td colspan="7">Loading...</td>
      </tr>
    `;

    const res = await fetch("/api/post91/admin/registrations");
    const data = await res.json();

    const registrations = data.registrations || [];

    document.getElementById("totalCompanies").textContent = registrations.length;
    document.getElementById("pendingApprovals").textContent =
      registrations.filter(x => normalizeStatus(x.status) === "pending").length;
    document.getElementById("activeCompanies").textContent =
      registrations.filter(x => normalizeStatus(x.status) === "active").length;
    document.getElementById("rejectedCompanies").textContent =
      registrations.filter(x => normalizeStatus(x.status) === "rejected").length;

    if (!registrations.length) {
      table.innerHTML = `
        <tr>
          <td colspan="7">No registration requests found.</td>
        </tr>
      `;
      return;
    }

    table.innerHTML = registrations.map(item => {
      const status = normalizeStatus(item.status);

      return `
        <tr>
          <td>${escapeHtml(item.companyName || item.businessName || "-")}</td>
          <td>${escapeHtml(item.ownerName || item.contactPerson || "-")}</td>
          <td>${escapeHtml(item.email || "-")}</td>
          <td>${escapeHtml(item.mobile || item.phone || "-")}</td>
          <td>${escapeHtml(item.packageName || item.planName || "Trial")}</td>
          <td>
            <span class="status ${status}">
              ${status.toUpperCase()}
            </span>
          </td>
          <td>
            <button class="action-btn approve-btn" onclick="approveCompany('${item.id}')">
              Approve
            </button>
            <button class="action-btn reject-btn" onclick="rejectCompany('${item.id}')">
              Reject
            </button>
          </td>
        </tr>
      `;
    }).join("");

  } catch (error) {
    console.error("Admin load error:", error);
    table.innerHTML = `
      <tr>
        <td colspan="7">Error loading registration data.</td>
      </tr>
    `;
  }
}

async function approveCompany(id) {
  if (!id) return;

  try {
    await fetch(`/api/post91/admin/registrations/${id}/approve`, {
      method: "POST"
    });

    loadRegistrations();
  } catch (error) {
    console.error("Approve error:", error);
    alert("Unable to approve company.");
  }
}

async function rejectCompany(id) {
  if (!id) return;

  try {
    await fetch(`/api/post91/admin/registrations/${id}/reject`, {
      method: "POST"
    });

    loadRegistrations();
  } catch (error) {
    console.error("Reject error:", error);
    alert("Unable to reject company.");
  }
}

function normalizeStatus(status) {
  return String(status || "pending").toLowerCase();
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function logoutAdmin() {
  window.location.href = "/";
}