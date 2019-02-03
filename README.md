# SoleM8 Test API
A RESTful API that scrapes Craigslist to get search results and info.
---
**INSTALLATION**
`npm i -s express request-promise cheerio mysql`

Start local server:
`node app.js`

**API Endpoints:** 
`localhost:5000/craigslist/`

**LocalDB:**
You will need to create mySql database `solem8` and create a table `crawlData` 

`create database solem8;`

`create table crawlData (id int NOT NULL AUTO_INCREMENT, url varchar(100), title varchar(100), price float, PRIMARY KEY(id));`

**Usage:** 
`?model=<model>&size=<size>`

---

