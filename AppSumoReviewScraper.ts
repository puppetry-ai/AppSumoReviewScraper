import puppeteer from 'puppeteer';
import fs from 'fs';

interface Review {
  username: string;
  userProfilePicture: string;
  reviewTitle: string;
  reviewText: string;
  rating: number;
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

    // This works as of May 12, 2024
    return reviewElements.map((el) => {
      // First link is the image link, second link is the profile link
      const usernameElement = el.querySelectorAll(
        '[data-testid="discussion-user-info"] a'
      )[1] as HTMLElement;
      const imageElement = el.querySelector(
        '[data-testid="discussion-user-info"] img'
      ) as HTMLImageElement;
      const titleElement = el.querySelector('.font-header') as HTMLElement;
      const textElement = el.querySelector(
        '[data-testid="toggle-text"] p'
      ) as HTMLElement;

      const ratingStars = Array.from(
        el.querySelectorAll('.relative.mr-2 img')
      ).map((img) => (img as HTMLImageElement).alt);

      // Use Alt-Text to extracct the rating value (Taco value)
      const rating = ratingStars
        .filter((alt) => alt.includes('stars'))
        .map((alt) => parseInt(alt))[0];

      return {
        username: usernameElement?.textContent?.trim() ?? 'No username',
        userProfilePicture: imageElement?.src ?? '',
        reviewTitle: titleElement?.textContent?.trim() ?? 'No title',
        reviewText: textElement?.textContent?.trim() ?? 'No review text',
        rating: rating,
        sourceUrl: url,
      };
    });
  });

  await browser.close();
  return reviews;
}

// Use this function to save the reviews as JSON
async function main() {
  // Read the URL from the command line argument if provided
  // Otherwise, use the default URL
  const url = process.argv[2] || 'https://appsumo.com/products/puppetry';

  console.log(`Scraping reviews from ${url}`);

  let page = 1;
  let reviews: Review[] = [];
  while (true) {
    const reviewURL = `${url}/reviews/?page=${page}`;
    try {
      const pageReviews = await scrapeReviews(reviewURL);
      reviews = reviews.concat(pageReviews);
      console.log(`Scraped ${pageReviews.length} reviews from page ${page}`);
      page++;
    } catch (error) {
      console.error(error);
      break;
    }
  }

  const prductName = url.split('/')[4];
  fs.writeFileSync(`${prductName}.json`, JSON.stringify(reviews, null, 2));
  console.log(`Reviews saved to ${prductName}.json`);
}

main();
