const cfg = require('dotenv').config({ path: './config' }).parsed //load config file
const logger = require('./logger').log4js
const fs = require('fs')
const path = require('path')
const telegraf = require('telegraf')
const alert = require('./alert')
const bot = new telegraf(cfg.TELEGRAM_BOT_TOKEN)


let variables = {}

const setVariables = ((vars) => {
	variables = vars
})

bot.command('status', (ctx) => {	
	alert.sendMSG(`Memory : ${variables.mem}%\nCpu : ${variables.cpu}%\nDisk : ${variables.disk}%\nPeerCount : ${variables.peer}\nLatestHeight : ${variables.blockHeight.toLocaleString()}\nRpcHeight : ${variables.rpcHeight.toLocaleString()}\n`)
})

bot.command('config', (ctx) => {
	const filePath = path.join(__dirname, "../config")
	let config = fs.readFileSync(filePath,{encoding:'utf8', flag:'r'})
	alert.sendMSG(config)
})

bot.startPolling()

module.exports = {
	setVariables : setVariables
}