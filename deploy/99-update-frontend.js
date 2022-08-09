const { ethers, network } = require("hardhat") 
const fs = require("fs")

const frontend = "../rainbows-dao-frontend/constants/"

module.exports = async function() {
    const unit = await ethers.getContract("UnitToken")
    const loop = await ethers.getContractFactory("Loop")
    const rainbows = await ethers.getContract("Rainbows")
    const chainId = network.config.chainId.toString()
    const addresses = { [chainId]: { 
        unit: unit.address, 
        // loop: loop.address, 
        rainbows: rainbows.address 
    }}
    fs.writeFileSync(frontend + "contractAddresses.json", JSON.stringify(addresses), "utf8")
    const abi = { 
        "unit": JSON.parse(unit.interface.format(ethers.utils.FormatTypes.json)), 
        "loop": JSON.parse(loop.interface.format(ethers.utils.FormatTypes.json)),
        "rainbows": JSON.parse(rainbows.interface.format(ethers.utils.FormatTypes.json)),
    }
    fs.writeFileSync(frontend + "abi.json", JSON.stringify(abi), "utf8")
}
