// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "lib/openzeppelin-contracts/contracts/token/ERC20/ERC20.sol";
import "lib/openzeppelin-contracts/contracts/access/Ownable.sol";


contract MUGToken is ERC20, Ownable {
    uint256 public constant MAX_SUPPLY = 10_000_000 * 10**18;
    uint256 public constant CLAIM_AMOUNT = 100 * 10**18;
    uint256 public constant CLAIM_INTERVAL = 24 hours;
    
    mapping(address => uint256) public lastClaimTime;
    
    event TokensClaimed(address indexed user, uint256 amount);
    event TokensMinted(address indexed to, uint256 amount);

    constructor() ERC20("MUG Token", "MUG") Ownable(msg.sender) {
        _mint(msg.sender, 1_000_000 * 10**18);
    }
    
    function requestToken() external {
        require(
            lastClaimTime[msg.sender] == 0 ||
                block.timestamp >= lastClaimTime[msg.sender] + CLAIM_INTERVAL,
            "MUGToken: Must wait 24 hours between claims"
        );
        
        require(
            totalSupply() + CLAIM_AMOUNT <= MAX_SUPPLY,
            "MUGToken: Exceeds maximum supply"
        );
        
        lastClaimTime[msg.sender] = block.timestamp;
        _mint(msg.sender, CLAIM_AMOUNT);
        
        emit TokensClaimed(msg.sender, CLAIM_AMOUNT);
    }
    
    function mint(address to, uint256 amount) external onlyOwner {
        require(
            totalSupply() + amount <= MAX_SUPPLY,
            "MUGToken: Minting would exceed maximum supply"
        );
        
        require(to != address(0), "MUGToken: Invalid recipient address");
        
        _mint(to, amount);
        
        emit TokensMinted(to, amount);
    }
    
    function decimals() public pure override returns (uint8) {
        return 18;
    }
}
