const fs = require('fs');
const axios = require('axios');
const { exec } = require("child_process");
const path = require('path');
const { deployToArbitrum } = require('../../solidityBranch/deployer.js');
const projectDir = __dirname;

function runCommand(command) {
    return new Promise((resolve, reject) => {
      const process = exec(command,{cwd:projectDir}, (error, stdout, stderr) => {
        if (error) {
          console.error(`Error: ${error.message}`);
          return resolve(stderr || stdout);
        }
        resolve(stdout);
      });
  
      process.stdout.on("data", (data) => {
        console.log(data.toString());
      });
  
      process.stderr.on("data", (data) => {
        console.error(data.toString());
      });
    });
}

module.exports = { deployToArbitrum };

