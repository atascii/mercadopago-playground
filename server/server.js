import express from "express";
import cors from "cors";
import { MercadoPagoConfig, Preference } from "mercadopago";

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Inicializar el cliente con tu Access Token de prueba
const client = new MercadoPagoConfig({
  accessToken:
    "APP_USR-6422904502150751-071716-d333ac228a382e61f1999a64794de4b8-3548269892",
});

app.get("/", (req, res) => {
  res.send("test");
});

// Endpoint para crear la preferencia
app.post("/create_preference", async (req, res) => {
  try {
    const preference = new Preference(client);

    const result = await preference.create({
      body: {
        items: [
          {
            title: req.body.title || "Mi producto",
            quantity: Number(req.body.quantity) || 1,
            unit_price: Number(req.body.price) || 100,
            currency_id: "ARS",
          },
        ],
        back_urls: {
          success: "https://localhost:3000/success",
          failure: "https://localhost:3000/failure",
          pending: "https://localhost:3000/pending",
        },
        auto_return: "approved",
      },
    });

    // Esto es lo que le mandás al frontend
    res.json({ id: result.id, result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al crear la preferencia" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
