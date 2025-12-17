#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import type { Model, List, SearchResult, User } from './types.js';

const API_BASE_URL = 'https://api.poly.pizza/v1.1';

class PolyPizzaServer {
  private server: Server;
  private authToken: string | undefined;

  constructor() {
    this.server = new Server(
      {
        name: 'polypizza-mcp',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.authToken = process.env.POLYPIZZA_AUTH_TOKEN;

    if (!this.authToken) {
      throw new Error('POLYPIZZA_AUTH_TOKEN environment variable is required but not set');
    }

    this.setupHandlers();
    this.setupErrorHandling();
  }

  private setupErrorHandling(): void {
    this.server.onerror = (error) => {
      console.error('[MCP Error]', error);
    };

    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  private async apiRequest(endpoint: string): Promise<any> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.authToken) {
      headers['x-auth-token'] = this.authToken;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, { headers });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  private setupHandlers(): void {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'get_model',
          description: 'Retrieve a single 3D model by its ID',
          inputSchema: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
                description: 'The unique identifier of the model',
              },
            },
            required: ['id'],
          },
        },
        {
          name: 'get_list',
          description: 'Fetch all models within a curated collection/list by its ID',
          inputSchema: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
                description: 'The unique identifier of the list',
              },
            },
            required: ['id'],
          },
        },
        {
          name: 'search_models',
          description: 'Search for 3D models using filters (category, license, animated status). At least one filter is required.',
          inputSchema: {
            type: 'object',
            properties: {
              category: {
                type: 'string',
                description: 'Filter by category (0-11): 0=Food & Drink, 1=Clutter, 2=Weapons, 3=Transport, 4=Furniture & Decor, 5=Objects, 6=Nature, 7=Animals, 8=Buildings/Architecture, 9=People & Characters, 10=Scenes & Levels, 11=Other',
              },
              license: {
                type: 'string',
                description: 'Filter by license (e.g., CC0, CC-BY, CC-BY-SA)',
              },
              animated: {
                type: 'boolean',
                description: 'Filter by animation status',
              },
              limit: {
                type: 'number',
                description: 'Maximum number of results (max 32)',
                maximum: 32,
              },
              page: {
                type: 'number',
                description: 'Page number for pagination',
              },
            },
          },
        },
        {
          name: 'search_models_by_keyword',
          description: 'Search for 3D models by keyword with optional filters',
          inputSchema: {
            type: 'object',
            properties: {
              keyword: {
                type: 'string',
                description: 'Search keyword (will be URL-encoded)',
              },
              category: {
                type: 'string',
                description: 'Filter by category (0-11): 0=Food & Drink, 1=Clutter, 2=Weapons, 3=Transport, 4=Furniture & Decor, 5=Objects, 6=Nature, 7=Animals, 8=Buildings/Architecture, 9=People & Characters, 10=Scenes & Levels, 11=Other',
              },
              license: {
                type: 'string',
                description: 'Filter by license (e.g., CC0, CC-BY, CC-BY-SA)',
              },
              animated: {
                type: 'boolean',
                description: 'Filter by animation status',
              },
              limit: {
                type: 'number',
                description: 'Maximum number of results (max 32)',
                maximum: 32,
              },
              page: {
                type: 'number',
                description: 'Page number for pagination',
              },
            },
            required: ['keyword'],
          },
        },
        {
          name: 'get_user',
          description: 'Retrieve all models and lists created by a specific user',
          inputSchema: {
            type: 'object',
            properties: {
              username: {
                type: 'string',
                description: 'The username to look up',
              },
              limit: {
                type: 'number',
                description: 'Maximum number of results',
              },
              page: {
                type: 'number',
                description: 'Page number for pagination',
              },
            },
            required: ['username'],
          },
        },
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      try {
        const { name, arguments: args } = request.params;

        switch (name) {
          case 'get_model': {
            const { id } = args as { id: string };
            const model: Model = await this.apiRequest(`/model/${id}`);
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(model, null, 2),
                },
              ],
            };
          }

          case 'get_list': {
            const { id } = args as { id: string };
            const list: List = await this.apiRequest(`/list/${id}`);
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(list, null, 2),
                },
              ],
            };
          }

          case 'search_models': {
            const { category, license, animated, limit, page } = args as {
              category?: string;
              license?: string;
              animated?: boolean;
              limit?: number;
              page?: number;
            };

            const params = new URLSearchParams();
            if (category) params.append('category', category);
            if (license) params.append('license', license);
            if (animated !== undefined) params.append('animated', String(animated));
            if (limit) params.append('limit', String(limit));
            if (page) params.append('page', String(page));

            const queryString = params.toString();
            const result: SearchResult = await this.apiRequest(
              `/search${queryString ? `?${queryString}` : ''}`
            );

            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(result, null, 2),
                },
              ],
            };
          }

          case 'search_models_by_keyword': {
            const { keyword, category, license, animated, limit, page } = args as {
              keyword: string;
              category?: string;
              license?: string;
              animated?: boolean;
              limit?: number;
              page?: number;
            };

            const encodedKeyword = encodeURIComponent(keyword);
            const params = new URLSearchParams();
            if (category) params.append('category', category);
            if (license) params.append('license', license);
            if (animated !== undefined) params.append('animated', String(animated));
            if (limit) params.append('limit', String(limit));
            if (page) params.append('page', String(page));

            const queryString = params.toString();
            const result: SearchResult = await this.apiRequest(
              `/search/${encodedKeyword}${queryString ? `?${queryString}` : ''}`
            );

            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(result, null, 2),
                },
              ],
            };
          }

          case 'get_user': {
            const { username, limit, page } = args as {
              username: string;
              limit?: number;
              page?: number;
            };

            const params = new URLSearchParams();
            if (limit) params.append('limit', String(limit));
            if (page) params.append('page', String(page));

            const queryString = params.toString();
            const user: User = await this.apiRequest(
              `/user/${username}${queryString ? `?${queryString}` : ''}`
            );

            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(user, null, 2),
                },
              ],
            };
          }

          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${errorMessage}`,
            },
          ],
          isError: true,
        };
      }
    });
  }

  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Poly Pizza MCP Server running on stdio');
  }
}

const server = new PolyPizzaServer();
server.run().catch(console.error);
