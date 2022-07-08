// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "erc721a/contracts/ERC721A.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

error Minter__CannotCallByContract();
error Minter__MaxSupplyReached();
error Minter__WithdrawFailed();
error Minter__InvalidMintAmount();
error Minter__NotEnoughMoney();

contract Minter is ERC721A, Ownable, ReentrancyGuard {
    event NftMinted(address _to, uint256 _amount);

    uint256 private constant MAX_SUPPLY = 30;
    uint256 private constant MINT_PRICE = 0.001 ether;
    string private constant TOKEN_NAME = "MYNFT";
    string private constant TOKEN_SYMBOL = "MYN";

    string private baseTokenUri;
    string private contractUri;

    constructor(string memory _baseTokenUri, string memory _contractUri)
        ERC721A(TOKEN_NAME, TOKEN_SYMBOL)
    {
        baseTokenUri = _baseTokenUri;
        contractUri = _contractUri;
    }

    modifier callerIsUser() {
        if (tx.origin != _msgSender()) revert Minter__CannotCallByContract();
        _;
    }

    function mintNfts(uint256 _amount) external payable callerIsUser {
        if (_amount <= 0) revert Minter__InvalidMintAmount();
        if ((totalSupply() + _amount) > MAX_SUPPLY)
            revert Minter__MaxSupplyReached();
        if (_msgSender() != owner()) {
            if (msg.value < (_amount * MINT_PRICE))
                revert Minter__NotEnoughMoney();
        }
        _safeMint(_msgSender(), _amount);
        emit NftMinted(_msgSender(), _amount);
    }

    function _startTokenId() internal view virtual override returns (uint256) {
        return 1;
    }

    function _baseURI() internal view virtual override returns (string memory) {
        return baseTokenUri;
    }

    function tokenURI(uint256 _tokenId)
        public
        view
        virtual
        override
        returns (string memory)
    {
        if (!_exists(_tokenId)) revert URIQueryForNonexistentToken();

        string memory baseURI = _baseURI();
        return
            bytes(baseURI).length != 0
                ? string(
                    abi.encodePacked(baseURI, _toString(_tokenId), ".json")
                )
                : "";
    }

    function withdraw() public onlyOwner nonReentrant {
        (bool success, ) = payable(owner()).call{value: address(this).balance}(
            ""
        );
        if (!success) revert Minter__WithdrawFailed();
    }

    function getContractBalance() public view returns (uint256) {
        return address(this).balance;
    }

    function contractURI() public view returns (string memory) {
        return contractUri;
    }
}
