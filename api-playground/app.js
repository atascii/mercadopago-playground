const btnGoToPayment = document.getElementById("btnGoToPayment")
const paymentStatus = document.getElementById("paymentStatus")

const items = [
  { title: "Celular Samsung", quantity: 1, price: 50000 },
  { title: "TV Hitachi", quantity: 1, price: 50000 },
]

btnGoToPayment.addEventListener("click", async () => {
  btnGoToPayment.disabled = true
  paymentStatus.textContent = "Creando preferencia de pago…"

  try {
    const response = await fetch("http://localhost:3000/create_preference", {
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
