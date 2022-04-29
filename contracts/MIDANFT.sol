// SPDX-License-Identifier: MIT
pragma solidity 0.8.13;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Royalty.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/AccessControlEnumerable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract MIDANFT is ERC721, ERC721Enumerable, ERC721URIStorage, ERC721Royalty, Pausable, AccessControlEnumerable {
    using Counters for Counters.Counter;

    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant URI_SETTER_ROLE = keccak256("URI_SETTER_ROLE");
    bytes32 public constant ROYALTY_SETTER_ROLE = keccak256("ROYALTY_SETTER_ROLE");

    Counters.Counter private _tokenIdCounter;

    string private _baseTokenURI;

    event BaseURIChanged(string indexed oldBaseURI, string indexed newBaseURI);

    constructor() ERC721("MIDA NFT", "MIDANFT") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(PAUSER_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        _grantRole(URI_SETTER_ROLE, msg.sender);
        _grantRole(ROYALTY_SETTER_ROLE, msg.sender);
    }

    function pause() public onlyRole(PAUSER_ROLE) {
        _pause();
    }

    function unpause() public onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    function setBaseURI(string memory newBaseURI) public onlyRole(URI_SETTER_ROLE) {
        string memory oldBaseURI = _baseTokenURI;
        _baseTokenURI = newBaseURI;
        emit BaseURIChanged(oldBaseURI, _baseTokenURI);
    }

    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }

    function setDefaultRoyalty(address receiver, uint96 feeNumerator) public onlyRole(ROYALTY_SETTER_ROLE) {
        _setDefaultRoyalty(receiver, feeNumerator);
    }

    function setTokenRoyalty(
        uint256 tokenId,
        address receiver,
        uint96 feeNumerator
    ) public onlyRole(ROYALTY_SETTER_ROLE) {
        _setTokenRoyalty(tokenId, receiver, feeNumerator);
    }

    function safeMint() public onlyRole(MINTER_ROLE) {
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(_msgSender(), tokenId);
    }

    function safeMintBatch(uint256 quantity) public onlyRole(MINTER_ROLE) {
        require(quantity > 0, "Quantity must be > 0");
        for (uint256 i = 0; i < quantity; i++) {
            safeMint();
        }
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal override(ERC721, ERC721Enumerable) whenNotPaused {
        super._beforeTokenTransfer(from, to, tokenId);
    }

    // The following functions are overrides required by Solidity.

    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage, ERC721Royalty) {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable, ERC721Royalty, AccessControlEnumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
