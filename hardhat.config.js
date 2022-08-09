require("@nomiclabs/hardhat-waffle")
require("@nomiclabs/hardhat-ethers")
require("@nomiclabs/hardhat-etherscan")
require("hardhat-deploy")
require("dotenv").config()

// const POLYGON_MAINNET_RPC_URL = process.env.POLYGON_MAINNET_RPC_URL 
// const POLYGONSCAN_API_KEY = process.env.POLYGONSCAN_API_KEY
// const PRIVATE_KEY = process.env.PRIVATE_KEY

module.exports = {
    defaultNetwork: "hardhat",
    networks: {
        hardhat: { chainId: 1337 },
        localhost: { chainId: 1337 },
        // polygon: {
        //     url: POLYGON_MAINNET_RPC_URL,
        //     accounts: PRIVATE_KEY !== undefined ? [PRIVATE_KEY] : [],
        //     saveDeployments: true,
        //     chainId: 137,
        // },
    },
    etherscan: {
        // npx hardhat verify --network <NETWORK> <CONTRACT_ADDRESS> <CONSTRUCTOR_PARAMETERS>
        // apiKey: { polygon: POLYGONSCAN_API_KEY },
    },
    namedAccounts: {
        deployer: { default: 0 },
        user: { default: 1 },
    },
    solidity: {
        compilers: [
            { 
                version: "0.8.9",
                settings: {
                    optimizer: { enabled: true, runs: 200 },
                }
            },
            { version: "0.4.24" },
        ],
    },
    mocha: { timeout: 200000 }, // 20s
}
