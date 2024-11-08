const express = require("express");
const { processInput } = require("./main.js");
const cors = require("cors");
const { deployToArbitrum } = require("../solidityBranch/deployer.js");
require("dotenv").config({
  path: require("path").resolve(__dirname, "../.env"),
});

const app = express();

app.use(cors());
app.use(express.json());

// Ruta para manejar el input del usuario
app.post("/api/process", async (req, res) => {
  try {
    // console.log("Solicitud recibida en el backend:", req.body);

    const { userTask } = req.body;
    const result = await processInput(userTask);

    // console.log("Respuesta generada:", result);

    if (result) {
      res.json(result);
    } else {
      console.error("Error: Respuesta vacía o nula.");
      res
        .status(500)
        .json({ error: "Error en la generación de la respuesta." });
    }
  } catch (error) {
    console.error("Error en el backend:", error);
    res.status(500).json({ error: error.message });
  }
});

// Ruta para manejar el despliegue a solana
app.post("/api/deploy/solana", async (req, res) => {
  try {
    const deployedAddress = await deployToSolana();
    if (deployedAddress) {
      res.json({ deployedAddress });
    } else {
      res.status(500).json({ error: "Failed to deploy contract on solana" });
    }
  } catch (error) {
    console.error("Error en el despliegue en solana:", error);
    res.status(500).json({ error: error.message });
  }
});

// Nueva ruta para manejar el despliegue a Stylus
app.post("/api/deploy/arbitrum", async (req, res) => {
  try {
    const deployedAddress = await deployToArbitrum();
    if (deployedAddress) {
      res.json({ deployedAddress });
    } else {
      res.status(500).json({ error: "Failed to deploy contract on Arbitrum" });
    }
  } catch (error) {
    console.error("Error en el despliegue en Arbitrum:", error);
    res.status(500).json({ error: error.message });
  }
});

// Configuración del puerto
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
