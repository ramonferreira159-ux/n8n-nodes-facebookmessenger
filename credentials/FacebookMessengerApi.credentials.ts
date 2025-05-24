import {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class FacebookMessengerApi implements ICredentialType {
	name = 'facebookMessengerApi';
	displayName = 'Facebook Messenger API';
	documentationUrl = 'https://developers.facebook.com/docs/messenger-platform';
	properties: INodeProperties[] = [
		{
			displayName: 'Page Access Token',
			name: 'accessToken',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
			description: 'The Page Access Token for your Facebook Page',
		},
	];

	// Configure how the authentication data should be sent with the request
	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			qs: {
				access_token: '={{$credentials.accessToken}}',
			},
		},
	};

	// Test the credentials by making a request to the Facebook Graph API
	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://graph.facebook.com',
			url: '/v17.0/me',
			method: 'GET',
		},
	};
}