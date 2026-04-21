# LeanSecurityProject
## Formal Methods for Security Verification
 
A web-based formal verification system that uses the Lean 4 theorem prover to mathematically prove security properties — access control, authentication and integrity — from user-defined models.

## Project Overview

This project demonstrates how formal verification can be integrated into a practical, accessible system. Users define a security model through a structured web interface, select a security property, and the system dynamically generates a Lean 4 proof at runtime, executes it via the Lean command-line interface, and returns a mathematically verified result.

**Key features:**
- Dynamic Lean 4 proof generation from user-defined input at runtime
- Three security properties: Access Control, Authentication, Integrity
- Structured model builder with preset scenarios and real-time validation
- Human-readable explanation of verification results
- Generated Lean source displayed transparently for inspection
- 26-test Jest/Supertest test suite

## System Architecture
Three-tier layered architecture separating presentation, integration logic, and formal verification.

## Prerequisites

Before running this project, ensure you have the following installed:

**1. Node.js** (v18 or later)
Download from: https://nodejs.org/

**2. Lean 4 via elan**

**On Mac/Linux:**

Install elan (the Lean version manager) by running in your terminal:
curl https://raw.githubusercontent.com/leanprover/elan/master/elan-init.sh -sSf | sh
After installation, restart your terminal.

**On Windows:**
Download from: https://github.com/leanprover/elan/releases
Download elan-x86_64-pc-windows-msvc.zip, extract and run the installer.
After installation, restart your terminal.

After installing elan, the correct Lean version will be downloaded automatically when you first run lake build in the project directory.

## Setup and Running Instructions

The commands below can be run in any terminal — including the integrated terminal in Visual Studio Code (Terminal → New Terminal), Windows PowerShell, or Mac Terminal. This project was however created within VSCode so it would be recommended to run terminal commands from here.

**Step 1 — Clone the repository**
```bash
git clone https://github.com/VeerpalB/LeanSecurityProject.git
cd LeanSecurityProject
```

**Step 2 — Install backend dependencies**
```bash
cd backend
npm install
```

**Step 3 — Install root-level test dependencies** (required for Jest tests)
```bash
cd ..
npm install supertest --save-dev
```

**Step 4 — Build the Lean project** (first-time setup only)
```bash
lake build
```
This may take a few minutes on first run as it downloads the Lean toolchain.
If Lake is not found, ensure elan is installed and restart your terminal.

**Step 5 — Start the backend server**
```bash
cd backend
node server.js
```
You should see:
Backend running at http://localhost:3000
Using Lean at: C:\Users...\lean.exe (the path shown depends on the user's system)

Note: If you see an error saying lean.exe cannot be found, 
open `backend/server.js` and update the `LEAN_PATH` variable (line 22 in server.js) to match your system.

You can find your Lean path by running:
- Windows: `where lean`
- Mac/Linux: `which lean`

**Step 6 — Open the application**

Open your web browser and navigate to:
http://localhost:3000

The interface will load automatically.

## Running the Tests

From the project root directory:
```bash
node backend/node_modules/jest/bin/jest.js tests/verify.test.js --testTimeout=20000
```
### Note: run the above commands from the project root directory (LeanSecurityProject/), not from inside backend/

All 26 tests should pass. Tests include unit tests of the model parser, integration tests of the /verify endpoint across all three security properties, and negative tests for error handling.

## How to Use the System

1. **Load a preset** or define your own model by adding users and setting each as Authorised or Unauthorised
2. **Select a security property** from the dropdown (Authentication, Access Control, or Integrity)
3. **Click Verify** — the system will generate a Lean 4 proof and run it
4. **View the result** — a green banner confirms verification; the explanation panel shows which users were permitted or denied; click "Show generated Lean 4 proof" to inspect the formal proof

## Project Structure
LeanSecurityProject/
├── backend/
│   ├── server.js              # Main backend server + proof generator
│   ├── AccessControl.lean     # Reference Lean proof (access control)
│   ├── Authentication.lean    # Reference Lean proof (authentication)
│   ├── Integrity.lean         # Reference Lean proof (integrity)
│   └── package.json
├── frontend/
│   ├── index.html             # Frontend interface
│   └── style.css              # Stylesheet
├── tests/
│   └── verify.test.js         # Jest + Supertest test suite
├── LeanSecurityProject/       # Lean project files
├── lakefile.toml              # Lake build configuration
├── lean-toolchain             # Lean version specification
└── README.md

## Technologies Used

| Component | Technology |
|-----------|-----------|
| Formal Verification | Lean 4 (v4.29.0) |
| Build Tool | Lake |
| Backend | Node.js + Express |
| Frontend | HTML, CSS, JavaScript |
| Testing | Jest + Supertest |
| Version Control | Git + GitHub |

## Author

Veerpal Birdi — Final Year Undergraduate Project, University of Westminster
Module: 6COSC023W Computer Science Final Project
