const { exec } = require("child_process");
const path = require("path");

async function deployToStylus() {
  try {
    const projectPath = path.join(__dirname);
    console.log("Checking contract...");

    // Primero verificar que el contrato compile
    await new Promise((resolve, reject) => {
      exec(
        "cargo stylus check",
        {
          cwd: projectPath,
          env: {
            ...process.env,
            RUST_LOG: "info",
          },
        },
        (error, stdout, stderr) => {
          if (error) {
            console.error(`Check Error: ${error}`);
            return reject(error);
          }
          console.log("Check output:", stdout);
          resolve(stdout);
        }
      );
    });

    console.log("Deploying contract...");
    const result = await new Promise((resolve, reject) => {
      exec(
        `cargo stylus deploy --no-verify --private-key=${process.env.STYLUS_PRIVATE_KEY}`,
        {
          cwd: projectPath,
          env: {
            ...process.env,
            RUST_LOG: "info",
          },
        },
        (error, stdout, stderr) => {
          if (error) {
            console.error(`Deploy Error: ${error}`);
            return reject(error);
          }
          console.log("Deploy output:", stdout);
          resolve(stdout);
        }
      );
    });

    const addressMatch = result.match(
      /Program deployed to address (0x[a-fA-F0-9]{40})/
    );
    return addressMatch ? addressMatch[1] : null;
  } catch (error) {
    console.error("Error deploying to Stylus:", error);
    throw error;
  }
}

module.exports = { deployToStylus };
