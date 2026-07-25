import express from "express";
import cors from "cors";
import { MercadoPagoConfig, Preference, Payment } from "mercadopago";
import "dotenv/config";

const app = express();
const PORT = 3000;

const requiredEnvironmentVariables = ["MP_ACCESS_TOKEN", "MP_PUBLIC_BASE_URL"];
const missingEnvironmentVariables = requiredEnvironmentVariables.filter(
  (variableName) => !process.env[variableName],
);

if (missingEnvironmentVariables.length > 0) {
  console.error(
    `Faltan variables de entorno requeridas: ${missingEnvironmentVariables.join(", ")}. Copiá .env.example a .env y completalas.`,
  );
  process.exit(1);
}

const publicBaseUrl = process.env.MP_PUBLIC_BASE_URL.replace(/\/+$/, "");

app.use(cors());
app.use(express.json());

// Inicializar el cliente con tu Access Token de prueba
const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN,
});

app.get("/", (req, res) => {
  res.send("test api");
});

// Endpoint para crear la preferencia
app.post("/create_preference", async (req, res) => {
  try {
    const preference = new Preference(client);

    const backUrlsDomain = publicBaseUrl

    const result = await preference.create({
      body: {
        items: req.body.map((item) => ({
          title: item.title,
          quantity: Number(item.quantity) || 1,
          unit_price: Number(item.price),         
          currency_id: "ARS",
        })),
        back_urls: {
          success: `${backUrlsDomain}/success`,
          failure: `${backUrlsDomain}/failure`,
          pending: `${backUrlsDomain}/pending`,
        },
        auto_return: "approved",
        notification_url: `${backUrlsDomain}/webhook`,
      },
    });

    // Esto es lo que le mandás al frontend
    res.json({ id: result.id, init_point: result.init_point, result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al crear la preferencia" });
  }
});

app.get("/success", (req, res) => {
  console.log("[SUCCESS]")
  console.table(req.query)
  res.send("SUCCESS");
});

app.get("/failure", (req, res) => {
  console.log("[FAILURE]")
  console.table(req.query)
  res.send("FAILURE");
});

app.get("/pending", (req, res) => {
  console.log("[PENDING]")
  console.table(req.query)
  res.send("PENDING");
});

// Webhook de notificaciones de Mercado Pago
app.post("/webhook", async (req, res) => {
  const { query, body } = req

  console.log("[WEBHOOK] Notificación recibida")
  console.log("Topic:", query.topic || body.type)
  console.log("ID:", query.id || body.data?.id)

  // Si es una notificación de pago, consultar la info completa  
  const paymentId = body.data?.id || query.id
  const topic = body.type || query.topic

  if (topic === "payment" && paymentId) {
    try {

      // Esta clase hace un get a la api 'Obtener pago' 
      // https://www.mercadopago.com.ar/developers/es/reference/online-payments/checkout-pro/get-payment/get
      const payment = new Payment(client)
      const paymentInfo = await payment.get({ id: paymentId })

      console.log("[PAYMENT INFO]")
      console.log("Status:", paymentInfo.status)
      console.log("Status detail:", paymentInfo.status_detail)
      console.log("Monto:", paymentInfo.transaction_amount)
      console.log("Método:", paymentInfo.payment_method_id)
      console.log("Email pagador:", paymentInfo.payer?.email)
      console.log("External reference:", paymentInfo.external_reference)
    } catch (error) {
      console.error("Error al consultar pago:", error.message)
    }
  }

  // Responder 200 para que MP no reintente
  res.sendStatus(200)
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
