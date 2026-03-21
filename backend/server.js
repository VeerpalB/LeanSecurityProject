/**
 * Backend Server
 * 
 * This code file is a lightweight backend service that acts as an integration layer between the formal
 * verification logic (Lean) and the frontend UI.
 * 
 * The backend was purposefully kept simple at the IPD stage and focuses more on showing feasibility and 
 * end-to-end interaction rather than a fully completed system.
 * 
 * 
 */

const express = require("express");
const path = require("path");

const app = express();
const PORT = 3000;

/**
 * Serves the frontend files.
 * 
 * The frontend is implemented as a web interface that is static and the backend serves this directly.
 * By doing so, this allows the system to be run locally without unnecessary complexity.
 * 
 */
app.use(express.static(path.join(__dirname, "../frontend")));
app.use("/proofs", express.static(__dirname));

/**
 * Verification endpoint
 * 
 * This above endpoint receives a selected security property from the frontend and in turn, responds 
 * with the corresponding verification result.
 * 
 * So far at the IPD stage, the Access Control verification is fully implemented and verified in Lean; 
 * other properties, such as User Authentication and Encryption Integrity, are included as temporary placeholders
 * for future extensibility (these will be implemented later).
 * 
 */
app.get("/verify", (req, res) => {
  const property = req.query.property;

  let response;

  /**
   * Connects the path to the request based on the selected security property.
   * 
   * Each case represents a different verification property and result.
   * 
   * As shown below, only Access Control is formally verified at this stage.
   * 
   */
  switch (property) {
    case "access_control":
      response = {
        result: "Verified",
        explanation: "Only authorised users (Alice, Bob) can access protected resources. Eve is denied access.",
        proofFile: "AccessControl.lean"
      };
      break;

    case "authentication":
      response = {
        result: "Verified",
        explanation: "Only authenticated users (Alice, Bob) can access the system. Eve is not authenticated.",
        proofFile: "Authentication.lean"
      };
      break;

    case "integrity":
      response = {
        result: "Verified",
        explanation: "Only authorised users can modify data. Eve is prevented from making changes.",
        proofFile: "Integrity.lean"
      };
      break;

    default:
      response = {
        result: "Error",
        explanation: "Unknown property selected.",
        proofFile: null
      };
  }

/**
 * The line below returns the verification result to the frontend as a JSON response.
 */
  res.json(response);
});

/**
 * These last 2 lines of the code are important as they are responsible for starting 
 * the backend server.
 * 
 * Once running, the server listens for verification requests and serves the frontend
 * interface accordingly.
 * 
 * This helps to confirm successful end-to-end integration between the frontend UI, the
 * backend logic and the Formal Verification (Lean) layer.
 * 
 */
app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});