const catchAsync = require("../utils/catch-async");

const getOverview = catchAsync(async (req, res, next) => {
    res.status(200).render("overview", {
        title: "Beeuteeth"
    });
});

module.exports = { getOverview };