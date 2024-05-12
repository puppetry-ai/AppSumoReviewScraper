import puppeteer from 'puppeteer';

interface Review {
  username: string;
  rating: number;
  reviewText: string;
  postedDate: string;
}

async function scrapeReviews(url: string): Promise<Review[]> {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'networkidle2' });

  console.log('Waiting for the page to load...');

  const content = await page.content();
  console.log(content.substring(0, 2000)); // logs first 2000 characters of the page HTML

  const reviews = await page.evaluate(() => {
    const reviewElements = Array.from(document.querySelectorAll('.review'));
    console.log(`Found ${reviewElements.length} reviews`);
    return reviewElements.map((el) => ({
      username: el.querySelector('.username')?.textContent?.trim() ?? '',
      rating: Number(el.querySelector('.rating')?.textContent?.trim() ?? 0),
      reviewText: el.querySelector('.review-text')?.textContent?.trim() ?? '',
      postedDate: el.querySelector('.posted-date')?.textContent?.trim() ?? '',
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
