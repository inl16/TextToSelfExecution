const express = require('express');
const { Builder, By } = require('selenium-webdriver');
const app = express();
const cors = require('cors');
app.use(cors());

const port = 8000;

app.use(express.json());

app.post('/start-selenium', async (req, res) => {
  let driver = await new Builder().forBrowser('chrome').build();
  try {
    // Navigate to the webpage where the Self-Execute button is located
    await driver.get('http://localhost:3000/migration');
    
    // First, locate and click the Self-Execute button by its ID
    await driver.findElement(By.id('start-driver')).click();

    // Optionally, wait for necessary conditions after clicking Self-Execute
    // For example, waiting for a certain element to be visible
    // await driver.wait(until.elementLocated(By.id('some-element')), 10000);

    // Then, locate and click the Run Script button by its ID
    // Make sure there's enough delay or a condition check to allow the page/JS to be ready
    await driver.findElement(By.id('run-script-button')).click();

    // Handle further actions or checks here if necessary

    res.json({ message: 'Selenium script started and buttons clicked successfully.' });
  } catch (error) {
    console.error('Selenium script error:', error);
    res.status(500).json({ message: 'Error starting Selenium script.' });
  } finally {
    // It's important to quit the driver to close the browser window
    await driver.quit();
  }
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
