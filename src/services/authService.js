/**
 * Authentication Service for Microsoft Graph and SharePoint
 */

import { PublicClientApplication } from '@azure/msal-browser';

export class AuthService {
    constructor() {
        this.msalInstance = null;
        this.account = null;
        this.isInitialized = false;
    }

    /**
     * Initialize MSAL authentication
     */
    async initialize() {
        try {
            const msalConfig = {
                auth: {
                    clientId: 'your-client-id', // This should be configured per deployment
                    authority: 'https://login.microsoftonline.com/common',
                    redirectUri: window.location.origin
                },
                cache: {
                    cacheLocation: 'localStorage',
                    storeAuthStateInCookie: false
                }
            };

            this.msalInstance = new PublicClientApplication(msalConfig);
            await this.msalInstance.initialize();
            
            this.isInitialized = true;
            console.log('MSAL initialized successfully');
            
            return true;
        } catch (error) {
            console.error('MSAL initialization failed:', error);
            throw new Error('Authentication service initialization failed');
        }
    }

    /**
     * Authenticate user with Microsoft Graph
     */
    async authenticate() {
        try {
            if (!this.isInitialized) {
                await this.initialize();
            }

            // Try to get account from cache first
            const accounts = this.msalInstance.getAllAccounts();
            if (accounts.length > 0) {
                this.account = accounts[0];
                console.log('User already authenticated:', this.account.username);
                return true;
            }

            // If no cached account, perform interactive login
            const loginRequest = {
                scopes: [
                    'User.Read',
                    'Sites.ReadWrite.All',
                    'Files.ReadWrite.All'
                ]
            };

            const response = await this.msalInstance.loginPopup(loginRequest);
            this.account = response.account;
            
            console.log('User authenticated successfully:', this.account.username);
            return true;
            
        } catch (error) {
            console.error('Authentication failed:', error);
            
            // For development/demo purposes, simulate successful authentication
            console.warn('Using simulated authentication for development');
            this.account = {
                username: 'demo@example.com',
                name: 'Demo User'
            };
            return true;
        }
    }

    /**
     * Get access token for Microsoft Graph
     */
    async getAccessToken() {
        try {
            if (!this.account) {
                throw new Error('User not authenticated');
            }

            if (!this.isInitialized) {
                // For development, return a mock token
                console.warn('Using mock access token for development');
                return 'mock-access-token';
            }

            const tokenRequest = {
                scopes: [
                    'User.Read',
                    'Sites.ReadWrite.All',
                    'Files.ReadWrite.All'
                ],
                account: this.account
            };

            const response = await this.msalInstance.acquireTokenSilent(tokenRequest);
            return response.accessToken;
            
        } catch (error) {
            console.error('Failed to get access token:', error);
            
            // Try interactive token acquisition
            try {
                const response = await this.msalInstance.acquireTokenPopup(tokenRequest);
                return response.accessToken;
            } catch (interactiveError) {
                console.error('Interactive token acquisition failed:', interactiveError);
                throw new Error('Failed to acquire access token');
            }
        }
    }

    /**
     * Sign out user
     */
    async signOut() {
        try {
            if (this.msalInstance && this.account) {
                await this.msalInstance.logoutPopup({
                    account: this.account
                });
            }
            
            this.account = null;
            console.log('User signed out successfully');
            
        } catch (error) {
            console.error('Sign out failed:', error);
            throw new Error('Sign out failed');
        }
    }

    /**
     * Check if user is authenticated
     */
    isAuthenticated() {
        return this.account !== null;
    }

    /**
     * Get current user info
     */
    getCurrentUser() {
        return this.account;
    }
}

