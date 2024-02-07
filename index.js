
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


    //dapp monitoring
	watchWallet("TCmWBMhbndmmqF61RYa9s3HvpFt7MrA7Wu", "band", 2000, "1d", 600, process.env.token_EBOT, process.env.token_EBOT_ID);

    //ciroTRX.com
	watchWallet("TRrhyn55AtGEjgaLpj9sTbRGhqzVJ8ueNs", "energy", 200000, "1d", 150000, process.env.token_EBOT, process.env.token_EBOT_ID);
	
    //Brutus Lottery
    watchWallet("THnbpHLGkx4eW7DxJ2cg7zAoMnQYZusoXJ","energy",500000,"1d",300000, process.env.token_EBOT, process.env.token_EBOT_ID)
    
    
    //otros
    //watchWallet("TW874JtRJDSwincEm64s2WbSQsMBUsiP1L", "band", 1000, "3d", 284, process.env.token_EBOT_2, process.env.token_EBOT_2_ID);

	
});

inicio.start();

async function watchWallet(viewWallet, resource, amount, time, valorMonitoreo, token, id){
    let recursos = await tronWeb.trx.getAccountResources(viewWallet)

    if(time.split("d").length > 1){
        time = time.split("d")[0]
    }

    var eval = 0;
    if(resource === "energy"){
        eval = recursos.EnergyLimit
        if(recursos.EnergyUsed){
            eval = recursos.EnergyLimit-recursos.EnergyUsed
        }
        
    }else{
        //console.log(recursos)
        eval = recursos.freeNetLimit
        if(recursos.freeNetUsed){
            eval = recursos.freeNetLimit-recursos.freeNetUsed
        }
        if(recursos.NetLimit){
            eval = eval+recursos.NetLimit
            if(recursos.NetUsed){
                eval = eval-recursos.NetUsed
            }
        }
        

    }

    //Energy by freezing
    //console.log(1/recursos.TotalEnergyWeight*recursos.TotalEnergyLimit)

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

