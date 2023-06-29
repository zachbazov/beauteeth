const catchAsync = require('../utils/catch-async');

const getOverview = catchAsync(async (req, res, next) => {
  res.status(200).render('overview', {
    title: 'Beeuteeth',
  });
});

const getSlider = catchAsync(async (req, res, next) => {
  res.status(200).render('slider', {
    title: 'Slider',
  });
});

module.exports = { getOverview, getSlider };
