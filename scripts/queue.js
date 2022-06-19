const { ethers, network } = require("hardhat")
const moveBlocks = require("../utils/move-blocks")
const moveTime = require("../utils/move-time")

async function queueAndExecute() {
  const treasury = await ethers.getContract("Treasury")
  const governor = await ethers.getContract("GovernorContract")
  
  const encodedFunctionCall = treasury.interface.encodeFunctionData("store", [ 77 ])
  const descriptionHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('store 77 in the treasury'))

  console.log("Queueing...")
  const queueTx = await governor.queue([treasury.address], [0], [encodedFunctionCall], descriptionHash)
  await queueTx.wait(1)

  if ([ "hardhat", "localhost" ].includes(network.name)) {
    await moveTime(3600 + 1)
    await moveBlocks(1)
  }

  console.log("Executing...")
  const executeTx = await governor.execute([treasury.address], [0], [encodedFunctionCall], descriptionHash)
  await executeTx.wait(1)
  console.log(`Treasury value: ${await treasury.retrieve()}`)
}

queueAndExecute()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
