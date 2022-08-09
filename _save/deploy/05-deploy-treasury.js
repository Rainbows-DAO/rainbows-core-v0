
async function deployTreasury({ getNamedAccounts, deployments: { deploy, log, get }, network }) {
    const { deployer } = await getNamedAccounts()
    const timeLock = await get("TimeLock")
    
    const treasury = await deploy("Treasury", { from: deployer, args: [], log: true })
    const treasuryContract = await ethers.getContractAt("Treasury", treasury.address)
    
    const transferOwnershipTx = await treasuryContract.transferOwnership(timeLock.address)
    await transferOwnershipTx.wait(1)
}

module.exports = deployTreasury  