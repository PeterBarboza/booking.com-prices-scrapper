# Booking.com Prices Scraper

This is a command-line application to retrieve pricing data from Booking.com, built with Node.js and Puppeteer. The purpose of this application is to simplify the process of obtaining data to develop pricing strategies for hotel properties, a demand commonly found in the Revenue Management (RM) sector.

<div style="display: flex; justify-content: center; align-items: center; gap: 1rem">
  <img src="assets/nodejs-logo.png" alt="NodeJS" width="300" />
  <img src="assets/puppeteer-logo.png" alt="Puppeteer" width="100" />
  <img src="assets/booking-logo.png" alt="Booking.com" width="200" />
</div>

- [How the application works](#how-the-application-works)
  - [Handling packages](#handling-packages)
  - [How, when, and where prices are saved](#how-when-and-where-prices-are-saved)
  - [config.json schema](#configjson-schema)
- [How to execute it locally](#)

## How the Application Works

All execution settings are configured by filling out the `config.json` file located at the root of the project. To simplify, let’s follow this explanation with a practical example. Assume our `config.json` is filled out as follows:

```json
{
  "properties": [
    {
      "name": "PROPERTY 1",
      "url": "https://www.booking.com/hotel/br/property-1.pt-br.html",
      "adultsAmount": 2,
      "startDate": "2025-02-01",
      "endDate": "2025-03-30",
      "maxBundleSize": 7
    }
  ]
}
```

Once the system starts, it will generate the URL for the first search. The URLs are generated based on the value of `properties[number].url`. The search filtering is done through URL query parameters, specifically `checkin`, `checkout`, and `group_adults`. The first search uses the value of `properties[number].startDate` for the `checkin` parameter, `checkout` is set to `properties[number].startDate + 1 day`, and `group_adults` takes the value of `properties[number].adultsAmount`.

In our example, the first search URL would be:

```shell
https://www.booking.com/hotel/br/property-1.pt-br.html?checkin=2024-11-08&checkout=2024-11-09&group_adults=2
```

All subsequent search URLs use the `checkout` date from the previous search to populate `checkin` in the next URL. The `checkout` parameter for each new search is set to `checkin` of the current URL plus one day, and `group_adults` remains as `properties[number].adultsAmount`.

### Handling Packages

On certain dates, hotel properties do not sell single-night reservations but instead require a minimum number of days, typically between 2 and 5 days depending on the season. There are also larger packages, though they are less common. To handle this, the system automatically searches for packages as follows:

- When a single night is unavailable (e.g., from 01/12/2024 to 02/12/2024), the system will generate the next URL, keeping the check-in date the same as in the previous URL, but incrementing the checkout date by one additional day. Thus, the next URL will search from 01/12/2024 to 03/12/2024.
- This logic continues to increment until a price is found, or until the number of iterations reaches the value set in `properties[number].maxBundleSize`.

### How, When, and Where Prices Are Saved

Each property configured in the `config.json` file will have a unique CSV and XLSX file created in the `results/csv` and `results/xlsx` folders, respectively. The CSV file is generated automatically when a rate is found, or when a period is marked as "Unavailable". The XLSX file is created at the end of the property’s run, containing the same data as the CSV file.

Each row in the CSV file represents the price for one night, with `;` used as a delimiter. The CSV file has three columns: checkin date, checkout date, and the nightly rate.

Example of a CSV file:

```csv
29/12/2024;30/12/2024;504.97
30/12/2024;31/12/2024;504.97
31/12/2024;01/01/2025;600.00
```

- When a single-night rate is found, a new line is added to the CSV for that run.
- When a package rate is found, the total value is divided by the number of days in the package, and a line is added to the CSV for each day in the package as if it were a single night.
- When no rate is found even after applying the package logic, a line is added for each day in the package with `N/A` (Unavailable) as the price.

### config.json Schema

| Field                              | Type                | Description                                                                                                           | Required |
| ---------------------------------- | ------------------- | --------------------------------------------------------------------------------------------------------------------- | -------- |
| `properties`                       | Array               | Array containing objects with data for each property to be searched                                                   | Yes      |
| `properties[number]`               | Object              | Object containing data for each property                                                                              | Yes      |
| `properties[number].name`          | String              | Name of the property                                                                                                  | Yes      |
| `properties[number].url`           | String              | URL of the property profile on Booking.com, should look like `https://www.booking.com/hotel/br/property-2.pt-br.html` | Yes      |
| `properties[number].adultsAmount`  | Number              | Number of adults to be included in the searches to obtain property rates, must be greater than zero                   | Yes      |
| `properties[number].startDate`     | String (YYYY-MM-DD) | Start date for retrieving rates, must be today or a future date                                                       | Yes      |
| `properties[number].endDate`       | String (YYYY-MM-DD) | End date for the searches, must be later than `properties[number].startDate`                                          | Yes      |
| `properties[number].maxBundleSize` | Number              | Maximum bundle size to be searched when no price is found for a single-night reservation                              | Yes      |

## How to Execute it Locally

You need to have Node.js and Google Chrome installed on your computer. This system has been tested only on Windows 11; functionality on other operating systems or other versions of Windows is not guaranteed.

- [Install Node.js](https://nodejs.org/)
- [Install Google Chrome](https://www.google.com/chrome/)

It is recommended to use [Yarn](https://classic.yarnpkg.com/lang/en/docs/install/) as your package manager, but you can proceed with NPM if you prefer.

Install the dependencies:

```shell
yarn
```

Create a `config.json` file in the root of the project and fill it out correctly.

From here, you can run it in development mode:

```shell
yarn dev
```

Or you can build and run it in production mode:

```shell
yarn build

yarn start
```
