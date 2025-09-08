// /lib/companionApi.js
const BASE =
  process.env.NEXT_PUBLIC_API_BASE?.replace(/\/+$/, "") ||
  "http://localhost:8080";

async function request(path, { method = "GET", body, headers, withAuth } = {}) {
  const url = `${BASE}${path.startsWith("/") ? "" : "/"}${path}`;

  const init = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(headers || {}),
    },
  };

  if (withAuth) init.credentials = "include";
  if (body !== undefined)
    init.body = typeof body === "string" ? body : JSON.stringify(body);

  const res = await fetch(url, init);

  const text = await res.text().catch(() => "");
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { raw: text };
  }

  if (!res.ok) {
    const errorMsg =
      data?.error || data?.message || res.statusText || "Request failed";
    const err = new Error(errorMsg);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

export async function createCompanionRequest({
  togetherId,
  applicantId,
  message,
}) {
  return request("/api/v1/companion-requests", {
    method: "POST",
    body: { togetherId, applicantId, message },
    withAuth: true,
  });
}

export async function acceptCompanionRequest(requestId) {
  return request(`/api/v1/companion-requests/${requestId}/accept`, {
    method: "POST",
    withAuth: true,
  });
}

export async function rejectCompanionRequest(requestId) {
  return request(`/api/v1/companion-requests/${requestId}/reject`, {
    method: "POST",
    withAuth: true,
  });
}

export async function getReceivedRequests(memberId) {
  return request(`/api/v1/companion-requests/received/${memberId}`, {
    method: "GET",
    withAuth: true,
  });
}

export async function getSentRequests(memberId) {
  return request(`/api/v1/companion-requests/sent/${memberId}`, {
    method: "GET",
    withAuth: true,
  });
}
