## Description

This is a simple script that extracts AppSumo reviews for a given product from the AppSumo website. It uses Puppeteer to navigate to the product page and extract the reviews using a CSS selector.

## Usage

To use this script, you need to have Node.js and npm installed on your system. You can then run the following command to install the dependencies:

```
yarn install
```

Once the dependencies are installed, you can run the script using the following command:

```
yarn start
```

This will launch the script and extract the reviews from the AppSumo website. The script will save the reviews as a JSON file in the current directory.

## Important Note

The script runs in headful mode, which means that it will open a new browser window and navigate to the product page. This is necessary to extract the reviews, as the reviews are not available on the product page itself. The script also uses a `slowMo` option to slow down Puppeteer operations by 50 milliseconds, which helps to see what's happening while the script is running. You may have to scroll down the page for the script to find the reviews.

## License

This script is licensed under the MIT License. You can use it for any purpose, including commercial use, as long as you include the original author's name and the license information in the script.

## Disclaimer

Please note that this script is not an official AppSumo product and is provided for educational purposes only. It is not intended to be used for any illegal or unethical activities. The script is provided as-is and without any guarantees or warranties. Use it at your own risk.

## Contact

If you have any questions or issues with the script, please file an issue on this repository. We'll do our best to help you.
