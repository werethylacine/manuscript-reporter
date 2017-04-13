# MEAN Stack

* MongoDB
* Express
* Angular
* Node

*Requires MongoDB server running*

## Developing

* `npm install` to resolve dependencies
* `npm run watch` to start transpile watch. This command will read files under `client/src` and generate a single file under `client/dist/bundle.js` which should be included by index.html

Seed database: mongoimport --db words-dev --collection words --type json --file server/words-seed.json --jsonArray --drop
