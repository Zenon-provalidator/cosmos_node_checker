const cfg = require('dotenv').config({ path: './config' }).parsed //load config file
const logger = require('./process/logger').log4js
const alert = require('./process/alert')
const server = require('./process/server')
const rpc = require('./process/rpc')
const telegramBot = require('./process/telegram_bot')
const CronJob = require('cron').CronJob

// global variable
let memAlertCnt = 0
let cpuAlertCnt = 0
let diskAlertCnt = 0
let peerAlertCnt = 0
let lcdAlertCnt = 0
let checkedBlockHeight = 0
let validatorConnectTryCnt = 0
let alertFlag = false // default true

new CronJob(`*/2 * * * * *`, async function () {
	let mem = await server.getMemoryUsage()
	let cpu = await server.getCpuUsage()
	let disk = await server.getDiskUsage()
	let peer = await server.getPeerCount()
	let blockHeight = await server.getBlockHeight()
	let rpcHeight = await rpc.getRpcHeight()
	let checkDialPort = await server.checkDialPort()
	let checkLcdPort = await server.checkLcdPort()
	let checkValidatorConnect = await server.checkValidatorConnect()
	let checkValidatorSign = await server.checkValidatorSign(blockHeight)
	
	telegramBot.setVariables({
		mem : mem,
		cpu : cpu,
		disk : disk,
		peer : peer,
		blockHeight : blockHeight,
		rpcHeight : rpcHeight		
	})

	if(alertFlag === true){
		// memory check
		if(mem > parseFloat(cfg.SERVER_ALERT_MEMORY)) {
			if(memAlertCnt == 0){
				alert.sendMSG(`ALERT! Memory usesage is ${mem}% (${cfg.SERVER_ALERT_MEMORY}%)`)
			} 
			
			memAlertCnt = memAlertCnt < cfg.SERVER_ALERT_MEMORY_WAIT ? memAlertCnt + 1 : 0 
	//		logger.info(`memAlertCnt : ${memAlertCnt}`)
		}
		
		// cpu check
		if(cpu > parseFloat(cfg.SERVER_ALERT_CPU)) {
			if(cpuAlertCnt == 0){
				alert.sendMSG(`ALERT! Cpu usesage is ${cpu}% (${cfg.SERVER_ALERT_CPU}%)`)
			} 
			
			cpuAlertCnt = cpuAlertCnt < cfg.SERVER_ALERT_CPU_WAIT ? cpuAlertCnt + 1 : 0 
	//		logger.info(`cpuAlertCnt : ${cpuAlertCnt}`)
		}
		
		// disk check
		if(disk > parseFloat(cfg.SERVER_ALERT_DISK)) {
			if(diskAlertCnt == 0){
				alert.sendMSG(`ALERT! Disk usesage is ${disk}% (${cfg.SERVER_ALERT_DISK}%)`)
			} 
			
			diskAlertCnt = diskAlertCnt < cfg.SERVER_ALERT_DISK_WAIT ? diskAlertCnt + 1 : 0 
	//		logger.info(`diskAlertCnt : ${diskAlertCnt}`)
		}
		
		// peer check
		if(peer < parseFloat(cfg.SERVER_ALERT_PEER)) {
			if(peerAlertCnt == 0){
				alert.sendMSG(`ALERT! Peer count is ${peer} (${cfg.SERVER_ALERT_PEER}%)`)
			} 
			
			peerAlertCnt = peerAlertCnt < cfg.SERVER_ALERT_PEER_WAIT ? peerAlertCnt + 1 : 0 
	//		logger.info(`peerAlertCnt : ${peerAlertCnt}`)
		}
		
		// block height check
		if(blockHeight < rpcHeight) {
			let heightDiff = rpcHeight - blockHeight
			
			if(blockHeight > checkedBlockHeight){
				checkedBlockHeight = blockHeight 
				alert.sendMSG(`ALERT! Server height is lower than extern height. ${cfg.EXTERN_RPC_URL}\nDiff=${heightDiff.toLocaleString()}\nserver=${blockHeight.toLocaleString()}\nextern=${rpcHeight.toLocaleString()}`)
			} 
	//		logger.info(`blockHeightAlertCnt : ${blockHeightAlertCnt}`)
		} else if (blockHeight > checkedBlockHeight){
			let heightDiff = blockHeight - rpcHeight 
			
			if(checkedBlockHeight > blockHeight){
				checkedBlockHeight = blockHeight 
				alert.sendMSG(`ALERT! Extern height is lower than server height. ${cfg.EXTERN_RPC_URL}\nDiff=${heightDiff.toLocaleString()}\nserver=${blockHeight.toLocaleString()}\nextern=${rpcHeight.toLocaleString()}`)
			} 
	//		logger.info(`blockHeightAlertCnt : ${blockHeightAlertCnt}`)
		}
		
		// validator connect check
		if (checkValidatorConnect === false) {
			if(checkDialPort) {
				if(validatorConnectTryCnt == 0){
					alert.sendMSG(`ALERT! Validator is not connected. Try connect validator.`)
					let connectValidator = await server.connectValidator()
					
					if(connectValidator === false){
						alert.sendMSG(`ALERT! Validator connect fail.`)
					}
				}
				validatorConnectTryCnt = validatorConnectTryCnt < cfg.SERVER_ALERT_VALIDATORCONNECT_WAIT ? validatorConnectTryCnt + 1 : 0
			} else {
				alert.sendMSG(`ALERT! Dialingport is not opened.`)
			}
		}
		
		// LCD check
		if (cfg.PROJECT_LCD_USE === true){
			if(lcdAlertCnt == 0){
				alert.sendMSG(`ALERT! LCD is down.`)
			} 
			
			lcdAlertCnt = lcdAlertCnt < cfg.SERVER_ALERT_LCD_WAIT ? lcdAlertCnt + 1 : 0 
	//		logger.info(`lcdAlertCnt : ${lcdAlertCnt}`)
		}
		
		// sign check
		if(checkValidatorSign === false) {
			alert.sendMSG(`ALERT! Height ${blockHeight.toLocaleString()} is missed.\n${cfg.EXTERN_EXPLORER}/blocks/${blockHeight}`)
		}
	}
	
	
//	console.log('====================================')
//	
//	console.log(`mem : ${mem}`)
//	console.log(`cpu : ${cpu}`)
//	console.log(`disk : ${disk}`)
//	console.log(`peer : ${peer}`)
//	console.log(`blockHeight : ${blockHeight}`)
//	console.log(`rpcHeight : ${rpcHeight}`)
//	console.log(`checkDialPort : ${checkDialPort}`)
//	console.log(`checkLcdPort : ${checkLcdPort}`)
//	console.log(`checkValidatorConnect : ${checkValidatorConnect}`)
//	console.log(`checkValidatorSign : ${checkValidatorSign}`)
//	
//	console.log('====================================\n\n')
	
}).start()