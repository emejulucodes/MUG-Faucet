// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/MUGToken.sol";


contract MUGTokenDeploymentScript is Script {
    function run() public {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        vm.startBroadcast(deployerPrivateKey);
        
        MUGToken mugToken = new MUGToken();
        
        vm.stopBroadcast();
        
        console.log("====== MUG Token Deployment ======");
        console.log("Contract Address:", address(mugToken));
        console.log("Token Name:", mugToken.name());
        console.log("Token Symbol:", mugToken.symbol());
        console.log("Total Supply:", mugToken.totalSupply());
        console.log("Max Supply:", mugToken.MAX_SUPPLY());
        console.log("Decimals:", mugToken.decimals());
        console.log("Claim Amount:", mugToken.CLAIM_AMOUNT());
        console.log("Claim Interval:", mugToken.CLAIM_INTERVAL(), "seconds (24 hours)");
        console.log("Owner:", mugToken.owner());
        console.log("==================================");
    }
}
