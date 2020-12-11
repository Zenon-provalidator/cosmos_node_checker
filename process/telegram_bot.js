const cfg = require('dotenv').config({ path: './config' }).parsed //load config file
const logger = require('./logger').log4js
const fs = require('fs')
const path = require('path')
const telegraf = require('telegraf')
const server = require('./server')
const alert = require('./alert')
const bot = new telegraf(cfg.TELEGRAM_BOT_TOKEN)

let variables = {}

const setVariables = ((vars) => {
	variables = vars
})

bot.command('bot_start', async (ctx) => {
	require('../main').botStart()
	ctx.reply(`bot start!`)
})

bot.command('bot_stop', async (ctx) => {
	require('../main').botStop()
	ctx.reply(`bot stop!`)
})

bot.command('status', async (ctx) => {
	let deamonStatus = await server.getDeamonStatus()
	let botStatus = require('../main').botStatus()
	ctx.reply(`DeamonStatus : ${deamonStatus}\nBotStatus : ${botStatus}`)
})

bot.command('server', (ctx) => {
	try{
		let blockHeight = typeof variables.blockHeight === undefined ? undefined : variables.blockHeight.toLocaleString()
		let rpcHeight = typeof variables.rpcHeight === undefined ? undefined : variables.rpcHeight.toLocaleString()
		ctx.reply(`Memory : ${variables.mem}%\nCpu : ${variables.cpu}%\nDisk : ${variables.disk}%\nPeerCount : ${variables.peer}\nLatestHeight : ${blockHeight}\nRpcHeight : ${rpcHeight}\n`)
	} catch (err){
		ctx.reply(err)
	}	
})

bot.command('config', (ctx) => {
	const filePath = path.join(__dirname, "../config")
	let config = fs.readFileSync(filePath,{encoding:'utf8', flag:'r'})
	ctx.reply(config)
})

bot.startPolling()

module.exports = {
	setVariables : setVariables
}