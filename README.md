# SoleM8 API
A RESTful API that scrapes Craigslist to get search results and info.
---
**INSTALLATION**
`npm i -s express request-promise cheerio mysql`

Start local server:
`node app.js`

**API Endpoints:** 
`localhost:3000/craigslist/`

**LocalDB:**
Execute the following to create the appropriate local DB and table:

`create database solem8;`

`create table crawlData (id int NOT NULL AUTO_INCREMENT, url varchar(100), title varchar(100), price float, PRIMARY KEY(id));`

**Usage:** 
`?model=<model>&size=<size>`

---

