// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import {FunctionsClient} from "@chainlink/contracts/src/v0.8/functions/dev/v1_0_0/FunctionsClient.sol";
import {ConfirmedOwner} from "@chainlink/contracts/src/v0.8/shared/access/ConfirmedOwner.sol";
import {FunctionsRequest} from "@chainlink/contracts/src/v0.8/functions/dev/v1_0_0/libraries/FunctionsRequest.sol";

/**
 * THIS IS AN EXAMPLE CONTRACT THAT USES HARDCODED VALUES FOR CLARITY.
 * THIS IS AN EXAMPLE CONTRACT THAT USES UN-AUDITED CODE.
 * DO NOT USE THIS CODE IN PRODUCTION.
 */
contract Migration is FunctionsClient, ConfirmedOwner {
    using FunctionsRequest for FunctionsRequest.Request;

    bytes32 public s_lastRequestId;
    uint256[] public s_decodedPrices; // Array to store multiple decoded prices
    bytes public s_lastResponse;
    bytes public s_lastError;

    // Betting state variables
    uint256 public initialPrice;
    bool public bettingActive = false;
    mapping(address => uint256) public betAmountHigher;
    mapping(address => uint256) public betAmountLower;
    uint256 public totalBetAmountHigher;
    uint256 public totalBetAmountLower;
    bool public firstPriceRecorded = false;
    uint256 public secondPrice;
    // At the contract level
    address[] public bettorsHigher;
    address[] public bettorsLower;
    uint256 public currentRound = 0;
    mapping(uint256 => BettingRound) public bettingRounds;


    error UnexpectedRequestID(bytes32 requestId);
    event Response(bytes32 indexed requestId, uint256 price, bytes err);

    // Betting events
    event BetPlaced(address indexed bettor, bool betHigher, uint256 amount);
    event WinningsDistributed(bool priceIncreased);

    struct BettingRound {
        uint256 roundId;
        address[] winners;
        uint256[] winnings;
        uint256 initialPrice;
        uint256 finalPrice;
        bool priceIncreased;
    }



    constructor(address router) FunctionsClient(router) ConfirmedOwner(msg.sender) {}

    /**
     * @notice Decodes the response bytes into a uint256 price and stores it in an array.
     * @param requestId The request ID, returned by sendRequest()
     * @param response Aggregated response from the user code
     * @param err Aggregated error from the user code or from the execution pipeline
     */
function fulfillRequest(bytes32 requestId, bytes memory response, bytes memory err) internal override {
    if (s_lastRequestId != requestId) {
        revert UnexpectedRequestID(requestId);
    }
    if (response.length > 0) {
        uint256 decodedPrice = abi.decode(response, (uint256));

        if (!firstPriceRecorded) {
            initialPrice = decodedPrice;
            firstPriceRecorded = true;
            // Now ready to accept bets
        } else {
            secondPrice = decodedPrice;
            bool priceIncreased = secondPrice > initialPrice;
            distributeWinnings(priceIncreased);
            // Reset for next round
            bettingActive = false;
            firstPriceRecorded = false;
        }
    } else if (err.length > 0) {
        emit Response(requestId, 0, err);
    }
}


    /**
     * @notice Send a simple request
     * @param source JavaScript source code
     * @param encryptedSecretsUrls Encrypted URLs where to fetch user secrets
     * @param donHostedSecretsSlotID Don hosted secrets slotId
     * @param donHostedSecretsVersion Don hosted secrets version
     * @param args List of arguments accessible from within the source code
     * @param bytesArgs Array of bytes arguments, represented as hex strings
     * @param subscriptionId Billing ID
     * @param gasLimit The maximum amount of gas for the request
     * @param donID ID of the job to be invoked
     */
    function sendRequest(
        string memory source,
        bytes memory encryptedSecretsUrls,
        uint8 donHostedSecretsSlotID,
        uint64 donHostedSecretsVersion,
        string[] memory args,
        bytes[] memory bytesArgs,
        uint64 subscriptionId,
        uint32 gasLimit,
        bytes32 donID
    ) external onlyOwner returns (bytes32 requestId) {
        FunctionsRequest.Request memory req;
        req.initializeRequestForInlineJavaScript(source);
        if (encryptedSecretsUrls.length > 0)
            req.addSecretsReference(encryptedSecretsUrls);
        else if (donHostedSecretsVersion > 0) {
            req.addDONHostedSecrets(
                donHostedSecretsSlotID,
                donHostedSecretsVersion
            );
        }
        if (args.length > 0) req.setArgs(args);
        if (bytesArgs.length > 0) req.setBytesArgs(bytesArgs);
        s_lastRequestId = _sendRequest(
            req.encodeCBOR(),
            subscriptionId,
            gasLimit,
            donID
        );
        return s_lastRequestId;
    }

    /**
     * @notice Send a pre-encoded CBOR request
     * @param request CBOR-encoded request data
     * @param subscriptionId Billing ID
     * @param gasLimit The maximum amount of gas the request can consume
     * @param donID ID of the job to be invoked
     */
    function sendRequestCBOR(
        bytes memory request,
        uint64 subscriptionId,
        uint32 gasLimit,
        bytes32 donID
    ) external onlyOwner returns (bytes32 requestId) {
        s_lastRequestId = _sendRequest(
            request,
            subscriptionId,
            gasLimit,
            donID
        );
        return s_lastRequestId;
    }

    /**
     * @notice Function to retrieve all decoded prices.
     */
    function getAllDecodedPrices() external view returns (uint256[] memory) {
        return s_decodedPrices;
    }
    // Betting functions

    function activateBetting() public onlyOwner {
        require(!bettingActive, "Betting is already active.");
        bettingActive = true;
        // Optionally initiate a price call here if you want to automate this part
    }


function placeBet(bool betHigher) public payable {
    require(bettingActive, "Betting is not active.");
    require(msg.value > 0, "Bet amount must be greater than 0.");
    require(firstPriceRecorded, "First price not recorded yet.");

    if (betHigher) {
        if (betAmountHigher[msg.sender] == 0) {
            bettorsHigher.push(msg.sender); // Record bettor for higher bet
        }
        betAmountHigher[msg.sender] += msg.value;
        totalBetAmountHigher += msg.value;
    } else {
        if (betAmountLower[msg.sender] == 0) {
            bettorsLower.push(msg.sender); // Record bettor for lower bet
        }
        betAmountLower[msg.sender] += msg.value;
        totalBetAmountLower += msg.value;
    }

    emit BetPlaced(msg.sender, betHigher, msg.value);
}

function distributeWinnings(bool priceIncreased) private {
    uint256 totalPool = totalBetAmountHigher + totalBetAmountLower;
    uint256 winnerPool = priceIncreased ? totalBetAmountHigher : totalBetAmountLower;
    address[] storage winners = priceIncreased ? bettorsHigher : bettorsLower;
    BettingRound storage round = bettingRounds[++currentRound];

    round.roundId = currentRound;
    round.initialPrice = initialPrice;
    round.finalPrice = secondPrice;
    round.priceIncreased = priceIncreased;

    if (winnerPool == 0) {
        emit WinningsDistributed(priceIncreased);
        // Proceed to reset even if there's no winner to ensure the next round can start correctly.
    } else {
        for (uint256 i = 0; i < winners.length; i++) {
            address winner = winners[i];
            uint256 betAmount = priceIncreased ? betAmountHigher[winner] : betAmountLower[winner];
            if (betAmount > 0) {
                uint256 winnerShare = (betAmount * totalPool) / winnerPool;
                (bool sent, ) = winner.call{value: winnerShare}("");
                require(sent, "Failed to send Ether");
                round.winners.push(winner);
                round.winnings.push(winnerShare);
            }
        }
    }

    // Resetting state for the next round
    for(uint i = 0; i < bettorsHigher.length; i++) {
        delete betAmountHigher[bettorsHigher[i]];
    }
    for(uint i = 0; i < bettorsLower.length; i++) {
        delete betAmountLower[bettorsLower[i]];
    }
    delete bettorsHigher;
    delete bettorsLower;
    totalBetAmountHigher = 0;
    totalBetAmountLower = 0;
    bettingActive = false;
    firstPriceRecorded = false;
    // If you want to automatically start another round, you can set bettingActive to true here
    // and make a new price call if necessary

    emit WinningsDistributed(priceIncreased);
}

        // Get details of a betting round
        function getBettingRoundDetails(uint256 _roundId) external view returns (BettingRound memory) {
            return bettingRounds[_roundId];
        }

        // Get the list of winners for a round
        function getRoundWinners(uint256 _roundId) external view returns (address[] memory) {
            return bettingRounds[_roundId].winners;
        }

        // Get the winnings for each winner of a round
        function getRoundWinnings(uint256 _roundId) external view returns (uint256[] memory) {
            return bettingRounds[_roundId].winnings;
        }


}
