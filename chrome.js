const chromeLauncher = require('chrome-launcher');

chromeLauncher
  .launch({
    startingUrl: '/',
  })
  .then((chrome) => {
    console.log(`Chrome debugging port running on ${chrome.port}`);
  });
