# Poly Pizza MCP Server

An MCP (Model Context Protocol) server for the Poly Pizza 3D model API, providing seamless access to thousands of free 3D models.

## Features

This MCP server exposes the following tools:

- **get_model** - Retrieve a single 3D model by ID
- **get_list** - Fetch all models in a curated collection
- **search_models** - Search models using filters (category, license, animated status)
- **search_models_by_keyword** - Search models by keyword with optional filters
- **get_user** - Get all models and lists created by a specific user

## Installation

```bash
npm install
npm run build
```

## Configuration

Add this server to your MCP client configuration. Environment variables must be configured directly in your MCP settings.

### Claude Desktop

Edit your Claude Desktop configuration file:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`

**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "polypizza": {
      "command": "node",
      "args": ["/absolute/path/to/polypizza-mcp/dist/index.js"],
      "env": {
        "POLYPIZZA_AUTH_TOKEN": "your_actual_token_here"
      }
    }
  }
}
```

**Important**: Replace `/absolute/path/to/polypizza-mcp` with the actual path to this repository, and replace `your_actual_token_here` with your Poly Pizza API token. The `POLYPIZZA_AUTH_TOKEN` is required and the server will not start without it.

### Other MCP Clients

For other MCP clients, configure the environment variable `POLYPIZZA_AUTH_TOKEN` according to your client's documentation. The server requires this environment variable to be set at runtime.

## Usage Examples

Once configured, you can interact with the Poly Pizza API through Claude:

### Get a specific model
```
"Show me the details for model with ID abc123"
```

### Search for models
```
"Find animated 3D models of animals"
"Search for CC0 licensed furniture models"
```

### Browse collections
```
"Show me the models in list xyz789"
```

### Find user content
```
"Get all models created by username johndoe"
```

## API Categories

- 0: Food & Drink
- 1: Clutter
- 2: Weapons
- 3: Transport
- 4: Furniture & Decor
- 5: Objects
- 6: Nature
- 7: Animals
- 8: Buildings/Architecture
- 9: People & Characters
- 10: Scenes & Levels
- 11: Other

## License Types

- CC0
- CC-BY
- CC-BY-SA
- CC-BY-ND
- CC-BY-NC
- CC-BY-NC-SA
- CC-BY-NC-ND

## Development

```bash
# Watch mode for development
npm run watch

# Build
npm run build
```

## API Reference

This server implements the Poly Pizza API v1.1 specification. For more details, visit [https://poly.pizza](https://poly.pizza).

## License

MIT
