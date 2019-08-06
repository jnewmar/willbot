#!/usr/bin/env node
var chalk = require('chalk');
var program = require('commander');
var co = require('co');
var prompt = require('co-prompt');


var Braziliex = require('../lib/braziliex');
// When using as an NPM module, use `require('braziliex.js')`

// Create a new instance, with optional API key and secret
braziliex = new Braziliex(
      '######################################',
      '######################################'
);

// Do not include the line below once the issue is resolved.
Braziliex.STRICT_SSL = false;

program
    .version('0.1.0')


program
  .command('depositAddress <symbol>')
  .description('Get the deposit Address')
  .action(function(symbol, options){
    braziliex.depositAddress(symbol, function(err, data){
      if (err){    console.log('ERROR', err);    return;  }
      //console.log("depositAddress");
      console.log(data);

    });
  });


  program
  .command('orderBook <market>')
  .description('Get the orderBook')
  .action(function(market, options){
    braziliex.orderBook(market, function(err, data){
      if (err){
        console.log('ERROR', err);
        return;   
      }
      //console.log("orderBook");
      console.log(data);
    });
  });


  program
  .command('currencies')
  .description('Get the currencies')
  .action(function(){
    braziliex.currencies(function(err, data){
      if (err){
        console.log('ERROR', err);
        return;
      }
      console.log(data);
    });
  });

  program
  .command('completeBalance')
  .description('Get the completeBalance')
  .action(function(){
    braziliex.completeBalance(function(err, data){
      if (err){
        console.log('ERROR', err);
        return;
      }
      console.log(data);
    });
  });

  program
  .command('openOrders <market>')
  .description('Get the openOrders')
  .action(function(market, options){
    braziliex.openOrders(market, function(err, data){
      if (err){
        console.log('ERROR', err);
        return;   
      }
      console.log(data);
    });
  });


  program
  .command('tradeHistory <market>')
  .description('Get the tradeHistory')
  .action(function(market, options){
    braziliex.tradeHistory(market, function(err, data){
      if (err){
        console.log('ERROR', err);
        return;   
      }
      console.log(data);
    });
  });

  program
  .command('buy <market> <price> <amount>')
  .description('Buy')
  .action(function(market, price, amount){
    braziliex.buy(market, price, amount, function(err, data){
      if (err){
        console.log('ERROR', err);
        return;   
      }
      console.log(data);
    });
  });

  program
  .command('sell <market> <price> <amount>')
  .description('Sell')
  .action(function(market, price, amount){
    braziliex.sell(market, price, amount, function(err, data){
      if (err){
        console.log('ERROR', err);
        return;   
      }
      console.log(data);
    });
  });

  program
  .command('cancelOrder <market> <orderNumber>')
  .description('Canel Order')
  .action(function(market,orderNumber, options){
    braziliex.cancelOrder(market, orderNumber, function(err, data){
      if (err){
        console.log('ERROR', err);
        return;   
      }
      console.log(data);
    });
  });



var rp = require('request-promise').defaults({json: true})

const api_root = 'https://min-api.cryptocompare.com'


function getHistory(exchange, fsym, tsym, resolution, from, to, first, limit) {
	//	console.log(exchange, fsym, tsym, resolution, from, to, first, limit);

			const url = resolution === 'D' ? '/data/histoday' : resolution >= 60 ? '/data/histohour' : '/data/histominute'
			const qs = {
					e: exchange,
					fsym: fsym,
					tsym: tsym,
					toTs:  to ? to : '',
					limit: limit ? limit : 2000, 
					// aggregate: 1//resolution 
				}
			// console.log({qs})

        return rp({
            url: `${api_root}${url}`,
            qs,
        })
        .then(data => {
            //console.log({data})
          if (data.Response && data.Response === 'Error') {
            console.log('CryptoCompare API error:',data.Message)
            return []
          }
          if (data.Data.length) {
          //	console.log(`Actually returned: ${new Date(data.TimeFrom * 1000).toISOString()} - ${new Date(data.TimeTo * 1000).toISOString()}`)
            var bars = data.Data.map(el => {
              return {
                time: el.time * 1000, //TradingView requires bar time in ms
                low: el.low,
                high: el.high,
                open: el.open,
                close: el.close,
                volume: el.volumefrom 
              }
            })
            return bars
          } else {
            return []
          }
			})
	}

  program
  .command('getHistory')// <exchange_market> <resolution> <from> <to> <firstDataRequest>')
  .description('Get the History')
  .action(function(exchange, fsym, tsym, resolution, from, to, firstDataRequest){
    exchange = 'Braziliex';
    fsym = 'BTC';
    tsym = 'BRL';
    resolution = '60';
    from = 1528934931;
    to = 1534118991;
    firstDataRequest = true;
    getHistory(exchange, fsym, tsym, resolution, from, to, firstDataRequest)
    .then(payload => {
      console.log(JSON.stringify(payload));
    }).catch(err => {
      console.log({err})
    })
  });

  var moment = require('moment');
  var crypto = require("crypto");
  var graviex_api_root = 'https://graviex.net';
  var access_key = '######################################';
  var secret = '######################################';

  program
  .command('graviex')// <exchange_market> <resolution> <from> <to> <firstDataRequest>')
  .description('Get graviex stuff')
  .action(function(){

    now = moment().unix();
    tonce =now*1000;
    console.log(tonce);

    const path = '/api/v2/markets'
    request = 'access_key=' + access_key + '&tonce=' + tonce
    message = 'GET|'+ path+ '|' + request

    console.log(message);

    signature = crypto.createHmac("sha256", secret).update(message).digest("hex");
    console.log(signature);


    url = graviex_api_root+ path

    const qs = {
      access_key : access_key,
      tonce : tonce ,
      signature : signature
      }
     console.log({qs})

      return rp({
          url: url,
          qs,
      })
      .then(data => {
          //console.log({data})
        if (data.Response && data.Response === 'Error') {
          console.log('Graviex API error:',data.Message)
        }
        console.log(data);
    })
  });


/*
program
    .command('login [env]')
    .option('-u, --username <username>', 'The user to authenticate as')
    .option('-p, --password <password>', 'The user\'s password')
    .action(function(file) {
        co(function *() {
            var username = yield prompt('username: ');
            var password = yield prompt.password('password: ');
            console.log('user: %s pass: %s ',username, password);
        });
    });    

program
  .command('setup [env]')
  .description('run setup commands for all envs')
  .option("-s, --setup_mode [mode]", "Which setup mode to use")
  .action(function(env, options){
    var mode = options.setup_mode || "normal";
    env = env || 'all';
    console.log('setup for %s env(s) with %s mode', env, mode);
  });

program
  .command('exec <cmd>')
  .alias('ex')
  .description('execute the given remote cmd')
  .option("-e, --exec_mode <mode>", "Which exec mode to use")
  .action(function(cmd, options){
    console.log('exec "%s" using %s mode', cmd, options.exec_mode);
  }).on('--help', function() {
    console.log('  Examples:');
    console.log();
    console.log('    $ deploy exec sequential');
    console.log('    $ deploy exec async');
    console.log();
  });

program
  .command('*')
  .action(function(env){
    console.log('deploying "%s"', env);
  });
*/
program.parse(process.argv);
