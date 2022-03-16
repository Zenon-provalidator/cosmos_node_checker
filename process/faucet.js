const cfg = require('dotenv').config({ path: './config' }).parsed //load config file
const exec = require('child_process').execSync
/*
# faucet .env
BINARY="/root/go/bin/cerberusd"
DENOM="ucrbrus"
WALLET="cerberus1tnmjjj5ugcunyy75q3c3pn62qpwnf50pxcqpp3"
CHAIN_ID="cerberus-chain-1"
SEND_AMOUNT="1000000"
FEE="10000"
*/

//get balances
//cerberusd q bank balances cerberus12pgtk90nlrzqftdl2w9kewe6rrkzaszk7yk9cz
const getBalances = (async (addr) => {
	let cmd = `${cfg.BINARY} q bank balances ${addr} --chain-id="${cfg.CHAIN_ID}"`
	let res = await exec(cmd)
	return res.toString()
})

//send
//cerberusd tx bank send cerberus1tnmjjj5ugcunyy75q3c3pn62qpwnf50pxcqpp3 cerberus12pgtk90nlrzqftdl2w9kewe6rrkzaszk7yk9cz 2000000ucrbrus --fees=10000ucrbrus --chain-id=ceruberus-chain-1 -y
const sendToken = (async (addr) => {
	let cmd = `echo ${cfg.PASSPHRASE} | ${cfg.BINARY} tx bank send {cfg.WALLET} ${addr} ${cfg.SEND_AMOUNT}${cfg.DENOM} --fees="${cfg.FEE}${cfg.DENOM}" --chain-id="${cfg.CHAIN_ID}" -y`
	let res = await exec(cmd)
	return res.toString()
})

module.exports = {
	getBalances : getBalances,
	sendToken : sendToken
} 