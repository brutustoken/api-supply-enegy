
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
//const fetch = require('node-fetch');
const TronWeb = require('tronweb');

require('dotenv').config();
const CronJob = require('cron').CronJob;

function delay(ms) {return new Promise(res => setTimeout(res, ms));}

const Wallet = "TRrhyn55AtGEjgaLpj9sTbRGhqzVJ8ueNs" //wallet or contract to monitorice on Tron Network

const TRONGRID_API = "https://api.trongrid.io";

var tronWeb = new TronWeb({
	fullHost: TRONGRID_API,
    headers: { "TRON-PRO-API-KEY": process.env.tron_api_key }
	
});

var inicio = new CronJob('0 */2 * * * *', async() => {
	console.log('-----------------------------------');
	console.log('>Running :'+new Date().toLocaleString());
	console.log('-----------------------------------');

	await watchWallet()
	console.log('=>Done: '+new Date().toLocaleString());
	
});

inicio.start();

async function watchWallet(){
    var recursos = await tronWeb.trx.getAccountResources(Wallet)

    var energia = recursos.EnergyLimit-recursos.EnergyUsed
    console.log(energia) // aleta a los 100K compra 200K por 1 dia

    if(energia <= 100000){
        console.log("alquilar energia")

        var result = await fetch("https://e-bot.brutusservices.com/main/energy",{

            headers:{
                "token-api": "GF1mrydEHWCV6XisHj2Y",
                "Content-Type": "application/json",
            },
            method: "POST",
            body:JSON.stringify({
                "id_api": "1598897599",
                "wallet": Wallet,
                "amount": 200000,
                "time": "1",
                "user_id": "string"
            })
        })

        console.log(await result.json())
    }

}

