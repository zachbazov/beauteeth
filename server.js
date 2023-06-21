const dotenv = require("dotenv");
const mongoose = require("mongoose");

// MARK: - DotEnv Config

dotenv.config({ path: "./config.env" });

// MARK: - Database Connection String

const db = process.env.DB_URL.replace(
    /<DB_USER>|<DB_PASS>|<DB_CLUSTER>|<DB_NAME>/gi,
    (arg) => {
        return {
            "<DB_USER>": process.env.DB_USER,
            "<DB_PASS>": process.env.DB_PASS,
            "<DB_CLUSTER>": process.env.DB_CLUSTER,
            "<DB_NAME>": process.env.DB_NAME,
        }[arg];
    }
);

// MARK: - Strict Policy - Mongoose v7.0

mongoose.set("strictQuery", false);

// MARK: - Mongoose Connection

mongoose
    .connect(db, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log("DATABASE: 🟢"));

// MARK: - Application

const app = require("./app");

// MARK: - Server
// Server Port
const port = process.env.PORT || 8000;

// Environment Logger
console.log(app.get("env"));

// Server Deployment
const server = app.listen(port, () =>
    console.log(`PORT: ${port}\nENVIRONMENT: ${app.get("env")}`)
);

// MARK: - Unhandled Rejection Error

process.on("unhandledRejection", (err) => {
    console.log(`[UnhandledRejection] 💥 [${err.name}]`, err.message);
    server.close(() => process.exit(1));
});

// MARK: - SIGTERM
// A signal that used to cause a problem to really stop running.
process.on("SIGTERM", () => {
    console.log("[SIGTERM] 💥 received, shutting down...");
    server.close(() => console.log("[SIGTERM] 💥 process terminated."));
});
