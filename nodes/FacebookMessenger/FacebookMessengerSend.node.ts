import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeConnectionType,
	IDataObject,
	IHttpRequestMethods,
} from 'n8n-workflow';

export class FacebookMessengerSend implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Facebook Messenger Send',
		name: 'facebookMessengerSend',
		icon: 'file:facebook.svg',
		group: ['transform'],
		version: 1,
		description: 'Send messages via Facebook Messenger',
		defaults: {
			name: 'Facebook Messenger Send',
		},
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
		credentials: [
			{
				name: 'facebookMessengerApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Send Message',
						value: 'sendMessage',
						description: 'Send a message to a recipient',
						action: 'Send a message to a recipient',
					},
					{
						name: 'Send Template',
						value: 'sendTemplate',
						description: 'Send a template message to a recipient',
						action: 'Send a template message to a recipient',
					},
					{
						name: 'Mark Seen',
						value: 'markSeen',
						description: 'Mark a message as seen',
						action: 'Mark a message as seen',
					},
					{
						name: 'Send Typing Indicator',
						value: 'sendTypingIndicator',
						description: 'Send a typing indicator',
						action: 'Send a typing indicator',
					},
				],
				default: 'sendMessage',
			},
			// Recipient ID field (common to all operations)
			{
				displayName: 'Recipient ID',
				name: 'recipientId',
				type: 'string',
				default: '',
				required: true,
				description: 'The Page-Scoped ID (PSID) or thread ID of the recipient',
			},
			// Fields for Send Message operation
			{
				displayName: 'Message Type',
				name: 'messageType',
				type: 'options',
				displayOptions: {
					show: {
						operation: ['sendMessage'],
					},
				},
				options: [
					{
						name: 'Audio',
						value: 'audio',
						description: 'Send an audio file',
					},
					{
						name: 'File',
						value: 'file',
						description: 'Send a file',
					},
					{
						name: 'Image',
						value: 'image',
						description: 'Send an image',
					},
					{
						name: 'Text',
						value: 'text',
						description: 'Send a text message',
					},
					{
						name: 'Video',
						value: 'video',
						description: 'Send a video',
					},
				],
				default: 'text',
				description: 'The type of message to send',
			},
			// Text message field
			{
				displayName: 'Message Text',
				name: 'messageText',
				type: 'string',
				typeOptions: {
					rows: 4,
				},
				displayOptions: {
					show: {
						operation: ['sendMessage'],
						messageType: ['text'],
					},
				},
				default: '',
				required: true,
				description: 'The text message to send',
			},
			// Media URL field for image, audio, video, file
			{
				displayName: 'Media URL',
				name: 'mediaUrl',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['sendMessage'],
						messageType: ['image', 'audio', 'video', 'file'],
					},
				},
				default: '',
				required: true,
				description: 'The URL of the media to send',
			},
			// Quick Replies
			{
				displayName: 'Add Quick Replies',
				name: 'addQuickReplies',
				type: 'boolean',
				displayOptions: {
					show: {
						operation: ['sendMessage'],
					},
				},
				default: false,
				description: 'Whether to add quick replies to the message',
			},
			{
				displayName: 'Quick Replies',
				name: 'quickReplies',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
					sortable: true,
				},
				displayOptions: {
					show: {
						operation: ['sendMessage'],
						addQuickReplies: [true],
					},
				},
				default: {},
				placeholder: 'Add Quick Reply',
				options: [
					{
						name: 'quickRepliesValues',
						displayName: 'Quick Reply',
						values: [
							{
								displayName: 'Content Type',
								name: 'contentType',
								type: 'options',
								options: [
									{
										name: 'Text',
										value: 'text',
									},
									{
										name: 'Phone Number',
										value: 'user_phone_number',
									},
									{
										name: 'Email',
										value: 'user_email',
									},
								],
								default: 'text',
								description: 'The type of quick reply',
							},
							{
								displayName: 'Title',
								name: 'title',
								type: 'string',
								default: '',
								description: 'The title of the quick reply',
							},
							{
								displayName: 'Payload',
								name: 'payload',
								type: 'string',
								displayOptions: {
									show: {
										contentType: ['text'],
									},
								},
								default: '',
								description: 'The payload sent back when the quick reply is tapped',
							},
							{
								displayName: 'Image URL',
								name: 'imageUrl',
								type: 'string',
								default: '',
								description: 'URL of the image to display with the quick reply',
							},
						],
					},
				],
				description: 'Quick replies to add to the message',
			},
			// Fields for Send Template operation
			{
				displayName: 'Template Type',
				name: 'templateType',
				type: 'options',
				displayOptions: {
					show: {
						operation: ['sendTemplate'],
					},
				},
				options: [
					{
						name: 'Generic',
						value: 'generic',
						description: 'Generic template with image, title, subtitle, and buttons',
					},
					{
						name: 'Button',
						value: 'button',
						description: 'Button template with text and buttons',
					},
					{
						name: 'Media',
						value: 'media',
						description: 'Media template with image or video and buttons',
					},
				],
				default: 'generic',
				description: 'The type of template to send',
			},
			// Generic Template fields
			{
				displayName: 'Elements',
				name: 'elements',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
					sortable: true,
				},
				displayOptions: {
					show: {
						operation: ['sendTemplate'],
						templateType: ['generic'],
					},
				},
				default: {},
				placeholder: 'Add Element',
				options: [
					{
						name: 'elementsValues',
						displayName: 'Element',
						values: [
							{
								displayName: 'Add Buttons',
								name: 'addButtons',
								type: 'boolean',
								default: false,
								description: 'Whether to add buttons to the element',
							},
							{
								displayName: 'Buttons',
								name: 'buttons',
								type: 'fixedCollection',
								default: {},
								placeholder: 'Add Button',
								options: [
									{
										name: 'buttonsValues',
										displayName: 'Button',
										values: [
											{
												displayName: 'Type',
												name: 'type',
												type: 'options',
												options: [
													{
														name: 'Web URL',
														value: 'web_url',
													},
													{
														name: 'Postback',
														value: 'postback',
													},
												],
												default: 'web_url',
												description: 'The type of button',
											},
											{
												displayName: 'Title',
												name: 'title',
												type: 'string',
												default: '',
												description: 'The title of the button',
											},
											{
												displayName: 'URL',
												name: 'url',
												type: 'string',
												default: '',
												description: 'The URL to open when the button is tapped',
											},
											{
												displayName: 'Payload',
												name: 'payload',
												type: 'string',
												default: '',
												description: 'The payload sent back when the button is tapped',
											},
										],
									},
								],
								description: 'Buttons to add to the element',
							},
							{
								displayName: 'Default Action URL',
								name: 'defaultActionUrl',
								type: 'string',
								default: '',
								description: 'The URL to open when the element is tapped',
							},
							{
								displayName: 'Image URL',
								name: 'imageUrl',
								type: 'string',
								default: '',
								description: 'The URL of the image',
							},
							{
								displayName: 'Subtitle',
								name: 'subtitle',
								type: 'string',
								default: '',
								description: 'The subtitle of the element',
							},
							{
								displayName: 'Title',
								name: 'title',
								type: 'string',
								default: '',
								description: 'The title of the element',
							},
						],
					},
				],
				description: 'Elements to add to the generic template',
			},
			// Button Template fields
			{
				displayName: 'Text',
				name: 'buttonTemplateText',
				type: 'string',
				typeOptions: {
					rows: 3,
				},
				displayOptions: {
					show: {
						operation: ['sendTemplate'],
						templateType: ['button'],
					},
				},
				default: '',
				required: true,
				description: 'The text of the button template',
			},
			{
				displayName: 'Buttons',
				name: 'buttonTemplateButtons',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
					sortable: true,
				},
				displayOptions: {
					show: {
						operation: ['sendTemplate'],
						templateType: ['button'],
					},
				},
				default: {},
				placeholder: 'Add Button',
				options: [
					{
						name: 'buttonsValues',
						displayName: 'Button',
						values: [
							{
								displayName: 'Type',
								name: 'type',
								type: 'options',
								options: [
									{
										name: 'Web URL',
										value: 'web_url',
									},
									{
										name: 'Postback',
										value: 'postback',
									},
								],
								default: 'web_url',
								description: 'The type of button',
							},
							{
								displayName: 'Title',
								name: 'title',
								type: 'string',
								default: '',
								description: 'The title of the button',
							},
							{
								displayName: 'URL',
								name: 'url',
								type: 'string',
								displayOptions: {
									show: {
										type: ['web_url'],
									},
								},
								default: '',
								description: 'The URL to open when the button is tapped',
							},
							{
								displayName: 'Payload',
								name: 'payload',
								type: 'string',
								displayOptions: {
									show: {
										type: ['postback'],
									},
								},
								default: '',
								description: 'The payload sent back when the button is tapped',
							},
						],
					},
				],
				description: 'Buttons to add to the button template',
			},
			// Media Template fields
			{
				displayName: 'Media Type',
				name: 'mediaType',
				type: 'options',
				displayOptions: {
					show: {
						operation: ['sendTemplate'],
						templateType: ['media'],
					},
				},
				options: [
					{
						name: 'Image',
						value: 'image',
					},
					{
						name: 'Video',
						value: 'video',
					},
				],
				default: 'image',
				description: 'The type of media',
			},
			{
				displayName: 'Media URL',
				name: 'mediaTemplateUrl',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['sendTemplate'],
						templateType: ['media'],
					},
				},
				default: '',
				required: true,
				description: 'The URL of the media',
			},
			{
				displayName: 'Add Buttons',
				name: 'mediaTemplateAddButtons',
				type: 'boolean',
				displayOptions: {
					show: {
						operation: ['sendTemplate'],
						templateType: ['media'],
					},
				},
				default: false,
				description: 'Whether to add buttons to the media template',
			},
			{
				displayName: 'Buttons',
				name: 'mediaTemplateButtons',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
					sortable: true,
				},
				displayOptions: {
					show: {
						operation: ['sendTemplate'],
						templateType: ['media'],
						mediaTemplateAddButtons: [true],
					},
				},
				default: {},
				placeholder: 'Add Button',
				options: [
					{
						name: 'buttonsValues',
						displayName: 'Button',
						values: [
							{
								displayName: 'Type',
								name: 'type',
								type: 'options',
								options: [
									{
										name: 'Web URL',
										value: 'web_url',
									},
									{
										name: 'Postback',
										value: 'postback',
									},
								],
								default: 'web_url',
								description: 'The type of button',
							},
							{
								displayName: 'Title',
								name: 'title',
								type: 'string',
								default: '',
								description: 'The title of the button',
							},
							{
								displayName: 'URL',
								name: 'url',
								type: 'string',
								displayOptions: {
									show: {
										type: ['web_url'],
									},
								},
								default: '',
								description: 'The URL to open when the button is tapped',
							},
							{
								displayName: 'Payload',
								name: 'payload',
								type: 'string',
								displayOptions: {
									show: {
										type: ['postback'],
									},
								},
								default: '',
								description: 'The payload sent back when the button is tapped',
							},
						],
					},
				],
				description: 'Buttons to add to the media template',
			},
			// Fields for Mark Seen operation
			// No additional fields needed for Mark Seen operation

			// Fields for Send Typing Indicator operation
			{
				displayName: 'Typing Indicator',
				name: 'typingIndicator',
				type: 'options',
				displayOptions: {
					show: {
						operation: ['sendTypingIndicator'],
					},
				},
				options: [
					{
						name: 'Typing On',
						value: 'typing_on',
						description: 'Turn typing indicator on',
					},
					{
						name: 'Typing Off',
						value: 'typing_off',
						description: 'Turn typing indicator off',
					},
				],
				default: 'typing_on',
				description: 'The typing indicator to send',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		// Get credentials
		const credentials = await this.getCredentials('facebookMessengerApi');
		const accessToken = credentials.accessToken as string;

		// Process each item
		for (let i = 0; i < items.length; i++) {
			try {
				// Get operation
				const operation = this.getNodeParameter('operation', i) as string;
				const recipientId = this.getNodeParameter('recipientId', i) as string;

				// Prepare base request options
				const options = {
					method: 'POST' as IHttpRequestMethods,
					url: 'https://graph.facebook.com/v17.0/me/messages',
					qs: { access_token: accessToken },
					body: {
						recipient: { id: recipientId },
					} as IDataObject,
					json: true,
				};

				// Handle different operations
				if (operation === 'sendMessage') {
					const messageType = this.getNodeParameter('messageType', i) as string;
					const addQuickReplies = this.getNodeParameter('addQuickReplies', i, false) as boolean;

					// Handle different message types
					if (messageType === 'text') {
						const messageText = this.getNodeParameter('messageText', i) as string;
						options.body.message = { text: messageText } as IDataObject;
					} else {
						const mediaUrl = this.getNodeParameter('mediaUrl', i) as string;
						options.body.message = {
							attachment: {
								type: messageType,
								payload: {
									url: mediaUrl,
									is_reusable: true,
								},
							},
						} as IDataObject;
					}

					// Add quick replies if enabled
					if (addQuickReplies) {
						const quickRepliesData = this.getNodeParameter('quickReplies', i, {
							quickRepliesValues: [],
						}) as IDataObject;
						const quickRepliesValues = (quickRepliesData.quickRepliesValues as IDataObject[]) || [];

						if (quickRepliesValues.length > 0) {
							const quickReplies = quickRepliesValues.map((quickReply) => {
								const contentType = quickReply.contentType as string;
								const title = quickReply.title as string;
								const payload = quickReply.payload as string;
								const imageUrl = quickReply.imageUrl as string;

								const quickReplyObject: IDataObject = {
									content_type: contentType,
									title,
								};

								if (contentType === 'text' && payload) {
									quickReplyObject.payload = payload;
								}

								if (imageUrl) {
									quickReplyObject.image_url = imageUrl;
								}

								return quickReplyObject;
							});

							(options.body.message as IDataObject).quick_replies = quickReplies;
						}
					}
				} else if (operation === 'sendTemplate') {
					const templateType = this.getNodeParameter('templateType', i) as string;

					// Handle different template types
					if (templateType === 'generic') {
						const elementsData = this.getNodeParameter('elements', i, {
							elementsValues: [],
						}) as IDataObject;
						const elementsValues = (elementsData.elementsValues as IDataObject[]) || [];

						if (elementsValues.length > 0) {
							const elements = elementsValues.map((element) => {
								const title = element.title as string;
								const subtitle = element.subtitle as string;
								const imageUrl = element.imageUrl as string;
								const defaultActionUrl = element.defaultActionUrl as string;
								const addButtons = element.addButtons as boolean;

								const elementObject: IDataObject = {
									title,
								};

								if (subtitle) {
									elementObject.subtitle = subtitle;
								}

								if (imageUrl) {
									elementObject.image_url = imageUrl;
								}

								if (defaultActionUrl) {
									elementObject.default_action = {
										type: 'web_url',
										url: defaultActionUrl,
										messenger_extensions: false,
										webview_height_ratio: 'tall',
									};
								}

								if (addButtons) {
									const buttonsData = (element.buttons as IDataObject) || { buttonsValues: [] };
									const buttonsValues = (buttonsData.buttonsValues as IDataObject[]) || [];

									if (buttonsValues.length > 0) {
										const buttons = buttonsValues.map((button) => {
											const type = button.type as string;
											const title = button.title as string;
											const url = button.url as string;
											const payload = button.payload as string;

											if (type === 'web_url') {
												return {
													type,
													title,
													url,
												};
											} else {
												return {
													type,
													title,
													payload,
												};
											}
										});

										elementObject.buttons = buttons;
									}
								}

								return elementObject;
							});

							options.body.message = {
								attachment: {
									type: 'template',
									payload: {
										template_type: 'generic',
										elements,
									},
								},
							} as IDataObject;
						}
					} else if (templateType === 'button') {
						const text = this.getNodeParameter('buttonTemplateText', i) as string;
						const buttonsData = this.getNodeParameter('buttonTemplateButtons', i, {
							buttonsValues: [],
						}) as IDataObject;
						const buttonsValues = (buttonsData.buttonsValues as IDataObject[]) || [];

						if (buttonsValues.length > 0) {
							const buttons = buttonsValues.map((button) => {
								const type = button.type as string;
								const title = button.title as string;
								const url = button.url as string;
								const payload = button.payload as string;

								if (type === 'web_url') {
									return {
										type,
										title,
										url,
									};
								} else {
									return {
										type,
										title,
										payload,
									};
								}
							});

							options.body.message = {
								attachment: {
									type: 'template',
									payload: {
										template_type: 'button',
										text,
										buttons,
									},
								},
							} as IDataObject;
						}
					} else if (templateType === 'media') {
						const mediaType = this.getNodeParameter('mediaType', i) as string;
						const mediaUrl = this.getNodeParameter('mediaTemplateUrl', i) as string;
						const addButtons = this.getNodeParameter(
							'mediaTemplateAddButtons',
							i,
							false,
						) as boolean;

						const mediaElement: IDataObject = {
							media_type: mediaType,
							url: mediaUrl,
						};

						if (addButtons) {
							const buttonsData = this.getNodeParameter('mediaTemplateButtons', i, {
								buttonsValues: [],
							}) as IDataObject;
							const buttonsValues = (buttonsData.buttonsValues as IDataObject[]) || [];

							if (buttonsValues.length > 0) {
								const buttons = buttonsValues.map((button) => {
									const type = button.type as string;
									const title = button.title as string;
									const url = button.url as string;
									const payload = button.payload as string;

									if (type === 'web_url') {
										return {
											type,
											title,
											url,
										};
									} else {
										return {
											type,
											title,
											payload,
										};
									}
								});

								mediaElement.buttons = buttons;
							}
						}

						options.body.message = {
							attachment: {
								type: 'template',
								payload: {
									template_type: 'media',
									elements: [mediaElement],
								},
							},
						} as IDataObject;
					}
				} else if (operation === 'markSeen') {
					options.body.sender_action = 'mark_seen';
				} else if (operation === 'sendTypingIndicator') {
					const typingIndicator = this.getNodeParameter('typingIndicator', i) as string;
					options.body.sender_action = typingIndicator;
				}

				// Make the API request
				const response = await this.helpers.request(options);

				// Add the response to the returned data
				returnData.push({
					json: response as IDataObject,
					pairedItem: { item: i },
				});
			} catch (error) {
				// Handle errors
				if (this.continueOnFail()) {
					returnData.push({
						json: {
							error: error.message,
						},
						pairedItem: { item: i },
					});
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}
