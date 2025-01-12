interface WalletBalance {
    currency: string;
    amount: number;
    blockchain: string;
  }
  
  interface FormattedWalletBalance {
    currency: string;
    amount: number;
    formatted: string;
    usdValue: number;
  }
  
  const WalletPage: React.FC<Props> = (props: Props) => {
    const { children, ...rest } = props;
    const balances = useWalletBalances();
    const prices = usePrices();
  
    // Hardcoded blockchain priority could be externalized for scalability
    const blockchainPriorities: Record<string, number> = {
      Osmosis: 100,
      Ethereum: 50,
      Arbitrum: 30,
      Zilliqa: 20,
      Neo: 20
    };
  
    const getPriority = (blockchain: string): number => blockchainPriorities[blockchain] ?? -99;
  
    const formattedBalances = useMemo(() => {
      return balances
        .filter((balance: WalletBalance) => balance.amount > 0 && getPriority(balance.blockchain) > -99)
        .map((balance: WalletBalance) => {
          const formatted = balance.amount.toFixed(2);  // Ensure precision handling
          const usdValue = prices[balance.currency] * balance.amount;
          return { ...balance, formatted, usdValue };
        })
        .sort((lhs: WalletBalance, rhs: WalletBalance) => getPriority(rhs.blockchain) - getPriority(lhs.blockchain));
    }, [balances, prices]);
  
    const rows = formattedBalances.map((balance: FormattedWalletBalance) => (
      <WalletRow
        className={classes.row}
        key={balance.currency} // Using a unique identifier
        amount={balance.amount}
        usdValue={balance.usdValue}
        formattedAmount={balance.formatted}
      />
    ));
  
    return (
      <div {...rest}>
        {rows}
      </div>
    );
};


// 1. USEMEMO 
// Issue: Sorting is computationally expensive, especially if it is repeated unnecessarily.
// Improvement: Only sort when balances change, not when prices change unless required.


// 2. FILTER,MAP,SORT problem 
// Issue: Multiple passes over the data unnecessarily increase the computational load.
// Improvement: Combine filtering, sorting, and formatting into a single loop to reduce redundancy.

// 3. Using INDEX wrongly
// Issue: The key for the WalletRow component is set to index, which can lead to unstable rendering during updates.
// Improvement: Use a unique and stable identifier, such as balance.currency or balance.blockchain, as the key.

// 4.HARDCODED
// Issue: Hardcoding values makes it difficult to maintain and extend as new blockchains are added.
// Improvement: Store the blockchain priorities in a configuration file or external data structure, making it easier to modify and update without changing the code.

// 5.ToFixed ISSUE
// Issue: Rounding errors can introduce inaccuracies in financial applications.
// Improvement: Use a proper formatting library like Intl.NumberFormat or BigDecimal to handle precision and rounding issues correctly.


