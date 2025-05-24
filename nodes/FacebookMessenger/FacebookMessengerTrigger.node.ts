import {
	IWebhookFunctions,
	INodeType,
	INodeTypeDescription,
	IWebhookResponseData,
	IDataObject,
	NodeConnectionType,
	INodeExecutionData,
} from 'n8n-workflow';

export class FacebookMessengerTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Facebook Messenger Trigger',
		name: 'facebookMessengerTrigger',
		icon: 'file:facebook.svg',
		group: ['trigger'],
		version: 1,
		description: 'Trigger for incoming Facebook Messenger messages',
		defaults: {
			name: 'Facebook Messenger Trigger',
		},
		inputs: [],
		outputs: [NodeConnectionType.Main],
		credentials: [
			{
				name: 'facebookMessengerApi',
				required: true,
			},
		],
		webhooks: [
			{
				name: 'default',
				httpMethod: 'POST',
				responseMode: 'onReceived',
				path: 'webhook',
			},
			{
				name: 'setup',
				httpMethod: 'GET',
				responseMode: 'onReceived',
				path: 'webhook',
			},
		],
		properties: [
			{
				displayName: 'Verify Token',
				name: 'verifyToken',
				type: 'string',
				typeOptions: { password: true },
				default: '',
				required: true,
				description: 'The token used to verify the webhook with Facebook',
			},
			{
				displayName: 'Event Types',
				name: 'eventTypes',
				type: 'multiOptions',
				options: [
					{
						name: 'Message Deliveries',
						value: 'message_deliveries',
						description: 'Receive delivery confirmations',
					},
					{
						name: 'Message Echoes',
						value: 'message_echoes',
						description: 'Receive echo messages sent by your page',
					},
					{
						name: 'Message Reads',
						value: 'message_reads',
						description: 'Receive read receipts',
					},
					{
						name: 'Messages',
						value: 'messages',
						description: 'Receive messages sent by users',
					},
					{
						name: 'Messaging Optins',
						value: 'messaging_optins',
						description: 'Receive opt-in events',
					},
					{
						name: 'Messaging Postbacks',
						value: 'messaging_postbacks',
						description: 'Receive postback events',
					},
				],
				default: ['messages'],
				required: true,
				description: 'The events to listen for',
			},
			{
				displayName: 'Include Raw Data',
				name: 'includeRawData',
				type: 'boolean',
				default: false,
				description: 'Whether to include the raw webhook data in the output',
			},
		],
	};

	async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
		const req = this.getRequestObject();
		const res = this.getResponseObject();
		const webhookName = this.getWebhookName();

		if (webhookName === 'setup') {
			// Handle the webhook verification request
			const mode = req.query['hub.mode'] as string;
			const token = req.query['hub.verify_token'] as string;
			const challenge = req.query['hub.challenge'] as string;
			const verifyToken = this.getNodeParameter('verifyToken') as string;

			if (mode === 'subscribe' && token === verifyToken) {
				res.status(200).send(challenge);
				return {
					noWebhookResponse: true,
				};
			} else {
				res.status(403).send('Verification failed');
				return {
					noWebhookResponse: true,
				};
			}
		} else if (webhookName === 'default') {
			// Handle the incoming message
			const body = this.getBodyData() as IDataObject;
			const includeRawData = this.getNodeParameter('includeRawData', false) as boolean;
			const eventTypes = this.getNodeParameter('eventTypes', ['messages']) as string[];

			// Check if this is a valid message event
			if (!body.object || body.object !== 'page') {
				res.status(400).send('Invalid request');
				return {
					noWebhookResponse: true,
				};
			}

			try {
				// Type assertion to handle the entry array
				const entries = body.entry as IDataObject[];
				if (!entries || !entries.length) {
					res.status(400).send('No entries found');
					return {
						noWebhookResponse: true,
					};
				}

				// Acknowledge the webhook immediately
				res.status(200).send('EVENT_RECEIVED');

				// Process each entry and messaging event
				const executionData: INodeExecutionData[] = [];

				for (const entry of entries) {
					const messaging = (entry.messaging as IDataObject[]) || [];

					for (const messagingEvent of messaging) {
						// Determine the event type
						let eventType = 'unknown';

						if (messagingEvent.message && !(messagingEvent.message as IDataObject).is_echo) {
							eventType = 'messages';
						} else if (messagingEvent.delivery) {
							eventType = 'message_deliveries';
						} else if (messagingEvent.read) {
							eventType = 'message_reads';
						} else if (messagingEvent.postback) {
							eventType = 'messaging_postbacks';
						} else if (messagingEvent.optin) {
							eventType = 'messaging_optins';
						} else if (messagingEvent.message && (messagingEvent.message as IDataObject).is_echo) {
							eventType = 'message_echoes';
						}

						// Skip if the event type is not in the selected event types
						if (!eventTypes.includes(eventType)) {
							continue;
						}

						// Extract common data
						const sender = (messagingEvent.sender as IDataObject) || {};
						const recipient = (messagingEvent.recipient as IDataObject) || {};
						const timestamp = (messagingEvent.timestamp as number) || Date.now();

						// Create the base output
						const output: IDataObject = {
							eventType,
							senderId: sender.id,
							recipientId: recipient.id,
							timestamp,
							pageId: entry.id,
						};

						// Add event-specific data
						if (eventType === 'messages') {
							const message = (messagingEvent.message as IDataObject) || {};
							output.messageId = message.mid;
							output.text = message.text || '';

							// Handle attachments if present
							if (message.attachments) {
								const attachments = (message.attachments as IDataObject[]) || [];
								output.attachments = attachments.map((attachment) => {
									const type = attachment.type as string;
									const payload = (attachment.payload as IDataObject) || {};

									if (type === 'image' || type === 'video' || type === 'audio' || type === 'file') {
										return {
											type,
											url: payload.url,
										};
									} else if (type === 'location') {
										const coordinates = (payload.coordinates as IDataObject) || {};
										return {
											type,
											coordinates: {
												lat: coordinates.lat,
												long: coordinates.long,
											},
										};
									} else {
										return {
											type,
											payload,
										};
									}
								});
							}

							// Handle quick reply if present
							if (message.quick_reply) {
								output.quickReply = message.quick_reply;
							}
						} else if (eventType === 'message_deliveries') {
							const delivery = (messagingEvent.delivery as IDataObject) || {};
							output.mids = delivery.mids || [];
							output.watermark = delivery.watermark;
						} else if (eventType === 'message_reads') {
							const read = (messagingEvent.read as IDataObject) || {};
							output.watermark = read.watermark;
						} else if (eventType === 'messaging_postbacks') {
							const postback = (messagingEvent.postback as IDataObject) || {};
							output.payload = postback.payload;
							output.title = postback.title;

							// Handle referral if present
							if (postback.referral) {
								output.referral = postback.referral;
							}
						} else if (eventType === 'messaging_optins') {
							const optin = (messagingEvent.optin as IDataObject) || {};
							output.ref = optin.ref;
							output.userRef = optin.user_ref;
						} else if (eventType === 'message_echoes') {
							const message = (messagingEvent.message as IDataObject) || {};
							output.messageId = message.mid;
							output.appId = message.app_id;
							output.metadata = message.metadata;

							// Handle attachments if present
							if (message.attachments) {
								const attachments = (message.attachments as IDataObject[]) || [];
								output.attachments = attachments.map((attachment) => {
									return {
										type: attachment.type,
										payload: attachment.payload,
									};
								});
							}
						}

						// Include raw data if requested
						if (includeRawData) {
							output.rawData = messagingEvent;
						}

						executionData.push({
							json: output,
						});
					}
				}

				// If no events were processed, return an empty array
				if (executionData.length === 0) {
					return {
						workflowData: [[]],
					};
				}

				return {
					workflowData: [executionData],
				};
			} catch (error) {
				// Handle any errors in processing the message
				this.logger.error('Error processing message:', error);

				const executionData: INodeExecutionData[] = [
					{
						json: {
							error: 'Error processing message',
							message: (error as Error).message,
							body: includeRawData ? body : undefined,
						},
					},
				];

				return {
					workflowData: [executionData],
				};
			}
		}

		// Default response for unhandled webhook events
		res.status(200).send('Unhandled webhook event');
		return {
			noWebhookResponse: true,
		};
	}
}
