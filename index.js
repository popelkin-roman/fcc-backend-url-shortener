require('dotenv').config();
const express = require('express');
const cors = require('cors');
const dns = require('node:dns');
const app = express();
const bodyParser = require('body-parser');

let shortUrls = ['www.ya.ru'];

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.use(
  bodyParser.urlencoded({extended: false})
)

app.post('/api/shorturl', function(req,res) {
  let fullUrl = req.body.url;
  let host = fullUrl.split('://')[1] || fullUrl.split('://')[0];
  host = host.split('/')[0];
  dns.lookup(host, (err, address) => {
    if (err) {
      return res.json({ error: 'invalid url' })
    }
    let shortUrl = shortUrls.findIndex((el) => el === fullUrl);
    if (shortUrl < 0) {
      shortUrls.push(fullUrl);
      shortUrl = shortUrls.length - 1;
    }
    app.get(`/api/shorturl/${shortUrl}`, function(req, res) {
      res.redirect(fullUrl);
    })
    res.json({ original_url : fullUrl, short_url : shortUrl})
  });
})

shortUrls.forEach( (el, i) => {
  app.get(`/api/shorturl/${i}`, function(req, res) {
    res.redirect(`//${el}`);
  })
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
