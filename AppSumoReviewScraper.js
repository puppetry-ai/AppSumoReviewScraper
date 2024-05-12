"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const puppeteer_1 = __importDefault(require("puppeteer"));
const fs_1 = __importDefault(require("fs"));
function scrapeReviews(url) {
    return __awaiter(this, void 0, void 0, function* () {
        const browser = yield puppeteer_1.default.launch({
            headless: false, // Launch in headful mode
            slowMo: 50, // Slow down Puppeteer operations by 50 milliseconds to see what's happening
            args: ['--start-maximized'], // Start with a maximized window
        });
        const page = yield browser.newPage();
        yield page.goto(url, { waitUntil: 'networkidle2' });
        console.log('Waiting for the page to load...');
        const frame = yield page
            .frames()
            .find((f) => f.url().includes('the-part-of-the-url'));
        if (frame) {
            yield frame.waitForSelector('[data-testid="review-card-wrapper"]', {
                visible: true,
            });
        }
        yield page.waitForSelector('[data-testid="review-card-wrapper"]', {
            visible: true,
        });
        const reviews = yield page.evaluate(() => {
            const reviewElements = Array.from(document.querySelectorAll('[data-testid="review-card-wrapper"]'));
            // This works as of May 12, 2024
            return reviewElements.map((el) => {
                var _a, _b, _c, _d, _e, _f, _g, _h, _j;
                // First link is the image link, second link is the profile link
                const usernameElement = el.querySelectorAll('[data-testid="discussion-user-info"] a')[1];
                const imageElement = el.querySelector('[data-testid="discussion-user-info"] img');
                const titleElement = el.querySelector('.font-header');
                const textElement = el.querySelector('[data-testid="toggle-text"] p');
                // Example: Member since: Nov 2023, Deals bought: 60, Posted: May 12, 2024
                const dateElement = el.querySelectorAll('[data-testid="discussion-review-info"] span')[3];
                const ratingStars = Array.from(el.querySelectorAll('.relative.mr-2 img')).map((img) => img.alt);
                // Use Alt-Text to extracct the rating value (Taco value)
                const rating = ratingStars
                    .filter((alt) => alt.includes('stars'))
                    .map((alt) => parseInt(alt))[0];
                return {
                    username: (_b = (_a = usernameElement === null || usernameElement === void 0 ? void 0 : usernameElement.textContent) === null || _a === void 0 ? void 0 : _a.trim()) !== null && _b !== void 0 ? _b : 'No username',
                    userProfilePicture: (_c = imageElement === null || imageElement === void 0 ? void 0 : imageElement.src) !== null && _c !== void 0 ? _c : '',
                    reviewTitle: (_e = (_d = titleElement === null || titleElement === void 0 ? void 0 : titleElement.textContent) === null || _d === void 0 ? void 0 : _d.trim()) !== null && _e !== void 0 ? _e : 'No title',
                    reviewText: (_g = (_f = textElement === null || textElement === void 0 ? void 0 : textElement.textContent) === null || _f === void 0 ? void 0 : _f.trim()) !== null && _g !== void 0 ? _g : 'No review text',
                    rating: rating,
                    postedDate: (_j = (_h = dateElement === null || dateElement === void 0 ? void 0 : dateElement.textContent) === null || _h === void 0 ? void 0 : _h.replace('Posted:', '').trim()) !== null && _j !== void 0 ? _j : 'No date',
                };
            });
        });
        yield browser.close();
        return reviews;
    });
}
// Use this function to save the reviews as JSON
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        // Read the URL from the command line argument if provided
        // Otherwise, use the default URL
        const url = process.argv[2] || 'https://appsumo.com/products/puppetry';
        console.log(`Scraping reviews from ${url}`);
        let page = 1;
        let reviews = [];
        while (true) {
            const reviewURL = `${url}/reviews/?page=${page}`;
            try {
                const pageReviews = yield scrapeReviews(reviewURL);
                reviews = reviews.concat(pageReviews);
                console.log(`Scraped ${pageReviews.length} reviews from page ${page}`);
                page++;
            }
            catch (error) {
                console.error(error);
                break;
            }
        }
        const prductName = url.split('/')[4];
        fs_1.default.writeFileSync(`${prductName}.json`, JSON.stringify(reviews, null, 2));
        console.log(`Reviews saved to ${prductName}.json`);
    });
}
main();
