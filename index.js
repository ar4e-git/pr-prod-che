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

const sendRespond404 = (res) => {
	
	res.writeHead(404, { 'Content-Type': 'text/html' });
	res.write('Not found');
	res.end();

}

const sendRespondJSON = (res, token = Date.now()) => {
	
	const preparePlaylist = {};
	
	const prepareChannelsJSON = channels.map( ch => ( 
	      {
     	    title: `${ch}`,
	        file: `${urlBase}/${ch}${tokenBase}${token}`
	      }	   
	   )
	 );
	 
	preparePlaylist.id = 'player';
	preparePlaylist.file = prepareChannelsJSON;
	
	cache.timestamp = Date.now();
	cache.jsonData = prepareChannelsJSON; 
	
	
	console.log(cache);
	
	res.writeHead(200, { 'Content-Type': 'application/json' });
	res.write(JSON.stringify(preparePlaylist));
	res.end();
	
}

const getURL = async (req, res, tURL) => {
	
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
		
		sendRespondJSON(res, token);
		
    } catch (error){
        console.log('error', error)
    }
};

const server = http.createServer((req, res) => {


    	// Set CORS headers
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Request-Method', '*');
	res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET');
	res.setHeader('Access-Control-Allow-Headers', '*');
	
	if ( req.method === 'OPTIONS' ) {
		res.writeHead(200);
		res.end();
		return;
	}
	
  
 
	switch (req.url) {
		case '/' : {
			res.writeHead(200, { 'Content-Type': 'text/html' });
			res.write('IP denied');
			res.end()
			break;
		}
		
		case '/123456' : {
			
			if (req.method === 'POST') {
				let body = '';
				req.on('data', chunk => {
				body += chunk.toString(); // convert Buffer to string
			  });
				req.on('end', () => {
				console.log(JSON.parse(body));
				//res.end('ok');
			  });
			
			if (cache?.timestamp && (Date.now() - cache?.timestamp) < 1000 * 60) {
				
				console.log('From cache');
				res.writeHead(200, { 'Content-Type': 'application/json' });
				res.write(JSON.stringify(cache.jsonData));
				res.end();
				
			  } else {
			    
				console.log('From source');
				getURL(req, res, TARGET_URL.URL1);
			   
			  }
		    }
			
			break;
			
		}
		
		default:  {
			sendRespond404(res);
		}
	}
});

server.listen(PORT, () => console.log('Listening on port 4000'));
