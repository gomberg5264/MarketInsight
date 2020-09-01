# MarketInsight
Finance platform similar to Yahoo Finance. See stock quotes, financial news and create watchlists with others (React+Ramda+Browserify)

Requires Latest Node LTS `v12.18.3+` (Updated 2020-08-31)

# Features
- Search over 500 different symbols
- View and share up to 15 close to realtime stocks simulteaneously with others
- See the latest news for each stock

Please note due to API limitations, chart data is limited to up to 2 years in order to save monthly call quota.

# Setup
You will need an IEX Cloud API key to access the third party market data. In development mode, sandbox APIs are used instead to avoid calls to the monthly quota. Sandbox mode requires its own API key. Export key to `API_TOKEN` variable before use.

    $ npm install

Development:

    $ npm run build-all:dev
    $ npm run start:dev

Production: Requires `pm2` installed

    $ npm run build-all
    $ pm2 start

# Screenshot
![screenshot](https://user-images.githubusercontent.com/24352255/44682156-851bad80-a9f7-11e8-96cb-a5fb84502137.png)

# TODO
- Chat
- Crypto

# Supported Browsers
IE 11
Edge 12+
Firefox 35+
Chrome 40+
Safari 9+
Opera 27_+
Android 4.4+
iOS Safari 9+
