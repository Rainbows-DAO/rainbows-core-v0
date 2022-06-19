const { ethers, network } = require("hardhat")
const fs = require("fs")
const moveBlocks = require("../utils/move-blocks")

const index = 0
const votingPeriod = 20

async function main(idx) {
  const proposals = JSON.parse(fs.readFileSync("proposals.json", "utf8"))
  const proposalId = proposals[network.config.chainId][idx]
  const voteWay = 1                     // 0 = Against, 1 = For, 2 = Abstain for this example
  const reason = "I lika do da cha cha"
  await vote(proposalId, voteWay, reason)
}

async function vote(proposalId, voteWay, reason) {
  console.log("Voting...")
  const governor = await ethers.getContract("GovernorContract")
  
  const voteTx = await governor.castVoteWithReason(proposalId, voteWay, reason)
  const voteTxReceipt = await voteTx.wait(1)
  
  console.log(voteTxReceipt.events[0].args.reason) 
  
  const proposalState = await governor.state(proposalId)
  console.log(`Current Proposal State: ${proposalState}`)

  if ([ "hardhat", "localhost" ].includes(network.name)) {
    await moveBlocks(votingPeriod + 1)
  }
}

main(index)
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
