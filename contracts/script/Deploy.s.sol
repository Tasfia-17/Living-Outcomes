// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {StrategyNFT} from "../src/StrategyNFT.sol";
import {StrategyMarketplace} from "../src/StrategyMarketplace.sol";
import {BundleRegistry} from "../src/BundleRegistry.sol";
import {PerformanceOracle} from "../src/PerformanceOracle.sol";
import {AgentRegistry} from "../src/AgentRegistry.sol";

contract Deploy is Script {
    function run() external {
        address deployer = vm.envAddress("DEPLOYER");
        address treasury = vm.envOr("TREASURY", deployer);

        vm.startBroadcast();

        AgentRegistry agentReg  = new AgentRegistry();
        StrategyNFT   nft       = new StrategyNFT();
        StrategyMarketplace mp  = new StrategyMarketplace(address(nft), treasury);
        BundleRegistry bundles  = new BundleRegistry(address(nft), treasury);
        PerformanceOracle oracle = new PerformanceOracle();

        nft.setMarketplace(address(mp));
        oracle.setReporter(deployer, true);

        vm.stopBroadcast();

        console.log("AgentRegistry  :", address(agentReg));
        console.log("StrategyNFT    :", address(nft));
        console.log("Marketplace    :", address(mp));
        console.log("BundleRegistry :", address(bundles));
        console.log("PerfOracle     :", address(oracle));
    }
}
