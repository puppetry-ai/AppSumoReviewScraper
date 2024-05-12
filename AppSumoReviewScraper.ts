import puppeteer from 'puppeteer';

interface Review {
  username: string;
  reviewTitle: string;
  reviewText: string;
  postedDate: string;
}

async function scrapeReviews(url: string): Promise<Review[]> {
  const browser = await puppeteer.launch({
    headless: false, // Launch in headful mode
    slowMo: 50, // Slow down Puppeteer operations by 50 milliseconds to see what's happening
    args: ['--start-maximized'], // Start with a maximized window
  });
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'networkidle2' });

  console.log('Waiting for the page to load...');

  const frame = await page
    .frames()
    .find((f) => f.url().includes('the-part-of-the-url'));

  if (frame) {
    await frame.waitForSelector('[data-testid="review-card-wrapper"]', {
      visible: true,
    });
  }

  await page.waitForSelector('[data-testid="review-card-wrapper"]', {
    visible: true,
  });

  const reviews = await page.evaluate(() => {
    const reviewElements = Array.from(
      document.querySelectorAll('[data-testid="review-card-wrapper"]')
    );

    console.log(`Found ${reviewElements.length} review elements`);
    return reviewElements.map((el) => ({
      username:
        el
          .querySelector('[data-testid="discussion-user-info"] a')
          ?.textContent?.trim() ?? 'No username',
      reviewTitle:
        el.querySelector('.font-header')?.textContent?.trim() ?? 'No title',
      reviewText:
        el
          .querySelector('[data-testid="toggle-text"] p')
          ?.textContent?.trim() ?? 'No review text',
      postedDate:
        el
          .querySelector('[data-testid="discussion-review-info"] span')
          ?.textContent?.replace('Posted:', '')
          .trim() ?? 'No date',
    }));
  });

  await browser.close();
  return reviews;
}

// Use this function to save the reviews as JSON
async function main() {
  const url = 'https://appsumo.com/products/puppetry/reviews/?page=1';
  console.log(`Scraping reviews from ${url}`);
  const reviews = await scrapeReviews(url);
  console.log(JSON.stringify(reviews, null, 2));
}

main();
