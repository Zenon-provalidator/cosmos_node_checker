const cfg = require('dotenv').config({ path: './config' }).parsed //load config file
const exec = require('child_process').execSync
const logger = require('./logger').log4js

// *********server check**********
// memory
const getMemoryUsage = (async () => {
	let cmd1 = `free -m | tail -n 2| head -n 1 | awk '{print $2}'`
	let cmd2 = `free -m | tail -n 2| head -n 1 | awk '{print $3}'`
	let total = await exec(cmd1)	
	let used = await exec(cmd2)
	let memoryUsage = parseFloat((used / total) * 100).toFixed(2)
	return memoryUsage
})

// cpu
const getCpuUsage = (async () => {
	let cmd = `grep 'cpu ' /proc/stat | awk '{usage=($2+$4)*100/($2+$4+$5)} END {print usage}'`
	let res = await exec(cmd)
	let cpuUsage = parseFloat(res.toString()).toFixed(2)
	return cpuUsage
})

// disk
const getDiskUsage = (async () => {
	let cmd = `df -h | grep ${cfg.PROJECT_DAEMON_NAME}VG | wc -l`
	let res = await exec(cmd)
	let isVg = parseInt(res.toString()) > 0 ? true : false
			
	if(isVg){
		let cmd = `df -h | grep ${cfg.PROJECT_DAEMON_NAME}VG | awk '{print $5}' | tr -d '%'`
//		logger.info(`cmd : ${cmd}`)
		let res = await exec(cmd)
		let diskUsage = parseFloat(res.toString()).toFixed(2)
		return diskUsage
	} else{
		let cmd = `df -h | head -n 4 | tail -n 1 | awk '{print $5}' | tr -d '%'`
		let res = await exec(cmd)
//		logger.info(`cmd : ${cmd}`)
		let diskUsage = parseFloat(res.toString()).toFixed(2)
		return diskUsage
	}
})

// *********project check**********

// block height
const getBlockHeight = (async () => {
	let cmd = `${cfg.PROJECT_CLIENT_NAME} status | jq .sync_info.latest_block_height | tr -d '"'`
	let res = await exec(cmd)
	let blockHeight = parseInt(res.toString())
	return blockHeight
})

// peer count
const getPeerCount = (async () => {
	let cmd = `netstat -n | grep :${cfg.PROJECT_DAEMON_PORT} | grep EST | wc -l`
	let res = await exec(cmd)
	let peerCount = parseInt(res.toString())
	return peerCount
})

// dial port check
const checkDialPort = (async () => {
	let cmd = `netstat -lntp | grep :${cfg.PROJECT_DIAL_PORT} | wc -l`
	let res = await exec(cmd)
	let count = parseInt(res.toString())	
	return count > 0 ? true : false
})

// lcd port check
const checkLcdPort = (async () => {
	let cmd = `netstat -lntp | grep :${cfg.PROJECT_LCD_PORT} | wc -l`
	let res = await exec(cmd)
	let count = parseInt(res.toString())	
	return count > 0 ? true : false
})

// validator connect check
const checkValidatorConnect = (async () => {
	let cmd = `sudo netstat -nap | grep :${cfg.PROJECT_DAEMON_PORT} | grep ESTABLISHED | grep "${cfg.VALIDATOR_SERVER_IP}" | wc -l`
	let res = await exec(cmd)
	let count = parseInt(res.toString())	
	return count > 0 ? true : false
})

// validator sign check
const checkValidatorSign = (async (latestHeight) => {
	//let cmd = `${cfg.PROJECT_CLIENT_NAME} query block ${latestHeight} --trust-node=true | jq .block.last_commit.precommits[].validator_address | grep ${cfg.VALIDATOR_HASH} | tr -d '"'`
	let cmd = `${cfg.PROJECT_CLIENT_NAME} q block ${latestHeight} --trust-node=true | jq .block.last_commit.signatures[].validator_address | grep ${cfg.VALIDATOR_HASH} | wc -l`
	let res = await exec(cmd)
	let count = parseInt(res.toString())	
	return count > 0 ? true : false
})

// connect validator
const connectValidator = (async () => {
	let cmd = `curl --globoff 'localhost:${cfg.PROJECT_DIAL_PORT}/dial_peers?persistent=true&peers=\["${cfg.VALIDATOR_NODE_ID}@${cfg.VALIDATOR_SERVER_IP}:${cfg.VALIDATOR_DAEMON_PORT}"\]'`
	let res = await exec(cmd)
	let count = parseInt(res.toString())	
	return count > 0 ? true : false
})

module.exports = {
	getMemoryUsage : getMemoryUsage,
	getCpuUsage : getCpuUsage,
	getDiskUsage : getDiskUsage,
	getBlockHeight : getBlockHeight,
	getPeerCount : getPeerCount,
	checkDialPort : checkDialPort,
	checkLcdPort : checkLcdPort,
	checkValidatorConnect : checkValidatorConnect,
	checkValidatorSign : checkValidatorSign,
	connectValidator : connectValidator
}