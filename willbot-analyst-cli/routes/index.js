var express = require('express');
var router = express.Router();
var mongodb = require('mongodb');
var client = mongodb.MongoClient;
var moment = require('moment-timezone');

var my_tz = "America/Sao_Paulo"
moment().tz(my_tz).format();

var uri = "mongodb://mongo/willbot";

var round = function(number, precision) {
    var factor = Math.pow(10, precision);
    var tempNumber = number * factor;
    var roundedTempNumber = Math.round(tempNumber);
    return roundedTempNumber / factor;
};

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/data/from/db', function(req, res, next) {
    client.connect(uri, function (err, db) {
	    if (err) return next(err);    
    	var collection = db.collection('willbot');
    	collection.find({}).toArray(function(err, docs) {
			if (err) return next(err);
			return res.json(docs);
    	});			
	});
});


router.post('/data/into/db', function(req, res, next) {
	client.connect(uri, function (err, db) {
	    if (err) return next(err);
    	var collection = db.collection('willbot');
    	collection.insertMany(req.body, function(err, result) {
			return res.json({ result: "success" });
    	});
	});
}); 

router.get('/getCsv', function(req, res, next) {

	getAll(1)
	.then(all =>  {
		console.log("all.length")
		console.log(all.length)

		var fim = all.length ;
		var csv = "time,close,ema20,ema50,sma250\n";
		for (i = 0 ; i < fim ; i++) {
			var converted = moment.tz(all[i].time_period_end, my_tz).format("DD/MM/YYYY HH:mm");
			csv += converted + ",";
			csv += all[i].price_close + ",";
			if (typeof all[i].ema20 !== 'undefined') {
				csv += all[i].ema20 ;
			}
			csv += ",";
			if (typeof all[i].ema50 !== 'undefined') {
				csv += all[i].ema50 ;
			}
			csv += ",";
			if (typeof all[i].sma250 !== 'undefined') {
				csv += all[i].sma250 ;
			}
			csv += "\n";
		}
		res.setHeader('Content-disposition', 'attachment; filename=willbot.csv');
		res.set('Content-Type', 'text/csv');
		res.status(200).send(csv);
	})
	.catch(
		reason => console.error(reason)
	);
});


router.get('/loadHistory', function(req, res, next) {
	
	const https = require('https');

	var options = {
		"method": "GET",
		"hostname": "rest.coinapi.io",
		"path": "/v1/ohlcv/BRAZILIEX_SPOT_BTC_BRL/history?period_id=1HRS&time_start=2018-06-01T00:00:00&&time_end=2018-08-02T00:00:00&limit=100000",
		"headers": {'X-CoinAPI-Key': 'E61D55E0-797B-40AA-862E-DF2421FCF687'}
	  };

	var collection_name = "history_BRAZILIEX_SPOT_BTC_BR";
	var request = https.request(options, function (response) {
		var body = ''
		response.on("data", function (chunk) {
			body += chunk;
		});
		response.on('end', function() {

			//console.log(body);
			saveCollection(body, collection_name);
			return res.json({ result: "success" });
		  });
		}).on('error', function(e) {
			console.log("Got error: " + e.message);
      });
	  
	  request.end();


});

router.get('/loadSma9', function(req, res, next) {
	var period = 9
	getAll()
	.then(all =>  {
		console.log("all.length")
		console.log(all.length)

		var fim = all.length - period;

		for (i = 0 ; i < fim ; i++) {
			var objSma = {};

			var piece = all.slice(i, i + period);
			console.log(piece.length);
			var soma =0
			var prices = []
			for (j =0 ; j < piece.length ;j++) {
				soma += piece[j].price_close;
				prices[j] = piece[j].price_close;
			}
			objSma._id = all[i]._id;
			objSma.time_period_start = all[i].time_period_start;
			objSma.time_period_end = all[i].time_period_end;
			objSma.price_close = all[i].price_close;
			objSma.sma = round(soma/piece.length,2);
			objSma.prices = prices;

			console.log(objSma);
			var collection_name = "history_BRAZILIEX_SPOT_BTC_BR";
			updateCollection(all[i]._id ,{ sma9 : objSma.sma }, collection_name) 
			//break;
		}
		return res.json({ result: all.length });
	})
	.catch(
		reason => console.error(reason)
	);
});

router.get('/loadSma250', function(req, res, next) {
	var period = 250
	getAll()
	.then(all =>  {
		console.log("all.length")
		console.log(all.length)

		var fim = all.length - period;

		for (i = 0 ; i < fim ; i++) {
			var objSma = {};

			var piece = all.slice(i, i + period);
			console.log(piece.length);
			var soma =0
			var prices = []
			for (j =0 ; j < piece.length ;j++) {
				soma += piece[j].price_close;
				prices[j] = piece[j].price_close;
			}
			objSma._id = all[i]._id;
			objSma.time_period_start = all[i].time_period_start;
			objSma.time_period_end = all[i].time_period_end;
			objSma.price_close = all[i].price_close;
			objSma.sma = round(soma/piece.length,2);
			//objSma.prices = prices;

			console.log(objSma);
			var collection_name = "history_BRAZILIEX_SPOT_BTC_BR";
			updateCollection(all[i]._id ,{ sma250 : objSma.sma }, collection_name) 
			//break;
		}
		return res.json({ result: all.length });
	})
	.catch(
		reason => console.error(reason)
	);
});


router.get('/loadSma9', function(req, res, next) {
	var period = 9
	getAll()
	.then(all =>  {
		console.log("all.length")
		console.log(all.length)

		var fim = all.length - period;

		for (i = 0 ; i < fim ; i++) {
			var objSma = {};

			var piece = all.slice(i, i + period);
			console.log(piece.length);
			var soma =0
			var prices = []
			for (j =0 ; j < piece.length ;j++) {
				soma += piece[j].price_close;
				prices[j] = piece[j].price_close;
			}
			objSma._id = all[i]._id;
			objSma.time_period_start = all[i].time_period_start;
			objSma.time_period_end = all[i].time_period_end;
			objSma.price_close = all[i].price_close;
			objSma.sma = round(soma/piece.length,2);
			objSma.prices = prices;

			console.log(objSma);
			var collection_name = "history_BRAZILIEX_SPOT_BTC_BR";
			updateCollection(all[i]._id ,{ sma9 : objSma.sma }, collection_name) 
			//break;
		}
		return res.json({ result: all.length });
	})
	.catch(
		reason => console.error(reason)
	);
});


router.get('/loadEma9', function(req, res, next) {
	var period = 9
	getAll(1)
	.then(all =>  {
		console.log("all.length")
		console.log(all.length)

		var fim = all.length ;
		var fatorK = 2/(period+1);

		for (i = period+1 ; i < fim ; i++) {
			var objEma = {};
			var emaAnterior

			if (typeof all[i-1].ema9 !== 'undefined') {
				ema9Anterior = all[i-1].ema9;
			} else {
				ema9Anterior = all[i-1].sma9;
			}

			//console.log(all[i].price_close);
			//console.log(fatorK);
			//console.log(ema9Anterior);						

			objEma._id = all[i]._id;
			objEma.time_period_start = all[i].time_period_start;
			objEma.time_period_end = all[i].time_period_end;
			objEma.price_close = all[i].price_close;
			ema9 = all[i].price_close*fatorK + ema9Anterior*(1-fatorK);
			all[i].ema9 = round(ema9,2);
			objEma.ema9 = round(ema9,2);


			console.log(objEma);
			var collection_name = "history_BRAZILIEX_SPOT_BTC_BR";
			updateCollection(all[i]._id ,{ ema9 : objEma.ema9 }, collection_name);

		}
		return res.json({ result: all.length });
	})
	.catch(
		reason => console.error(reason)
	);
});


router.get('/loadEma20', function(req, res, next) {
	var period = 20
	getAll(1)
	.then(all =>  {
		console.log("all.length")
		console.log(all.length)

		var fim = all.length ;
		var fatorK = 2/(period+1);

		for (i = period+1 ; i < fim ; i++) {
			var objEma = {};
			var emaAnterior

			if (typeof all[i-1].ema20 !== 'undefined') {
				ema20Anterior = all[i-1].ema20;
			} else {
				ema20Anterior = all[i-1].sma9;
			}				

			objEma._id = all[i]._id;
			objEma.time_period_start = all[i].time_period_start;
			objEma.time_period_end = all[i].time_period_end;
			objEma.price_close = all[i].price_close;
			ema20 = all[i].price_close*fatorK + ema20Anterior*(1-fatorK);
			all[i].ema20 = round(ema20,2);
			objEma.ema20 = round(ema20,2);


			console.log(objEma);
			var collection_name = "history_BRAZILIEX_SPOT_BTC_BR";
			updateCollection(all[i]._id ,{ ema20 : objEma.ema20 }, collection_name);

		}
		return res.json({ result: all.length });
	})
	.catch(
		reason => console.error(reason)
	);
});

router.get('/loadEma50', function(req, res, next) {
	var period = 50
	getAll(1)
	.then(all =>  {
		console.log("all.length")
		console.log(all.length)

		var fim = all.length ;
		var fatorK = 2/(period+1);

		for (i = period+1 ; i < fim ; i++) {
			var objEma = {};
			var emaAnterior

			if (typeof all[i-1].ema50 !== 'undefined') {
				ema50Anterior = all[i-1].ema50;
			} else {
				ema50Anterior = all[i-1].sma9;
			}

			//console.log(all[i].price_close);
			//console.log(fatorK);
			//console.log(ema9Anterior);						

			objEma._id = all[i]._id;
			objEma.time_period_start = all[i].time_period_start;
			objEma.time_period_end = all[i].time_period_end;
			objEma.price_close = all[i].price_close;
			ema50 = all[i].price_close*fatorK + ema50Anterior*(1-fatorK);
			all[i].ema50 = round(ema50,2);
			objEma.ema50 = round(ema50,2);


			console.log(objEma);
			var collection_name = "history_BRAZILIEX_SPOT_BTC_BR";
			updateCollection(all[i]._id ,{ ema50 : objEma.ema50 }, collection_name);

		}
		return res.json({ result: all.length });
	})
	.catch(
		reason => console.error(reason)
	);
});

router.get('/fillHistory', function(req, res, next) {
	getLast()
	.then(last =>  {
		console.log("last")
		console.log(last)
		const https = require('https');

		var options = {
			"method": "GET",
			"hostname": "rest.coinapi.io",
			"path": "/v1/ohlcv/BRAZILIEX_SPOT_BTC_BRL/history?period_id=1HRS&time_start="+last+ "&limit=100000",
			"headers": {'X-CoinAPI-Key': 'E61D55E0-797B-40AA-862E-DF2421FCF687'}
		  };
	
		var collection_name = "history_BRAZILIEX_SPOT_BTC_BR";
		var request = https.request(options, function (response) {
			var body = ''
			response.on("data", function (chunk) {
				body += chunk;
			});
			response.on('end', function() {
				if (JSON.parse(body).length > 0) {
					saveCollection(body, collection_name);
				}
				var convertedLast = moment.tz(last, my_tz).format();
				return res.json({ result: "load success, insert "+JSON.parse(body).length+" since "+convertedLast });
			  });
			}).on('error', function(e) {
				console.log("Got error: " + e.message);
		  });
		  
		  request.end();
	})
	.catch(
		reason => console.error(reason)
	);
	


});

router.get('/exchanges', function(req, res, next) {
	
	const https = require('https');

	var options = {
	"method": "GET",
	"hostname": "rest.coinapi.io",
	"path": "/v1/exchanges",
	"headers": {'X-CoinAPI-Key': ' E61D55E0-797B-40AA-862E-DF2421FCF687'}
	};

	var collection_name = "exchanges";
	var request = https.request(options, function (response) {
		var body = ''
		response.on("data", function (chunk) {
			body += chunk;
		});
		response.on('end', function() {

			//console.log(body);
			saveCollection(body, collection_name);
			return res.json({ result: "success" });
		  });
		}).on('error', function(e) {
			console.log("Got error: " + e.message);
      });
	  
	  request.end();


});

router.get('/getLast',function(req, res, next) {
	getLast()
	.then(last =>  {
		console.log("last")
		console.log(last)
		var convertedLast = moment.tz(last, my_tz).format();
		return res.json({ result: last , converted : convertedLast });
	})
	.catch(
		reason => console.error(reason)
	);

});

function getLast() {
	return new Promise((resolve, reject) => {
		var filter = {}
		var sort = {time_period_end: -1}
		var limit = 1;
		var history;
		var collection_name = "history_BRAZILIEX_SPOT_BTC_BR";

		history = getFromCollection(collection_name ,filter , sort ,limit)
			.then(history =>  {
				console.log("history")
				console.log(history[0].time_period_end)
				resolve(history[0].time_period_end)
			})
			.catch(
				reason => console.error(reason)
			);
		}
	);
}

function getFirst() {
	return new Promise((resolve, reject) => {
		var filter = {}
		var sort = {time_period_end: 1}
		var limit = 1;
		var history;
		var collection_name = "history_BRAZILIEX_SPOT_BTC_BR";

		history = getFromCollection(collection_name ,filter , sort ,limit)
			.then(history =>  {
				console.log("history")
				console.log(history[0].time_period_end)
				resolve(history[0].time_period_end)
			})
			.catch(
				reason => console.error(reason)
			);
		}
	);
}

function getAll(sortAsc = -1) {
	return new Promise((resolve, reject) => {
		var filter = {}
		var sort = {time_period_end: sortAsc}
		var limit = 10000;
		var history;
		var collection_name = "history_BRAZILIEX_SPOT_BTC_BR";

		history = getFromCollection(collection_name ,filter , sort ,limit)
			.then(history =>  {
				resolve(history)
			})
			.catch(
				reason => console.error(reason)
			);
		}
	);
}


function getFirstEma9() {
	return new Promise((resolve, reject) => {
		var filter = {}
		var sort = {time_period_end: 1}
		var limit = 1;
		var history;
		var collection_name = "ema9_BRAZILIEX_SPOT_BTC_BR";

		history = getFromCollection(collection_name ,filter , sort ,limit)
			.then(history =>  {
				console.log("history")
				console.log(history[0].time_period_end)
				resolve(history[0].time_period_end)
			})
			.catch(
				reason => console.error(reason)
			);
		}
	);
}

function getFirstSma() {
	return new Promise((resolve, reject) => {
		var filter = {}
		var sort = {time_period_end: 1}
		var limit = 1;
		var history;
		var collection_name = "sma9_BRAZILIEX_SPOT_BTC_BR";

		history = getFromCollection(collection_name ,filter , sort ,limit)
			.then(history =>  {
				console.log("history")
				console.log(history[0].time_period_end)
				resolve(history[0].time_period_end)
			})
			.catch(
				reason => console.error(reason)
			);
		}
	);
}

function updateCollection(id , newValue, collection_name){
	console.log("updateCollection");
	console.log(id);
	console.log(newValue);
	console.log(collection_name);
	client.connect(uri, function (err, db) {
		if (err) return next(err);
		var collection = db.collection(collection_name);
		collection.updateOne(
			{_id: id },
			{ $set: newValue },
			function(err, result) {
			//console.log("err");
			//console.log(err);
			//console.log("result");
			//console.log(result);		
			return { result: "success" };
		});
	});
}

function saveCollection(body, collection_name){
	console.log("saveCollection");
	var history = JSON.parse(body);
	console.log(history);
	client.connect(uri, function (err, db) {
		if (err) return next(err);
		var collection = db.collection(collection_name);
		collection.insertMany(history, function(err, result) {
			console.log("err");
			console.log(err);
			console.log("result");
			console.log(result);		
			return { result: "success" };
		});
	});
}

function getFromCollection( collection_name ,filter = {}, sort = {} ,limit = 25){
	return new Promise((resolve, reject) => {
		client.connect(uri, function (err, db) {
			if (err) {
				reject(err); return;
			} 
			var collection = db.collection(collection_name);
			collection.find(filter).sort(sort).limit( limit ).toArray(function(err, docs) {
	
				console.log("err");
				console.log(err);
				//console.log("docs");
				//console.log(docs);	
				resolve(docs);
			});			
		});
	});
	
}

var Braziliex = require('../lib/braziliex'),
    // When using as an NPM module, use `require('braziliex.js')`

    // Create a new instance, with optional API key and secret
    braziliex = new Braziliex(

    );

// Do not include the line below once the issue is resolved.
Braziliex.STRICT_SSL = false;

router.get('/braziliex', function(req, res, next) {

/*
    braziliex.depositAddress('btc', function(err, data){
		if (err){    console.log('ERROR', err);    return;  }
		console.log("depositAddress");
        console.log(data);

    });


// Public call

	braziliex.currencies(function(err, data){
		if (err){
			console.log('ERROR', err);
			return;
		}
		console.log("currencies");
		console.log(data);
	});
*/
console.log("**************************************************************");
	braziliex.orderBook('ltc_btc', function(err, data){
		if (err){
			console.log('ERROR', err);
			return;   
		}
		console.log("orderBook");
		console.log(data);
	});
	console.log("**************************************************************");
/*
// private funcions funcionando 

braziliex.completeBalance(function(err, data){
    if (err){
        console.log('ERROR', err);
        return;
    }

    console.log(data);
});

braziliex.openOrders('xmr_brl', function(err, data){
    if (err){    console.log('ERROR', err);    return;  }
    console.log(data);
});


/*
braziliex.sell('eth_brl', 100000, 0.001, function(err, data){
    if (err){    console.log('ERROR', err);    return;  }
    console.log(data);
});


braziliex.cancelOrder('xmr_brl', '5963e653249b066b97335ef0', function(err, data){
    if (err){    console.log('ERROR', err);    return;  }
    console.log(data);
});


braziliex.tradeHistory('eth_brl', function(err, data){
    if (err){    console.log('ERROR', err);    return;  }
    console.log(data);
});

*/
res.render('index', { title: 'data' });
});


module.exports = router;