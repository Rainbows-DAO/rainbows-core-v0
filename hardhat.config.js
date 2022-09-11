require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-etherscan");
require("hardhat-gas-reporter");
require("solidity-coverage");
require("hardhat-deploy");
require("hardhat-abi-exporter");
require("dotenv").config();

const gasPriceApi = {
	eth: "https://api.etherscan.io/api?module=proxy&action=eth_gasPrice",
	bnb: "https://api.bscscan.com/api?module=proxy&action=eth_gasPrice",
	matic: "https://api.polygonscan.com/api?module=proxy&action=eth_gasPrice",
	avax: "https://api.snowtrace.io/api?module=proxy&action=eth_gasPrice",
};

module.exports = {
	abiExporter: {
		path: "../interface/src/constants/abi",
		runOnCompile: true,
		clear: true,
		flat: false,
		only: [],
		spacing: 2,
		format: "json",
	},
	gasReporter: {
		enabled: true,
		noColors: false,
		currency: "USD",
		coinmarketcap: process.env.COINMARKETCAP_API_KEY,
		token: "MATIC",
		gasPriceApi: gasPriceApi.matic,
		showTimeSpent: false,
	},
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
		polygonMumbai: {
			url: "https://matic-mumbai.chainstacklabs.com/",
			accounts: [process.env.DEPLOYER_PRIVATE_KEY],
			allowUnlimitedContractSize: true,
			chainId: 80001,
			saveDeployments: true,
		},
	},
	etherscan: {
		apiKey: { polygonMumbai: process.env.POLYGONSCAN_API_KEY },
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
				},
			},
			{ version: "0.4.24" },
		],
	},
	mocha: { timeout: 200000 }, // 20s
};
