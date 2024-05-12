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
            console.log(`Found ${reviewElements.length} review elements`);
            return reviewElements.map((el) => {
                var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
                return ({
                    username: (_c = (_b = (_a = el
                        .querySelector('[data-testid="discussion-user-info"] a')) === null || _a === void 0 ? void 0 : _a.textContent) === null || _b === void 0 ? void 0 : _b.trim()) !== null && _c !== void 0 ? _c : 'No username',
                    reviewTitle: (_f = (_e = (_d = el.querySelector('.font-header')) === null || _d === void 0 ? void 0 : _d.textContent) === null || _e === void 0 ? void 0 : _e.trim()) !== null && _f !== void 0 ? _f : 'No title',
                    reviewText: (_j = (_h = (_g = el
                        .querySelector('[data-testid="toggle-text"] p')) === null || _g === void 0 ? void 0 : _g.textContent) === null || _h === void 0 ? void 0 : _h.trim()) !== null && _j !== void 0 ? _j : 'No review text',
                    postedDate: (_m = (_l = (_k = el
                        .querySelector('[data-testid="discussion-review-info"] span')) === null || _k === void 0 ? void 0 : _k.textContent) === null || _l === void 0 ? void 0 : _l.replace('Posted:', '').trim()) !== null && _m !== void 0 ? _m : 'No date',
                });
            });
        });
        yield browser.close();
        return reviews;
    });
}
// Use this function to save the reviews as JSON
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const url = 'https://appsumo.com/products/puppetry/reviews/?page=1';
        console.log(`Scraping reviews from ${url}`);
        const reviews = yield scrapeReviews(url);
        console.log(JSON.stringify(reviews, null, 2));
    });
}
main();
