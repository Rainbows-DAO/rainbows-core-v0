const { ethers, network } = require("hardhat")
const fs = require("fs")
const moveBlocks = require("../utils/move-blocks")

const votingDelay = 1 

console.log(network.name)
 
async function propose(args, fnStr, description) {
    const governor = await ethers.getContract("GovernorContract")
    const treasury = await ethers.getContract("Treasury")
    const fnCall = treasury.interface.encodeFunctionData(fnStr, args)
    const proposaltx = await governor.propose([ treasury.address ], [ 0 ], [ fnCall ], description)
    if ([ "hardhat", "localhost" ].includes(network.name)) {
        await moveBlocks(votingDelay + 1)
    }
    const receipt = await proposaltx.wait(1)
    saveData(receipt.events[0].args.proposalId)
}

function saveData(proposalId) {
    const proposals = JSON.parse(fs.readFileSync("proposals.json", "utf8"))
    const chainId = network.config.chainId.toString()
    const list = proposals[chainId] = []
    list.push(proposalId.toString())
    fs.writeFileSync("proposals.json", JSON.stringify(proposals), "utf8")
}

 propose([ 77 ], 'store', 'store 77 in the treasury')
    .then(() => process.exit(0))
    .catch(e => { console.log(e); process.exit(1) })