#!/usr/bin/env node
var chalk = require('chalk');
var program = require('commander');
var co = require('co');
var prompt = require('co-prompt');
var sync = require('child_process').spawnSync;



program
    .version('0.1.0')

program
    .command('sendToExchange <confFile>')
    .description('Send to Exchange')
    .action(function(confFile){

        var config = require(confFile);
       // console.log(config);

        let mybalance = sync(config.coinCli, [config.coinDatDir, config.cmdGetBallance]).stdout.toString().trim();
        let myunconfirmedbalance = sync(config.coinCli, [config.coinDatDir, config.cmdGetUnconfirmedBallance]).stdout.toString().trim(); 
        let toSend = mybalance - myunconfirmedbalance - config.mmLock;
        let toSendInt = parseFloat(toSend) - config.txFee;
        toSendInt =  toSendInt.toFixed(5);
        if (toSendInt > config.minToSendToExchange) {
            let cmd = sync(config.coinCli, [config.coinDatDir, config.cmdSend, config.exchangeAddress, toSendInt]);
            let txId = cmd.stdout.toString().trim();
            console.log("Enviado " + toSendInt + " to exhange (" + config.exchangeAddress + ") txid " + txId);
            console.log('Err ', cmd.stderr.toString());   
        } else {
            console.log("Valor baixo para enviar para Exchange " + toSendInt + " < " + config.minToSendToExchange);
        }

        
    });


program
    .command('test')
    .description('test rpc')
    .action(function(){
        var user = 'will';
        var password = '12041980';
        
        var base64encodedData = new Buffer(user + ':' + password).toString('base64');
        var url = 'http://127.0.0.1:8818/';

        let headers =  { 
                          'content-type': 'text/plain;',
                         'Authorization': 'Basic ' + base64encodedData 
                    };
        let json =  {
                       "jsonrpc": "1.0" ,
                       "method": "getwalletinfo",
                       "params": [] 
                    };


        var request = require('sync-request');
        var res = request('POST', url, {
            json: json,
            headers : headers
        });
        var out = JSON.parse(res.getBody('utf8'));
        console.log(out);


    });


program.parse(process.argv);