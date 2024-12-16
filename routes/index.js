var express = require('express');
var router = express.Router();

require('dotenv').config()
const token_EBOT_LIST = (process.env.token_EBOT_LIST.split(',')).map((s)=>{s= s.split(':'); return {token: s[0], id: s[1] }})

const {TronWeb} = require('tronweb');
const CronJob = require('cron').CronJob;

const TRONGRID_API = "https://api.trongrid.io";

var tronWeb = new TronWeb({
    fullHost: TRONGRID_API,
    headers: { "TRON-PRO-API-KEY": process.env.tron_api_key }

});

let inicio = new CronJob('0 */1 * * * *', async () => {
  console.log('-----------------------------------');
  console.log('>Running: ' + new Date().toLocaleString());

  //1d, 2d, 4, 5min

  //dapp monitoring
  watchWallet("TCmWBMhbndmmqF61RYa9s3HvpFt7MrA7Wu", "band", 2000, "1d", 600, token_EBOT_LIST[0].token, token_EBOT_LIST[0].id);

  //ciroTRX.com
  watchWallet("TRrhyn55AtGEjgaLpj9sTbRGhqzVJ8ueNs", "energy", 200000, "5min", 200000, token_EBOT_LIST[1].token, token_EBOT_LIST[1].id);

  //Brutus Lottery
  //watchWallet("THnbpHLGkx4eW7DxJ2cg7zAoMnQYZusoXJ", "energy", 500000, "1d", 300000, token_EBOT_LIST[0].token, token_EBOT_LIST[0].id);



  //console.log('>End: ' + new Date().toLocaleString());
  console.log('-----------------------------------');

});

inicio.start();

async function watchWallet(viewWallet, resource, amount, time, valorMonitoreo, token, id) {
  let recursos = await tronWeb.trx.getAccountResources(viewWallet)

  if (time.split("d").length > 1) {
      time = time.split("d")[0]
  }

  var energyNeed = 0;
  if (resource === "energy") {
    if(recursos.EnergyLimit){
      energyNeed = recursos.EnergyLimit
      if (recursos.EnergyUsed) {
          energyNeed = recursos.EnergyLimit - recursos.EnergyUsed
      }
    }
     

  } else {
      //console.log(recursos)
      energyNeed = recursos.freeNetLimit

      if (recursos.freeNetUsed) {
        energyNeed = recursos.freeNetLimit - recursos.freeNetUsed
      }

      if (recursos.NetLimit) {
          energyNeed =+ recursos.NetLimit
          if (recursos.NetUsed) {
              energyNeed = energyNeed - recursos.NetUsed
          }
      }


  }

  //Energy by freezing
  //console.log(1/recursos.TotalEnergyWeight*recursos.TotalEnergyLimit)

  console.log("#Monitoring -> " + resource + ": " + energyNeed + " (" + valorMonitoreo + ")" + viewWallet)

  if (energyNeed <= parseInt(valorMonitoreo) && true) {

      var result = await fetch("https://e-bot.brutusservices.com/main/" + resource, {

          headers: {
              "token-api": token,
              "Content-Type": "application/json",
          },
          method: "POST",
          body: JSON.stringify({
              "id_api": id,
              "wallet": viewWallet,
              "amount": amount,
              "time": time,
              "user_id": "Supplyenergy:"+viewWallet
          })
      })

      result = await result.json()

      if (result.response === 1) {
          console.log("+" + amount + " " + resource + " para:" + viewWallet)
      } else {
        
          console.log("FALLO: " + amount + " " + resource + " para:" + viewWallet)
          console.log("REASON: "+ result.msg)
      }

  }

}


/* GET home page. */
router.get('/', function(req, res, next) {
  res.send({online: true, running: inicio.running});
});

router.get('/holamundo', function(req, res, next) {
  res.send({hi: "mijo"});
});

module.exports = router;
