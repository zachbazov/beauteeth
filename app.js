const express = require("express");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
const compression = require("compression");
const cors = require("cors");
const path = require("path");
const csp = require("express-csp");
const cookieParser = require("cookie-parser");

const AppError = require("./utils/AppError");
const globalErrorHandler = require("./controllers/error-controller");
const cspConfig = require("./utils/CSPConfig");

const viewRouter = require("./routes/view-router");

const app = express();

// MARK: - PUG View Engine

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

// MARK: - Serving Static Files

app.use(express.static(path.join(__dirname, "public")));

// MARK: - Trust Proxies
// Works with `req.headers('x-forwarded-proto')`
// for secure HTTPS Connections
app.enable("trust proxy");

// MARK: - CORS

app.use(cors());

// MARK: - options - An HTTP method that we can respond to

app.options("*", cors());

// MARK: - Security HTTP Headers

app.use(helmet());
// app.use(helmet.noSniff());

// MARK: - Content Security Policy

csp.extend(app, cspConfig);

// MARK: - Development Logging

if (process.env.NODE_ENV === "development") {
    app.use(morgan("dev"));
}

// MARK: - Request limitation per IP

const limiter = rateLimit({
    max: 5000,
    windowMs: 60 * 60 * 1000, // 60m * 60s * 1ms === 1hour
    message: "Reached max requests limit.",
});

app.use("/api/", limiter);

// MARK: - Body Parser
// reads data into 'req.body'
app.use(express.json({ limit: "100000kb" }));

// MARK: - Cookie Parser
// req.cookies
app.use(cookieParser());

// MARK: - Security - Data Sanitization
// against NoSQL query injection
app.use(mongoSanitize());

// MARK: - Security - Against XSS
// Cleans any user input from malicious HTML code
app.use(xss());

// MARK: - Prevent Parameter Pollution
// Clears the query string
app.use(
    hpp({
        whitelist: [
            "duration",
            "rating",
            "seasonCount",
            "episodeCount",
            "isHD",
            "hasWatched",
            "newRelease",
            "slug",
        ],
    })
);

// MARK: - Compression
// Compresses the text that sent to the clients
app.use(compression());

//

app.use((req, res, next) => {
    res.set("X-Content-Type-Options", "nosniff");
    next();
});

// MARK: - Route Mounting

app.use("/", viewRouter);

// MARK: - Error Handling Routes

app.all("*", (req, res, next) => {
    const message = `Can't find ${req.originalUrl} on this server.`;
    const err = new AppError(message, 404);

    next(err);
});

// MARK: - Error Handling Middleware

app.use(globalErrorHandler);

// MARK: - Module Export

module.exports = app;
