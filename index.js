
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
//const fetch = require('node-fetch');
const TronWeb = require('tronweb');

require('dotenv').config();
const CronJob = require('cron').CronJob;

function delay(ms) {return new Promise(res => setTimeout(res, ms));}

const TRONGRID_API = "https://api.trongrid.io";

var tronWeb = new TronWeb({
	fullHost: TRONGRID_API,
    headers: { "TRON-PRO-API-KEY": process.env.tron_api_key }
	
});

var inicio = new CronJob('0 */1 * * * *', async() => {
	console.log('-----------------------------------');
	console.log('>Running :'+new Date().toLocaleString());
	console.log('-----------------------------------');

	watchWallet("TRrhyn55AtGEjgaLpj9sTbRGhqzVJ8ueNs", "energy", 200000, "1d", 200000, process.env.token_EBOT, "1598897599");
	watchWallet("TW874JtRJDSwincEm64s2WbSQsMBUsiP1L", "band", 1000, "3d", 284, process.env.token_EBOT_2, "2129154100");

	
});

inicio.start();

async function watchWallet(viewWallet, resource, amount, time, valorMonitoreo, token, id){
    let recursos = await tronWeb.trx.getAccountResources(viewWallet)

    var eval = 0;
    if(resource === "energy"){
        eval = recursos.EnergyLimit
        if(recursos.EnergyUsed){
            eval = recursos.EnergyLimit-recursos.EnergyUsed
        }
        
    }else{
        eval = (recursos.freeNetLimit+recursos.NetLimit)-(recursos.freeNetUsed+recursos.NetUsed)

    }

    console.log("monitoring "+resource+": "+(eval).toLocaleString("en-us")+" ("+(valorMonitoreo).toLocaleString("en-us")+")"+viewWallet)

    if(eval <= parseInt(valorMonitoreo) && true){
        
        var result = await fetch("https://e-bot.brutusservices.com/main/"+resource,{

            headers:{
                "token-api": token,
                "Content-Type": "application/json",
            },
            method: "POST",
            body:JSON.stringify({
                "id_api": id,
                "wallet": viewWallet,
                "amount": amount,
                "time": time,
                "user_id": "string"
            })
        })

        result = await result.json()

        if(result.response === 1){
            console.log("+"+ amount +" "+resource+" para:"+viewWallet)
        }else{
            console.log("FALLO: "+ amount +" "+resource+" para:"+viewWallet)
        }

    }

}

