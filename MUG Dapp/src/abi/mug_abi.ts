import { parseAbi } from 'viem'

export const MUG_ABI = parseAbi([
    
   // --- Constructor ---
  "constructor()",

  // --- Read ---
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() pure returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address account) view returns (uint256)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function owner() view returns (address)",

  "function CLAIM_AMOUNT() view returns (uint256)",
  "function CLAIM_INTERVAL() view returns (uint256)",
  "function MAX_SUPPLY() view returns (uint256)",
  "function lastClaimTime(address account) view returns (uint256)",

  // --- Write ---
  "function approve(address spender, uint256 value) returns (bool)",
  "function transfer(address to, uint256 value) returns (bool)",
  "function transferFrom(address from, address to, uint256 value) returns (bool)",
  "function mint(address to, uint256 amount)",
  "function requestToken()",
  "function transferOwnership(address newOwner)",
  "function renounceOwnership()",

  // --- Events ---
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "event Approval(address indexed owner, address indexed spender, uint256 value)",
  "event OwnershipTransferred(address indexed previousOwner, address indexed newOwner)",
  "event TokensClaimed(address indexed user, uint256 amount)",
  "event TokensMinted(address indexed to, uint256 amount)",

  // --- Errors (optional but supported in ethers v6) ---
  "error ERC20InsufficientAllowance(address spender, uint256 allowance, uint256 needed)",
  "error ERC20InsufficientBalance(address sender, uint256 balance, uint256 needed)",
  "error ERC20InvalidApprover(address approver)",
  "error ERC20InvalidReceiver(address receiver)",
  "error ERC20InvalidSender(address sender)",
  "error ERC20InvalidSpender(address spender)",
  "error OwnableInvalidOwner(address owner)",
  "error OwnableUnauthorizedAccount(address account)",
] as const)