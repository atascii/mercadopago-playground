import express from "express";
import cors from "cors";
import { randomUUID } from "node:crypto";
import { MercadoPagoConfig, Preference, Payment } from "mercadopago";
import "dotenv/config";

const app = express();
const PORT = 3000;

const requiredEnvironmentVariables = ["MP_ACCESS_TOKEN", "MP_PUBLIC_BASE_URL", "MP_INTEGRATOR_ID"];
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
  options: {
    integratorId: process.env.MP_INTEGRATOR_ID,
  },
});

app.get("/", (req, res) => {
  res.send("test api");
});

const DEFAULT_PAYMENTS_LIMIT = 10;
const MAX_PAYMENTS_LIMIT = 50;

const getPaginationValue = (value, fallback, maximum) => {
  const parsedValue = Number.parseInt(String(value), 10);

  if (!Number.isFinite(parsedValue) || parsedValue < 0) return fallback;

  return Math.min(parsedValue, maximum);
};

// Lista pagos sin exponer la respuesta completa de Mercado Pago al navegador.
app.get("/payments", async (req, res) => {
  const offset = getPaginationValue(req.query.offset, 0, Number.MAX_SAFE_INTEGER);
  const limit = getPaginationValue(req.query.limit, DEFAULT_PAYMENTS_LIMIT, MAX_PAYMENTS_LIMIT);

  try {
    const payment = new Payment(client);
    const result = await payment.search({
      options: { limit, offset, sort: "date_created", criteria: "desc" },
    });

    const payments = (result.results || []).map((paymentResult) => ({
      id: paymentResult.id || null,
      dateCreated: paymentResult.date_created || null,
      payerEmail: paymentResult.payer?.email || null,
      paymentMethod: paymentResult.payment_method_id || null,
      paymentType: paymentResult.payment_type_id || null,
      amount: paymentResult.transaction_amount ?? null,
      currency: paymentResult.currency_id || "ARS",
      status: paymentResult.status || "unknown",
      statusDetail: paymentResult.status_detail || null,
    }));

    res.json({
      payments,
      paging: {
        total: result.paging?.total || 0,
        limit: result.paging?.limit || limit,
        offset: result.paging?.offset || offset,
      },
    });
  } catch (error) {
    console.error("Error al listar pagos:", error);
    res.status(502).json({ error: "No se pudieron obtener los pagos de Mercado Pago" });
  }
});

const normalizePreferenceItem = (item) => {
  if (!item || typeof item !== "object") return null;

  const unitPrice = Number(item.unit_price ?? item.price);
  const pictureUrl = item.picture_url || item.image;

  if (!Number.isFinite(unitPrice) || unitPrice <= 0) return null;

  return {
    ...(item.id !== undefined ? { id: String(item.id) } : {}),
    title: item.title,
    ...(item.description ? { description: item.description } : {}),
    ...(typeof pictureUrl === "string" && pictureUrl.startsWith("http") ? { picture_url: pictureUrl } : {}),
    quantity: Number(item.quantity) || 1,
    unit_price: unitPrice,
    currency_id: item.currency_id || "ARS",
  };
};

// Endpoint compartido por ecommerce y API Playground.
app.post("/create_preference", async (req, res) => {
  if (!Array.isArray(req.body) || req.body.length === 0) {
    return res.status(400).json({ error: "Se requiere al menos un producto" });
  }

  const items = req.body.map(normalizePreferenceItem);

  if (items.some((item) => !item || !item.title)) {
    return res.status(400).json({ error: "Cada producto requiere título y un precio numérico mayor a cero" });
  }

  try {
    const externalReference = randomUUID();
    const preference = new Preference(client);

    const backUrlsDomain = publicBaseUrl

    const result = await preference.create({
      body: {
        items,
        payment_methods: {
          installments: 6,
          excluded_payment_methods: [{ id: "visa" }],
        },
        external_reference: externalReference, // identificador de operacion
        back_urls: {
          success: `${backUrlsDomain}/success`,
          failure: `${backUrlsDomain}/failure`, // volver sin pago / pago rechazado

          pending: `${backUrlsDomain}/pending`,
        },
        auto_return: "approved",
        notification_url: `${backUrlsDomain}/webhook`,
      },
    });

    // Esto es lo que le mandás al frontend
    res.json({ id: result.id, init_point: result.init_point, external_reference: externalReference, result });
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

  console.log("[WEBHOOK] Notificación recibida ----------------------------------")
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

      console.log("[PAYMENT INFO] -----")
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
