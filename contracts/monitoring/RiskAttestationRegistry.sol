// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {AccessManager} from "../core/AccessManager.sol";
import {IRiskAttestationRegistry} from "../interfaces/IRiskAttestationRegistry.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {MessageHashUtils} from "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

/// @title RiskAttestationRegistry
/// @notice Advisory-only risk report registry for Fundryx
/// @dev NO financial authority. Cannot transfer funds, change policy, or alter credit.
contract RiskAttestationRegistry is IRiskAttestationRegistry {
    using ECDSA for bytes32;
    using MessageHashUtils for bytes32;

    AccessManager public immutable accessManager;

    mapping(bytes32 => RiskReport) private _reports;
    uint256 public reportCount;

    error Unauthorized();
    error DuplicateReportId(bytes32 reportId);
    error InvalidSignature();
    error ReportNotFound(bytes32 reportId);

    constructor(address _accessManager) {
        accessManager = AccessManager(_accessManager);
    }

    /// @inheritdoc IRiskAttestationRegistry
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
    ) external {
        if (_reports[reportId].createdAt != 0) revert DuplicateReportId(reportId);

        // Verify signature from authorized monitor signer
        bytes32 messageHash = keccak256(
            abi.encodePacked(
                reportId, modelVersion, ruleSetVersion,
                sourceChainId, fromBlock, toBlock,
                riskLevel, reportHash
            )
        );

        address signer = messageHash.toEthSignedMessageHash().recover(signature);

        if (!accessManager.hasRole(accessManager.MONITOR_SIGNER_ROLE(), signer)) {
            revert InvalidSignature();
        }

        _reports[reportId] = RiskReport({
            reportId: reportId,
            modelVersion: modelVersion,
            ruleSetVersion: ruleSetVersion,
            sourceChainId: sourceChainId,
            fromBlock: fromBlock,
            toBlock: toBlock,
            createdAt: uint64(block.timestamp),
            riskLevel: riskLevel,
            reportHash: reportHash,
            signer: signer,
            revoked: false
        });

        reportCount++;

        emit RiskReportRegistered(
            reportId, modelVersion, riskLevel, fromBlock, toBlock, signer
        );
    }

    /// @inheritdoc IRiskAttestationRegistry
    function revokeReport(bytes32 reportId) external {
        if (!accessManager.hasRole(accessManager.ADMIN_ROLE(), msg.sender)
            && !accessManager.hasRole(accessManager.MONITOR_SIGNER_ROLE(), msg.sender)) {
            revert Unauthorized();
        }
        if (_reports[reportId].createdAt == 0) revert ReportNotFound(reportId);

        _reports[reportId].revoked = true;
        emit RiskReportRevoked(reportId, msg.sender);
    }

    /// @inheritdoc IRiskAttestationRegistry
    function getReport(bytes32 reportId) external view returns (RiskReport memory) {
        return _reports[reportId];
    }
}
