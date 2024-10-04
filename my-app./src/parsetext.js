function extractBettingInfo(text) {
    // Regex patterns to match different sentence structures.
    const pattern1 = /Account (\d+) bets(?: (\d+(\.\d+)?) ETH)? that the price of ETH will (go up|go down|increase|decrease)/g;
    const pattern2 = /Account (\d+) bets (\d+(\.\d+)?) ETH that the price of ETH will (go up|go down|increase|decrease)/g;
    const eachBetsPattern = /Each bets (\d+(\.\d+)?) ETH/g;
  
    let bets = [];
    let eachBetsMatch = eachBetsPattern.exec(text);
    let defaultAmount = eachBetsMatch ? eachBetsMatch[1] : "0.1"; // Default amount if specified by "Each bets X ETH"
  
    // Function to add or update bet information
    const addOrUpdateBet = (account, amount, direction) => {
      const index = bets.findIndex(bet => bet.account === account);
      if (index > -1) {
        bets[index].amount = amount || bets[index].amount;
        bets[index].direction = direction;
      } else {
        bets.push({ account, amount: amount || defaultAmount, direction });
      }
    };
  
    let matches;
    while ((matches = pattern1.exec(text)) !== null) {
      const account = `Account ${matches[1]}`;
      const amount = matches[2] || defaultAmount;
      const direction = matches[4].includes("increase") || matches[4].includes("up") ? "up" : "down";
      addOrUpdateBet(account, amount, direction);
    }
  
    while ((matches = pattern2.exec(text)) !== null) {
      const account = `Account ${matches[1]}`;
      const amount = matches[2]; // Amount is always specified in this pattern
      const direction = matches[4].includes("increase") || matches[4].includes("up") ? "up" : "down";
      addOrUpdateBet(account, amount, direction);
    }
  
    return bets;
  }
  
  // Example usage:
  const texts = [
    "Account 1 bets that the price of ETH will go up. Account 2 bets that the price of ETH will go down. Each bets 0.1 ETH. The winner of the ETH gets the contract.",
    "Account 1 bets 0.1 ETH that the price of ETH will decrease. Account 2 bets 0.1 ETH that the price of ETH will increase. The winner of the ETH gets the contract."
  ];
  
  texts.forEach(text => console.log(extractBettingInfo(text)));
  