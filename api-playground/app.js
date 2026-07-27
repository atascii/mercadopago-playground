const btnGoToPayment = document.getElementById("btnGoToPayment")
const paymentStatus = document.getElementById("paymentStatus")
const getPaymentsButton = document.getElementById("getPaymentsButton")
const paymentsStatus = document.getElementById("paymentsStatus")
const paymentsTableContainer = document.getElementById("paymentsTableContainer")
const paymentsTableBody = document.getElementById("paymentsTableBody")
const paymentsPagination = document.getElementById("paymentsPagination")
const paymentsRange = document.getElementById("paymentsRange")
const previousPaymentsButton = document.getElementById("previousPaymentsButton")
const nextPaymentsButton = document.getElementById("nextPaymentsButton")

const apiBaseUrl = "http://localhost:3000"
const paymentsPageSize = 10
let currentPaging = null

const items = [
  {
    id: "4729",
    title: "Celular Samsung",
    description: "Celular Samsung de prueba para Checkout Pro",
    picture_url: "https://placehold.co/600x400/png?text=Celular+Samsung",
    quantity: 1,
    unit_price: 2000,
    currency_id: "ARS",
  },
]

btnGoToPayment.addEventListener("click", async () => {
  btnGoToPayment.disabled = true
  paymentStatus.textContent = "Creando preferencia de pago…"

  try {
    const response = await fetch(`${apiBaseUrl}/create_preference`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(items),
    })

    if (!response.ok) throw new Error("El servidor no pudo crear la preferencia")
    const data = await response.json()
    if (!data.init_point) throw new Error("La respuesta no contiene una URL de pago")

    window.location.href = data.init_point
  } catch (error) {
    console.error("Error al crear la preferencia:", error)
    paymentStatus.textContent = "No se pudo crear la preferencia. Revisá que el servidor esté activo."
    btnGoToPayment.disabled = false
  }
})

const formatAmount = (amount, currency) => typeof amount === "number"
  ? new Intl.NumberFormat("es-AR", { style: "currency", currency: currency || "ARS" }).format(amount)
  : "—"

const formatDate = (value) => {
  if (!value) return "—"

  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? "—" : new Intl.DateTimeFormat("es-AR", { dateStyle: "short", timeStyle: "short" }).format(date)
}

const statusClasses = { approved: "text-bg-success", pending: "text-bg-warning", in_process: "text-bg-warning", rejected: "text-bg-danger", cancelled: "text-bg-secondary", refunded: "text-bg-secondary" }

const cell = (value, className = "") => {
  const element = document.createElement("td")
  element.textContent = value || "—"
  element.className = className
  return element
}

const renderPayments = (payments) => {
  paymentsTableBody.replaceChildren()
  for (const payment of payments) {
    const row = document.createElement("tr")
    row.append(cell(payment.id), cell(formatDate(payment.dateCreated)), cell(payment.payerEmail), cell([payment.paymentMethod, payment.paymentType].filter(Boolean).join(" · ")), cell(formatAmount(payment.amount, payment.currency), "text-end text-nowrap"))
    const statusCell = document.createElement("td")
    const badge = document.createElement("span")
    badge.className = `badge ${statusClasses[payment.status] || "text-bg-secondary"}`
    badge.textContent = payment.status
    statusCell.append(badge)
    if (payment.statusDetail) {
      const detail = document.createElement("small")
      detail.className = "d-block text-secondary mt-1"
      detail.textContent = payment.statusDetail
      statusCell.append(detail)
    }
    row.append(statusCell)
    paymentsTableBody.append(row)
  }
}

const updatePagination = (paging) => {
  const total = paging.total || 0
  const start = total ? paging.offset + 1 : 0
  const end = Math.min(paging.offset + paging.limit, total)
  paymentsRange.textContent = `Mostrando ${start}–${end} de ${total} pagos`
  previousPaymentsButton.disabled = paging.offset === 0
  nextPaymentsButton.disabled = paging.offset + paging.limit >= total
  paymentsPagination.classList.toggle("d-none", total === 0)
}

const loadPayments = async (offset = 0) => {
  getPaymentsButton.disabled = true
  previousPaymentsButton.disabled = true
  nextPaymentsButton.disabled = true
  getPaymentsButton.textContent = "Obteniendo pagos…"
  paymentsStatus.className = "mb-3 text-secondary"
  paymentsStatus.textContent = "Consultando pagos en Mercado Pago…"
  try {
    const parameters = new URLSearchParams({ offset: String(offset), limit: String(paymentsPageSize) })
    const response = await fetch(`${apiBaseUrl}/payments?${parameters}`)
    const data = await response.json()
    if (!response.ok) throw new Error(data.error || "No se pudieron obtener los pagos")
    currentPaging = data.paging
    if (data.payments.length === 0) {
      paymentsTableContainer.classList.add("d-none")
      paymentsPagination.classList.add("d-none")
      paymentsStatus.textContent = "No se encontraron pagos para esta cuenta."
      return
    }
    renderPayments(data.payments)
    paymentsTableContainer.classList.remove("d-none")
    updatePagination(data.paging)
    paymentsStatus.textContent = `${data.paging.total} pago${data.paging.total === 1 ? "" : "s"} encontrado${data.paging.total === 1 ? "" : "s"}.`
  } catch (error) {
    console.error("Error al obtener pagos:", error)
    currentPaging = null
    paymentsTableContainer.classList.add("d-none")
    paymentsPagination.classList.add("d-none")
    paymentsStatus.className = "mb-3 text-danger"
    paymentsStatus.textContent = "No se pudieron obtener los pagos. Revisá que el servidor esté activo."
  } finally {
    getPaymentsButton.disabled = false
    getPaymentsButton.textContent = "Obtener pagos"
    if (currentPaging) updatePagination(currentPaging)
  }
}

getPaymentsButton.addEventListener("click", () => loadPayments(0))
previousPaymentsButton.addEventListener("click", () => currentPaging && loadPayments(Math.max(0, currentPaging.offset - currentPaging.limit)))
nextPaymentsButton.addEventListener("click", () => currentPaging && loadPayments(currentPaging.offset + currentPaging.limit))
