// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {AccessManager} from "./AccessManager.sol";

/// @title PauseController
/// @notice Emergency pause for Fundryx protocol
/// @dev Pause blocks risk-increasing actions. Safe repayment always allowed.
contract PauseController {
    AccessManager public immutable accessManager;

    bool public borrowingPaused;
    bool public depositsPaused;

    error BorrowingIsPaused();
    error DepositsArePaused();
    error Unauthorized();

    event PauseStateChanged(string indexed action, bool paused, address indexed changedBy);

    constructor(address _accessManager) {
        accessManager = AccessManager(_accessManager);
    }

    modifier onlyAdminOrOperator() {
        if (
            !accessManager.hasRole(accessManager.ADMIN_ROLE(), msg.sender)
                && !accessManager.hasRole(accessManager.OPERATOR_ROLE(), msg.sender)
        ) {
            revert Unauthorized();
        }
        _;
    }

    /// @notice Pause or unpause borrowing
    function setBorrowingPaused(bool paused) external onlyAdminOrOperator {
        borrowingPaused = paused;
        emit PauseStateChanged("borrowing", paused, msg.sender);
    }

    /// @notice Pause or unpause deposits
    function setDepositsPaused(bool paused) external onlyAdminOrOperator {
        depositsPaused = paused;
        emit PauseStateChanged("deposits", paused, msg.sender);
    }

    /// @notice Revert if borrowing is paused
    function requireBorrowingNotPaused() external view {
        if (borrowingPaused) revert BorrowingIsPaused();
    }

    /// @notice Revert if deposits are paused
    function requireDepositsNotPaused() external view {
        if (depositsPaused) revert DepositsArePaused();
    }
}
