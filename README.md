# SoleM8 API
A RESTful API that scrapes Craigslist to get search results and info.
---
**INSTALLATION**
`npm i -s express request-promise cheerio mysql`

Start local server:
`node app.js`

**API Endpoints:** 
Execute a webscrape for Craiglist Toronto: `localhost:3000/craigslist/`
Return shoes from DB: `localhost:3000/shoes/`

**Usage:** 
/craigslist: `?model=<model>&size=<size>`
/shoes: `?model=yeezy&size=10&priceMin=0&priceMax=1000&sortLowHigh=true`
/supportedShoes 
/watchlist 
/watchlist/add 
/watchlist/delete

**LocalDB:**
Execute the following to create the appropriate local DB and table:

`GRANT ALL PRIVILEGES ON *.* TO 'solem8_server'@'localhost' IDENTIFIED BY 'syde2020'`

`create database solem8;`

`create table shoes (id int NOT NULL AUTO_INCREMENT, model varchar (50), size float,  url varchar(100), source varchar(50), title varchar(100), price float, photo varchar (100), PRIMARY KEY(id));`

`create table supportedShoes (id int NOT NULL AUTO_INCREMENT, model varchar (50), size float, PRIMARY KEY(id));`

`create table watchlist (id int NOT NULL AUTO_INCREMENT, username varchar (50), model varchar (50), size float, priceMin float, priceMax float, PRIMARY KEY(id));`


---

