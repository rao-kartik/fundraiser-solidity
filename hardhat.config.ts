import "dotenv/config";

import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const polygonMumbaiPvtKey: string = process.env.POLYGON_MUMBAI_PRIVATE_KEY?.trim() ?? "";
const infuraProjectId: string = process.env.INFURA_PROJECT_ID?.trim() ?? "";
const alchemyProjectId: string = process.env.ALCHEMY_PROJECT_ID?.trim() ?? "";

const config: HardhatUserConfig = {
  solidity: "0.8.18",
  defaultNetwork: "localhost",
  networks: {
    hardhat: {
      chainId: 31337,
    },
    localhost: {
      chainId: 31337,
    },
    ppl_mum_t_alchemy: {
      url: `https://polygon-mumbai.g.alchemy.com/v2/${alchemyProjectId}`,
      accounts: [`0x${polygonMumbaiPvtKey}`],
    },
    ppl_mum_t_infura: {
      url: `https://polygon-mumbai.infura.io/v3/${infuraProjectId}`,
      accounts: [`0x${polygonMumbaiPvtKey}`],
    },
  },
};

export default config;
