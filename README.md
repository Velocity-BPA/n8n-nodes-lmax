# n8n-nodes-lmax

> [Velocity BPA Licensing Notice]
>
> This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
>
> Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.
>
> For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.

A comprehensive n8n community node for LMAX Group trading platform integration, providing 10 resources and 50+ operations for institutional FX, CFD, and cryptocurrency trading automation.

![n8n version](https://img.shields.io/badge/n8n-%3E%3D1.0.0-blue)
![Node version](https://img.shields.io/badge/node-%3E%3D18.0.0-green)
![License](https://img.shields.io/badge/license-BSL--1.1-blue)

## Features

- **Session Management**: Login, logout, heartbeat, and session validation
- **Account Operations**: Balance checking, margin monitoring, account subscriptions
- **Instrument Search**: Search and filter trading instruments by name or asset class
- **Order Management**: Place limit, market, and stop orders with full lifecycle control
- **Position Tracking**: Monitor and manage open positions with real-time updates
- **Market Data**: Order book subscriptions and top-of-book pricing
- **Historical Data**: OHLCV data retrieval with minute and daily resolution
- **Execution History**: Track trade fills and execution details
- **Rejection Handling**: Monitor instruction rejections and error handling
- **Event Streaming**: Long-poll based real-time event subscriptions via trigger node

## Installation

### Community Nodes (Recommended)

1. Open n8n
2. Go to **Settings** > **Community Nodes**
3. Click **Install a community node**
4. Enter `n8n-nodes-lmax`
5. Click **Install**

### Manual Installation

```bash
# Navigate to your n8n installation directory
cd ~/.n8n

# Install the package
npm install n8n-nodes-lmax
```

### Development Installation

```bash
# Clone the repository
git clone https://github.com/Velocity-BPA/n8n-nodes-lmax.git
cd n8n-nodes-lmax

# Install dependencies
npm install

# Build the project
npm run build

# Link to n8n custom nodes
mkdir -p ~/.n8n/custom
ln -s $(pwd) ~/.n8n/custom/n8n-nodes-lmax
```

## Credentials Setup

| Field | Type | Description |
|-------|------|-------------|
| Username | String | Your LMAX account username |
| Password | String | Your LMAX account password |
| Environment | Options | `demo` for testapi.lmaxtrader.com, `live` for trade.lmaxtrader.com |
| Product Type | Options | `CFD_DEMO`, `CFD_LIVE`, `CRYPTO_DEMO`, or `CRYPTO_LIVE` |

## Resources & Operations

### Session
- **Login**: Authenticate and establish a new session
- **Logout**: Terminate the current session
- **Heartbeat**: Keep session alive
- **Get Version**: Get API version information
- **Validate Session**: Check if current session is valid

### Account
- **Get State**: Retrieve current account state and balances
- **Subscribe/Unsubscribe**: Manage account state update subscriptions
- **Get Wallet Details**: Get cryptocurrency wallet information
- **Get Account Details**: Get detailed account information
- **Get Trading Resources**: Get available trading resources and margin

### Instruments
- **Search**: Search for instruments by name or criteria
- **Get by ID**: Get instrument details by ID (e.g., 4001 for EUR/USD)
- **Get All**: List all available instruments
- **Get by Asset Class**: Filter by CURRENCY, COMMODITY, INDEX, or CRYPTO
- **Subscribe/Unsubscribe**: Manage instrument update subscriptions

### Orders
- **Place Limit Order**: Place a limit order with price and time-in-force options
- **Place Market Order**: Place a market order (IOC/FOK only)
- **Place Stop Order**: Place a stop order with trigger price
- **Cancel Order**: Cancel an existing order
- **Amend Order**: Modify order quantity or price
- **Amend Stops**: Modify stop-loss and take-profit levels
- **Get Working Orders**: List all active orders
- **Get Order by ID**: Get details of a specific order
- **Close Position**: Close a position with a closing order

### Positions
- **Get All**: Get all open positions
- **Get by Instrument**: Get position for a specific instrument
- **Subscribe/Unsubscribe**: Manage position update subscriptions
- **Close All**: Close all positions for an instrument
- **Close Partial**: Partially close a position

### Market Data
- **Subscribe Order Book**: Subscribe to order book updates
- **Unsubscribe Order Book**: Unsubscribe from order book updates
- **Get Top of Book**: Get current best bid/ask
- **Get Order Book Depth**: Get full order book depth (1-10 levels)
- **Get Last Trade**: Get last trade information

### Historical Data
- **Get Top of Book History**: Get historical tick data
- **Get Aggregate History**: Get OHLCV data with MINUTE or DAY resolution
- **Get Trade History**: Get historical trade data
- **Download Historical Data**: Download historical data as CSV

### Executions
- **Get All**: Get all executions for the account
- **Get by Order**: Get executions for a specific order
- **Get by Date Range**: Get executions within a date range
- **Subscribe/Unsubscribe**: Manage execution update subscriptions

### Rejections
- **Get All**: Get all instruction rejections
- **Get by Instruction**: Get rejection for a specific instruction
- **Subscribe/Unsubscribe**: Manage rejection event subscriptions

### Events
- **Poll**: Poll for new events from the event stream
- **Subscribe/Unsubscribe**: Manage event type subscriptions
- **Acknowledge**: Acknowledge receipt of events

## Trigger Node

The LMAX Trigger node enables real-time event streaming via long-polling. Configure it to listen for specific event types:

- **Order Book Events**: Price changes and market data updates
- **Execution Events**: Trade fills
- **Order Events**: Order status changes
- **Position Events**: Position updates
- **Account State Events**: Balance and margin updates
- **Instruction Rejected Events**: Order rejection notifications

## Usage Examples

### Place a Limit Order

```javascript
// Place a buy limit order for EUR/USD
{
  "resource": "orders",
  "operation": "placeLimitOrder",
  "instrumentId": 4001,
  "quantity": 10000,
  "price": 1.0850,
  "timeInForce": "GTC"
}
```

### Get Account Balance

```javascript
// Get current account state
{
  "resource": "account",
  "operation": "getState"
}
```

### Search Instruments

```javascript
// Search for EUR pairs
{
  "resource": "instruments",
  "operation": "search",
  "query": "EUR"
}
```

## LMAX Trading Concepts

### Instrument IDs
Common LMAX instrument IDs:
- 4001: EUR/USD
- 4002: GBP/USD
- 4003: USD/JPY
- 4004: USD/CHF
- 4005: EUR/GBP
- 4009: AUD/USD
- 4013: USD/CAD

### Order Quantity Convention
- Positive quantity = Buy
- Negative quantity = Sell
- Quantities are in contracts (1 contract = 10,000 notional for FX)

### Time in Force Options
- **IOC**: Immediate or Cancel - fill immediately, cancel unfilled portion
- **FOK**: Fill or Kill - fill entire order or cancel
- **GTC**: Good Till Cancel - remain active until filled or cancelled
- **GFD**: Good For Day - cancel at end of trading day

## Error Handling

The node handles common LMAX errors:
- `INVALID_CREDENTIALS`: Invalid username or password
- `SESSION_EXPIRED`: Session has timed out (auto-retry enabled)
- `INSTRUMENT_DOES_NOT_EXIST`: Unknown instrument ID
- `PRICE_NOT_VALID`: Invalid price precision or out of range
- `QUANTITY_NOT_VALID`: Invalid quantity below minimum
- `EXPOSURE_CHECK_FAILURE`: Insufficient margin
- `THROTTLE_LIMIT_EXCEEDED`: Too many requests

## Security Best Practices

1. **Use Demo Environment First**: Test all workflows in demo environment before production
2. **Secure Credentials**: Store credentials securely using n8n's credential system
3. **Monitor Sessions**: Implement heartbeat to maintain session validity
4. **Validate Orders**: Always validate order parameters before submission
5. **Handle Rejections**: Implement proper rejection handling in workflows

## Development

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Run linting
npm run lint

# Fix linting issues
npm run lint:fix

# Run tests
npm test

# Watch mode for development
npm run dev
```

## Author

**Velocity BPA**
- Website: [velobpa.com](https://velobpa.com)
- GitHub: [Velocity-BPA](https://github.com/Velocity-BPA)

## Licensing

This n8n community node is licensed under the **Business Source License 1.1**.

### Free Use
Permitted for personal, educational, research, and internal business use.

### Commercial Use
Use of this node within any SaaS, PaaS, hosted platform, managed service, or paid automation offering requires a commercial license.

For licensing inquiries:
**licensing@velobpa.com**

See [LICENSE](LICENSE), [COMMERCIAL_LICENSE.md](COMMERCIAL_LICENSE.md), and [LICENSING_FAQ.md](LICENSING_FAQ.md) for details.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Support

- **Documentation**: [LMAX API Documentation](https://www.lmax.com/api)
- **Issues**: [GitHub Issues](https://github.com/Velocity-BPA/n8n-nodes-lmax/issues)
- **Email**: support@velobpa.com

## Acknowledgments

- [LMAX Group](https://www.lmax.com/) for providing the trading platform API
- [n8n](https://n8n.io/) for the workflow automation platform
- [Velocity BPA](https://velobpa.com/) for developing and maintaining this integration
