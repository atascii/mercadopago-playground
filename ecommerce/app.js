    const products = [
      {
        id: 1,
        title: "Mouse Logitech G502",
        description: "Mouse gaming con sensor HERO 25K, 11 botones programables y peso ajustable.",
        price: 45000,
        image: "/ecommerce/mouse.jpg"
      },
      {
        id: 2,
        title: "Teclado Mecánico Redragon K552",
        description: "Teclado mecánico TKL con switches blue, retroiluminación RGB y cuerpo de aluminio.",
        price: 38000,
        image: "/ecommerce/keyboard.jpg"
      },
      {
        id: 3,
        title: "Monitor Samsung 24\" FHD",
        description: "Monitor IPS 24 pulgadas, 75Hz, FreeSync, bordes ultra delgados.",
        price: 120000,
        image: "/ecommerce/monitor.jpg"
      }
    ]

    const cart = []

    function render() {
      const list = document.getElementById("productList")
      list.innerHTML = products.map(p => `
        <div class="col-md-4">
          <div class="card h-100 shadow-sm">
            <img src="${p.image}" class="card-img-top" alt="${p.title}">
            <div class="card-body d-flex flex-column">
              <h5 class="card-title">${p.title}</h5>
              <p class="card-text text-muted small">${p.description}</p>
              <p class="fw-bold fs-5 mt-auto">$${p.price.toLocaleString("es-AR")}</p>
              <div class="d-flex align-items-center gap-2 mt-2">
                <label class="form-label mb-0 small">Cant:</label>
                <input type="number" id="qty-${p.id}" class="form-control form-control-sm" style="width:70px" value="1" min="1" max="10">
                <button class="btn btn-primary btn-sm ms-auto" onclick="addToCart(${p.id})">
                  <i class="bi bi-cart-plus"></i> Agregar
                </button>
              </div>
            </div>
          </div>
        </div>
      `).join("")
    }

    function addToCart(productId) {
      const product = products.find(p => p.id === productId)
      const qty = parseInt(document.getElementById(`qty-${productId}`).value) || 1

      const existing = cart.find(item => item.id === productId)
      if (existing) {
        existing.quantity += qty
      } else {
        cart.push({ ...product, quantity: qty })
      }

      updateCartCount()
    }

    function updateCartCount() {
      const total = cart.reduce((sum, item) => sum + item.quantity, 0)
      document.getElementById("cartCount").textContent = total
    }

    document.getElementById("btnCheckout").addEventListener("click", () => {
      if (cart.length === 0) {
        alert("El carrito está vacío")
        return
      }
      showCheckout()
    })

    document.getElementById("btnBackToStore").addEventListener("click", () => {
      showStore()
    })

    document.getElementById("btnPay").addEventListener("click", async () => {
      if (cart.length === 0) {
        alert("El carrito está vacío")
        return
      }

      const items = cart.map(item => ({
        title: item.title,
        quantity: item.quantity,
        price: item.price,
      }))

      try {
        const response = await fetch("http://localhost:3000/create_preference", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(items),
        })

        const data = await response.json()
        window.location.href = data.init_point
      } catch (error) {
        console.error("Error al crear la preferencia:", error)
        alert("Error al procesar el pago")
      }
    })

    function showCheckout() {
      document.getElementById("productList").parentElement.classList.add("d-none")
      document.getElementById("checkoutSection").classList.remove("d-none")
      renderCheckout()
    }

    function showStore() {
      document.getElementById("productList").parentElement.classList.remove("d-none")
      document.getElementById("checkoutSection").classList.add("d-none")
    }

    function renderCheckout() {
      const tbody = document.getElementById("checkoutItems")
      tbody.innerHTML = cart.map((item, index) => `
        <tr>
          <td>${item.title}</td>
          <td>$${item.price.toLocaleString("es-AR")}</td>
          <td>
            <input type="number" class="form-control form-control-sm" value="${item.quantity}" min="1" max="99"
              onchange="updateQuantity(${index}, this.value)">
          </td>
          <td>$${(item.price * item.quantity).toLocaleString("es-AR")}</td>
          <td>
            <button class="btn btn-outline-danger btn-sm" onclick="removeFromCart(${index})">
              <i class="bi bi-trash"></i>
            </button>
          </td>
        </tr>
      `).join("")

      const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
      document.getElementById("checkoutTotal").textContent = `$${total.toLocaleString("es-AR")}`
    }

    function updateQuantity(index, value) {
      const qty = parseInt(value) || 1
      cart[index].quantity = qty
      updateCartCount()
      renderCheckout()
    }

    function removeFromCart(index) {
      cart.splice(index, 1)
      updateCartCount()
      if (cart.length === 0) {
        showStore()
      } else {
        renderCheckout()
      }
    }

    window.addToCart = addToCart
    window.updateQuantity = updateQuantity
    window.removeFromCart = removeFromCart

    render()