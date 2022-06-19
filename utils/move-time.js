const { network } = require("hardhat")

async function moveTime(amount, log=true) {
  if (log) { console.log("Moving blocks...") }
  await network.provider.send("evm_increaseTime", [ amount ])
  if (log) { console.log(`Moved forward in time ${amount} seconds`) }
}

module.exports = moveTime