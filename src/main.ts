import './style.css'

const btnGoToPayment = document.getElementById("btnGoToPayment")

btnGoToPayment?.addEventListener("click", async () => {
  try {
    const response = await fetch("http://localhost:3000/create_preference", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "Celular Samsung",
        quantity: 1,
        price: 50000,
      }),
    })

    const data = await response.json()
    window.location.href = data.init_point
  } catch (error) {
    console.error("Error al crear la preferencia:", error)
  }
})



