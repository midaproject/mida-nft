// SPDX-License-Identifier: MIT
pragma solidity 0.8.13;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Royalty.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/AccessControlEnumerable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title MIDANFT contract
 * @dev This is the implementation of the ERC721 MIDA Non-Fungible Token.
 */
contract MIDANFT is ERC721, ERC721Enumerable, ERC721URIStorage, ERC721Royalty, Pausable, AccessControlEnumerable {
    using Counters for Counters.Counter;

    // -- Constants --

    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant URI_SETTER_ROLE = keccak256("URI_SETTER_ROLE");
    bytes32 public constant ROYALTY_SETTER_ROLE = keccak256("ROYALTY_SETTER_ROLE");

    // -- State --

    Counters.Counter private _tokenIdCounter;
    string private _baseTokenURI;

    // -- Events --

    event BaseURIChanged(string indexed oldBaseURI, string indexed newBaseURI);

    // -- Functions --

    /**
     * @dev MIDA NFT Contract Constructor.
     */
    constructor() ERC721("MIDA NFT", "MIDANFT") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(PAUSER_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        _grantRole(URI_SETTER_ROLE, msg.sender);
        _grantRole(ROYALTY_SETTER_ROLE, msg.sender);
    }

    /**
     * @dev Pauses all token transfers.
     * NOTE: It does not pause other contract functions
     */
    function pause() public onlyRole(PAUSER_ROLE) {
        _pause();
    }

    /**
     * @dev Unpauses all token transfers.
     */
    function unpause() public onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    /**
     * @dev Set the base URI for the metadata API.
     * @param newBaseURI The URI being set as base
     */
    function setBaseURI(string memory newBaseURI) public onlyRole(URI_SETTER_ROLE) {
        string memory oldBaseURI = _baseTokenURI;
        _baseTokenURI = newBaseURI;
        emit BaseURIChanged(oldBaseURI, _baseTokenURI);
    }

    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }

    /**
     * @dev Set the default royalty payment information.
     * @param receiver Address that should receive the royalties
     * @param feeNumerator Royalty fee
     */
    function setDefaultRoyalty(address receiver, uint96 feeNumerator) public onlyRole(ROYALTY_SETTER_ROLE) {
        _setDefaultRoyalty(receiver, feeNumerator);
    }

    /**
     * @dev Set the royalty payment information for a specific token.
     * NOTE: This will take precedence over the default value
     * @param tokenId Token to which these royalties apply
     * @param receiver Address that should receive the royalties
     * @param feeNumerator Royalty fee
     */
    function setTokenRoyalty(
        uint256 tokenId,
        address receiver,
        uint96 feeNumerator
    ) public onlyRole(ROYALTY_SETTER_ROLE) {
        _setTokenRoyalty(tokenId, receiver, feeNumerator);
    }

    /**
     * @dev Creates a new token for the caller. Its token ID will be automatically assigned.
     */
    function safeMint() public onlyRole(MINTER_ROLE) {
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(_msgSender(), tokenId);
    }

    /**
     * @dev Creates multiple tokens for the caller. Their token ID will be automatically assigned.
     * @param quantity Amount of tokens to create
     */
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
