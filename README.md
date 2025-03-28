# Grocery Comparison NZ

A simple grocery comparison app to help users find the best prices for their grocery items across multiple supermarkets.



This project was developed in cooperation with Haosheng Ye, Mohammad Munem, Nandhini Sambasivam, Sam Williams, and Yuchuan Jin.

# Features

- TODO: add feature list
- TODO: add screenshots

# Building and Running

This project uses docker compose for development, testing, and production.

Then to launch a specific backend and the frontend: `sudo docker compose --profile <profile> up`. See [Docker profiles docs](https://docs.docker.com/compose/how-tos/profiles/) for more information.

Available profiles:

- `backend`
- `migrate`
- `frontend`
- `scraper`
- `backend_test`
- `e2e_test`

# Grocery Price Comparison - client Setup

This README provides instructions for setting up the client using Ionic React and Capacitor.

## Prerequisites

1. Install **Node.js** (LTS version recommended) and npm (comes with Node.js).
2. Install the **Ionic CLI** globally:
   ```
   npm install -g @ionic/cli
   ```
3. Install Capacitor dependencies for iOS and Android:(Capacitor dependencies install are only needed if they are not already listed in package.json)

   ```
   npm install @capacitor/core @capacitor/cli
   npm install @capacitor/android @capacitor/ios
   ```
4. iOS-specific prerequisites:
   - Install Xcode from the Mac App Store.
   - Install CocoaPods for dependency management:
     ```
     sudo gem install cocoapods
     ```
5. Android-specific prerequisites:
   - Install Android Studio and set up the Android SDK.
   - Ensure the `ANDROID_HOME` environment variable is configured.

## Environment Setup

1. Navigate to the project directory:
   ```
   cd grocery_comparison / cd client
   ```
2. Install dependencies:
   ```
   npm install
   ```
3. Add Capacitor platforms:
   ```
   npx cap add ios
   npx cap add android
   ```
4. Build the app

   ```
   ionic build or ionic build <platform>
   ```
5. Sync the web assets to the native platforms:
   ```
   npx cap sync
   ```

- TODO: add how to run on Android instructions
