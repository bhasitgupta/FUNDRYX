// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title IRiskAttestationRegistry
/// @notice Interface for advisory-only risk report metadata in Fundryx
/// @dev This registry has NO financial authority — cannot transfer funds or change policy
interface IRiskAttestationRegistry {
    struct RiskReport {
        bytes32 reportId;
        bytes32 modelVersion;
        uint32 ruleSetVersion;
        uint256 sourceChainId;
        uint256 fromBlock;
        uint256 toBlock;
        uint64 createdAt;
        uint8 riskLevel; // 0=informational, 1=warning, 2=critical
        bytes32 reportHash;
        address signer;
        bool revoked;
    }

    event RiskReportRegistered(
        bytes32 indexed reportId,
        bytes32 modelVersion,
        uint8 riskLevel,
        uint256 fromBlock,
        uint256 toBlock,
        address indexed signer
    );

    event RiskReportRevoked(bytes32 indexed reportId, address indexed revokedBy);

    /// @notice Register a signed risk report
    function registerReport(
        bytes32 reportId,
        bytes32 modelVersion,
        uint32 ruleSetVersion,
        uint256 sourceChainId,
        uint256 fromBlock,
        uint256 toBlock,
        uint8 riskLevel,
        bytes32 reportHash,
        bytes calldata signature
    ) external;

    /// @notice Revoke/supersede a report
    function revokeReport(bytes32 reportId) external;

    /// @notice Get report details
    function getReport(bytes32 reportId) external view returns (RiskReport memory);
}
