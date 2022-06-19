const { network } = require("hardhat")

async function moveBlocks(amount, log=true) {
  if (log) { console.log("Moving blocks...") }
  for (let index = 0; index < amount; index++) {
    await network.provider.request({ method: "evm_mine", params: [] })
  }
  if (log) { console.log(`Moved ${amount} blocks`) }
}

module.exports = moveBlocks