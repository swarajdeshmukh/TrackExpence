import 'dotenv/config'

import app from "./src/app.js";
import { connectToDB } from "./src/config/db.js";

const PORT = process.env.PORT || 8000

async function startServer() {
    try {
        await connectToDB(); // Wait for db to connect

        app.listen(PORT, () => {
          console.log(`Server is running on PORT:${PORT}`);
        });

    } catch (err) {
        console.error("Failed to Start the Server:", err.message)
        process.exit(1)
    }
}

startServer();