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

// const usersRouter = require("./routes/user-router");
// const sectionRouter = require("./routes/section-router");
// const mediaRouter = require("./routes/media-router");
// const seasonRouter = require("./routes/season-router");
// const episodeRouter = require("./routes/episode-router");
const viewRouter = require("./routes/view-router");
// const myListRouter = require("./routes/mylist-router");

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

csp.extend(app, {
    policy: {
        directives: {
            "default-src": ["self"],
            "style-src": ["self", "unsafe-inline", "https:"],
            "font-src": ["self",
                            "https://kit.fontawesome.com/",
                            "https://fonts.gstatic.com",
                            "https://cdnjs.cloudflare.com"],
            "script-src": [
                "self",
                "unsafe-inline",
                "data",
                "blob",
                "https://js.stripe.com",
                "https://*.mapbox.com",
                "https://*.cloudflare.com/",
                "https://bundle.js:8828",
                "ws://localhost:56558/",
                "ws://127.0.0.1:50143/",
                "https://cdn.jsdelivr.net/npm/cropperjs@1.5.9/dist/cropper.min.js"
            ],
            "worker-src": [
                "self",
                "unsafe-inline",
                "data:",
                "blob:",
                "https://*.stripe.com",
                "https://*.mapbox.com",
                "https://*.cloudflare.com/",
                "https://bundle.js:*",
                "ws://localhost:*/",
                "ws://127.0.0.1:*/"
            ],
            "frame-src": [
                "self",
                "unsafe-inline",
                "data:",
                "blob:",
                "https://*.stripe.com",
                "https://*.mapbox.com",
                "https://*.cloudflare.com/",
                "https://bundle.js:*",
                "ws://localhost:*/",
                "ws://127.0.0.1:*/"
            ],
            "img-src": [
                "self",
                "unsafe-inline",
                "data:",
                "blob:",
                "https://*.stripe.com",
                "https://*.mapbox.com",
                "https://*.cloudflare.com/",
                "https://bundle.js:*",
                "ws://localhost:*/",
                "ws://127.0.0.1:*/"
            ],
            "connect-src": [
                "self",
                "unsafe-inline",
                "data:",
                "blob:",
                "https://*.stripe.com",
                "https://*.mapbox.com",
                "https://*.cloudflare.com/",
                "https://bundle.js:*",
                "ws://localhost:*/",
                "ws://127.0.0.1:*/"
            ],
        },
    },
});

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
// app.use("/api/v1/media", mediaRouter);
// app.use("/api/v1/users", usersRouter);
// app.use("/api/v1/seasons", seasonRouter);
// app.use("/api/v1/episodes", episodeRouter);
// app.use("/api/v1/sections", sectionRouter);
// app.use("/api/v1/mylists", myListRouter);

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
