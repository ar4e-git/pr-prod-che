require('dotenv').config();
const axios = require('axios');
const cheerio = require('cheerio');
const http = require('http');


const PORT = process.env.PORT || 4000;

const urlBase = process.env.URL_BASE;

const channels = (process.env.CH).split(',');

const tokenBase = process.env.TOKEN_BASE;

const TARGET_URL = {
	URL1 : process.env.TARGET_URL1,
};

const cache = {};

const sendRespond = (req,res, url) => {
	
	res.writeHead(301,{
	   "Location": url,
		"Access-Control-Allow-Origin": "*"
	});
	res.end();
	return
	
}

const sendRespond404 = (res) => {
	
	res.writeHead(404, { 'Content-Type': 'text/html' });
	res.write('Not found');
	res.end();
	return
}

const getURL = async (req, res, tURL, route) => {

    const options = {
      headers: {
		  
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
		'Accept': '*/*',
		'Accept-Encoding': 'gzip, deflate, br',
		'Accept-Language': 'ru,en-US;q=0.9,en;q=0.8,ru-RU;q=0.7',
		'Connection': 'keep-alive',
		'Sec-Fetch-Dest': 'empty',
		'Sec-Fetch-Mode': 'cors',
		'Sec-Fetch-Site': 'cross-site',
		'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
		'sec-ch-ua': '"Not A(Brand";v="99", "Google Chrome";v="121", "Chromium";v="121"',
		'sec-ch-ua-mobile': '?0',
		'sec-ch-ua-platform': '"Windows"'
      }
    }

    try{
        const { data: html } = await axios.get(tURL, options);

		const $ = cheerio.load(html);
		
		const token = $('.player-container').attr('data-token');
		
		const channel = channels.find(ch => ch === route);
				
		const URL = `${urlBase}/${channel}${tokenBase}${token}`;
			
		console.log(URL);
		
		cache[route] = {
			url: URL,
			timestamp: Date.now()
		};
	   
	sendRespond(req, res, URL);
		
    } catch (error){
        console.log('error', error)
    }
};

const server = http.createServer((req, res) => {
	
 /*  if (req.headers.origin !== process.env.O) {
	  console.log(req.socket.remoteAddress);
	  return
  } */

  const params1 = req.url.split('?')[1];
  console.log(params1);
  
  const params = params1 ? params1.split('.')[0] : '';
  console.log(params);
  
  if (req.url === '/') {
	  res.writeHead(200, { 'Content-Type': 'text/html' });
	  res.write('IP denied');
	  res.end();
	  
  } else if (params && channels.includes(params)) {
		
		if (cache?.[params]?.url && ((Date.now() - cache?.[params]?.timestamp) < 1000 * 60 * 6)) {
			console.log("From cache");
			sendRespond(req, res, cache[params].url);
		} else {
			console.log("From source");
			getURL(req, res, TARGET_URL.URL1, params);
		}

	} else {
	  
		sendRespond404(res);
	}
  
});

server.listen(PORT, () => console.log('Listening on port 4000'));
