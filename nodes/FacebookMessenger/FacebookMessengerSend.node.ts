import { IExecuteFunctions } from 'n8n-workflow';
import type { INodeExecutionData, INodeType, INodeTypeDescription } from 'n8n-workflow';

export class FacebookMessengerSend implements INodeType {
    description: INodeTypeDescription = {
        displayName: 'Facebook Messenger Send',
        name: 'facebookMessengerSend',
        icon: 'file:facebook.svg',
        group: ['transform'],
        version: 5,
        description: 'Send messages via Facebook Messenger (inclui Generic Button Template: card com imagem/titulo/subtitulo + botoes obrigatorios e selecao de message tag)',
        defaults: { name: 'Facebook Messenger Send' },
        inputs: ['main'],
        outputs: ['main'],
        credentials: [
            { name: 'facebookMessengerApi', required: true }
        ],
        properties: [
            {
                displayName: 'Operation',
                name: 'operation',
                type: 'options',
                options: [
                    { name: 'Send Message', value: 'sendMessage', description: 'Enviar mensagem simples' },
                    { name: 'Generic Button Template', value: 'genericButton', description: 'Card com imagem, titulo, subtitulo e botoes obrigatorios' },
                    { name: 'Button Template', value: 'button', description: 'Apenas texto e botoes' },
                    { name: 'Mark Seen', value: 'markSeen', description: 'Marcar como visto' },
                    { name: 'Send Typing Indicator', value: 'sendTypingIndicator', description: 'Mostrar digitando' },
                ],
                default: 'sendMessage',
            },
            {
                displayName: 'Recipient ID',
                name: 'recipientId',
                type: 'string',
                default: '',
                required: true,
                description: 'ID do destinatario',
            },
            {
                displayName: 'Message Tag (24h ou outra)',
                name: 'messageTag',
                type: 'options',
                options: [
                    { name: 'Standard Messaging (24h)', value: 'STANDARD', description: 'Mensagem dentro da janela de 24 horas' },
                    { name: 'ACCOUNT_UPDATE', value: 'ACCOUNT_UPDATE', description: 'Notifica update em conta do usuario' },
                    { name: 'CONFIRMED_EVENT_UPDATE', value: 'CONFIRMED_EVENT_UPDATE', description: 'Confirmacao de evento' },
                    { name: 'POST_PURCHASE_UPDATE', value: 'POST_PURCHASE_UPDATE', description: 'Atualizacao pos-compra' },
                    { name: 'HUMAN_AGENT', value: 'HUMAN_AGENT', description: 'Interacao humana (beta)' },
                    { name: 'PAIRING_UPDATE', value: 'PAIRING_UPDATE', description: 'Atualizacao de emparelhamento' },
                    { name: 'APPLICATION_UPDATE', value: 'APPLICATION_UPDATE', description: 'Atualizacao de app' },
                    { name: 'FEATURE_FUNCTIONALITY_UPDATE', value: 'FEATURE_FUNCTIONALITY_UPDATE', description: 'Atualizacao de funcionalidade' },
                    { name: 'GAME_EVENT', value: 'GAME_EVENT', description: 'Atualizacao de jogos' },
                    { name: 'ISSUE_RESOLUTION', value: 'ISSUE_RESOLUTION', description: 'Resolucao de problemas' },
                    { name: 'PAYMENT_UPDATE', value: 'PAYMENT_UPDATE', description: 'Atualizacao de pagamento' },
                    { name: 'RESERVATION_UPDATE', value: 'RESERVATION_UPDATE', description: 'Atualizacao de reserva' },
                    { name: 'SHIPPING_UPDATE', value: 'SHIPPING_UPDATE', description: 'Atualizacao de envio' },
                    { name: 'TICKET_UPDATE', value: 'TICKET_UPDATE', description: 'Atualizacao de ticket' },
                ],
                default: 'STANDARD',
                required: true,
                description: 'Selecione o tipo de mensagem/tag de envio',
            },
            {
                displayName: 'Message Type',
                name: 'messageType',
                type: 'options',
                displayOptions: { show: { operation: ['sendMessage'] }},
                options: [
                    { name: 'Audio', value: 'audio' },
                    { name: 'File', value: 'file' },
                    { name: 'Image', value: 'image' },
                    { name: 'Text', value: 'text' },
                    { name: 'Video', value: 'video' },
                ],
                default: 'text',
            },
            {
                displayName: 'Message Text',
                name: 'messageText',
                type: 'string',
                typeOptions: { rows: 4 },
                displayOptions: { show: { operation: ['sendMessage'], messageType: ['text'] }},
                default: '',
                required: true,
            },
            {
                displayName: 'Media URL',
                name: 'mediaUrl',
                type: 'string',
                displayOptions: { show: { operation: ['sendMessage'], messageType: ['image', 'audio', 'video', 'file'] }},
                default: '',
                required: true,
            },
            {
                displayName: 'Title',
                name: 'gbTitle',
                type: 'string',
                displayOptions: { show: { operation: ['genericButton'] }},
                default: '',
                required: true,
                description: 'Titulo do card (max 80 caracteres)',
            },
            {
                displayName: 'Subtitle',
                name: 'gbSubtitle',
                type: 'string',
                displayOptions: { show: { operation: ['genericButton'] }},
                default: '',
                description: 'Subtitulo do card (max 80 caracteres)',
            },
            {
                displayName: 'Image URL',
                name: 'gbImageUrl',
                type: 'string',
                displayOptions: { show: { operation: ['genericButton'] }},
                default: '',
                description: 'URL da imagem quadrada do card',
            },
            {
                displayName: 'Default Action URL',
                name: 'gbDefaultActionUrl',
                type: 'string',
                displayOptions: { show: { operation: ['genericButton'] }},
                default: '',
                description: 'URL aberta ao clicar no card (opcional)',
            },
            {
                displayName: 'Buttons',
                name: 'gbButtons',
                type: 'fixedCollection',
                typeOptions: { multipleValues: true, sortable: true },
                displayOptions: { show: { operation: ['genericButton'] }},
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
                                    { name: 'Web URL', value: 'web_url' },
                                    { name: 'Postback', value: 'postback' },
                                ],
                                default: 'web_url',
                            },
                            {
                                displayName: 'Title',
                                name: 'title',
                                type: 'string',
                                default: '',
                            },
                            {
                                displayName: 'URL',
                                name: 'url',
                                type: 'string',
                                displayOptions: { show: { type: ['web_url'] }},
                                default: '',
                            },
                            {
                                displayName: 'Payload',
                                name: 'payload',
                                type: 'string',
                                displayOptions: { show: { type: ['postback'] }},
                                default: '',
                            },
                        ],
                    },
                ],
                required: true,
                description: 'Botoes do card (1 a 3, igual ao button template)',
            },
            {
                displayName: 'Text',
                name: 'buttonTemplateText',
                type: 'string',
                typeOptions: { rows: 3 },
                displayOptions: { show: { operation: ['button'] }},
                default: '',
                required: true,
            },
            {
                displayName: 'Buttons',
                name: 'buttonTemplateButtons',
                type: 'fixedCollection',
                typeOptions: { multipleValues: true, sortable: true },
                displayOptions: { show: { operation: ['button'] }},
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
                                    { name: 'Web URL', value: 'web_url' },
                                    { name: 'Postback', value: 'postback' },
                                ],
                                default: 'web_url',
                            },
                            {
                                displayName: 'Title',
                                name: 'title',
                                type: 'string',
                                default: '',
                            },
                            {
                                displayName: 'URL',
                                name: 'url',
                                type: 'string',
                                displayOptions: { show: { type: ['web_url'] }},
                                default: '',
                            },
                            {
                                displayName: 'Payload',
                                name: 'payload',
                                type: 'string',
                                displayOptions: { show: { type: ['postback'] }},
                                default: '',
                            },
                        ],
                    },
                ],
                required: true,
                description: 'Botoes do template',
            },
            {
                displayName: 'Typing Indicator',
                name: 'typingIndicator',
                type: 'options',
                displayOptions: { show: { operation: ['sendTypingIndicator'] }},
                options: [
                    { name: 'Typing On', value: 'typing_on' },
                    { name: 'Typing Off', value: 'typing_off' },
                ],
                default: 'typing_on',
            },
        ],
    };

    async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
        const items = this.getInputData();
        const returnData: INodeExecutionData[] = [];
        const credentials = await this.getCredentials('facebookMessengerApi');
        const accessToken = credentials.accessToken as string;

        function clean(obj: any): any {
            if (Array.isArray(obj)) {
                return obj.map(clean).filter(x => !(x == null || (typeof x === 'object' && Object.keys(x).length === 0)));
            }
            if (typeof obj === 'object' && obj !== null) {
                const result: any = {};
                for (const k in obj) {
                    const v = clean(obj[k]);
                    if (
                        v !== undefined &&
                        v !== null &&
                        !(typeof v === 'string' && v.trim() === '') &&
                        !(Array.isArray(v) && v.length === 0) &&
                        !(typeof v === 'object' && Object.keys(v).length === 0)
                    ) {
                        result[k] = v;
                    }
                }
                return result;
            }
            return obj;
        }

        function buildButtons(buttonsArr: any[]): any[] {
            if (!Array.isArray(buttonsArr) || buttonsArr.length === 0) return [];
            return buttonsArr.map(b => {
                if (!b || !b.type || !b.title) return null;
                if (b.type === 'web_url') {
                    if (!b.url) return null;
                    return { type: 'web_url', title: b.title, url: b.url };
                }
                if (b.type === 'postback') {
                    if (!b.payload) return null;
                    return { type: 'postback', title: b.title, payload: b.payload };
                }
                return null;
            }).filter(Boolean) as any[];
        }

        for (let i = 0; i < items.length; i++) {
            try {
                const op = this.getNodeParameter('operation', i) as string;
                const recipientId = this.getNodeParameter('recipientId', i) as string;
                const messageTag = this.getNodeParameter('messageTag', i) as string;

                let body: any = { recipient: { id: recipientId } };

                if (op === 'sendMessage') {
                    const msgType = this.getNodeParameter('messageType', i) as string;
                    if (msgType === 'text') {
                        body.message = { text: this.getNodeParameter('messageText', i) };
                    } else {
                        body.message = {
                            attachment: {
                                type: msgType,
                                payload: {
                                    url: this.getNodeParameter('mediaUrl', i),
                                    is_reusable: true
                                }
                            }
                        };
                    }
                }

                if (op === 'genericButton') {
                    const title = this.getNodeParameter('gbTitle', i) as string;
                    const subtitle = this.getNodeParameter('gbSubtitle', i, '') as string;
                    const image_url = this.getNodeParameter('gbImageUrl', i, '') as string;
                    const defaultActionUrl = this.getNodeParameter('gbDefaultActionUrl', i, '') as string;
                    const buttonsRaw = this.getNodeParameter('gbButtons', i, { buttonsValues: [] }) as any;
                    const buttons = buildButtons(buttonsRaw.buttonsValues || []);
                    if (buttons.length === 0) {
                        throw new Error('No button provided for genericButton template. At least 1 button is required.');
                    }
                    const element: any = { title, buttons };
                    if (subtitle) element.subtitle = subtitle;
                    if (image_url) element.image_url = image_url;
                    if (defaultActionUrl) {
                        element.default_action = {
                            type: 'web_url',
                            url: defaultActionUrl,
                            messenger_extensions: false,
                            webview_height_ratio: 'full'
                        };
                    }
                    body.message = {
                        attachment: {
                            type: 'template',
                            payload: {
                                template_type: 'generic',
                                image_aspect_ratio: 'square',
                                elements: [element]
                            }
                        }
                    };
                }

                if (op === 'button') {
                    const text = this.getNodeParameter('buttonTemplateText', i) as string;
                    const btnsRaw = this.getNodeParameter('buttonTemplateButtons', i, { buttonsValues: [] }) as any;
                    const buttons = buildButtons(btnsRaw.buttonsValues || []);
                    if (buttons.length === 0) {
                        throw new Error('No button provided for button template. At least 1 button is required.');
                    }
                    body.message = {
                        attachment: {
                            type: 'template',
                            payload: {
                                template_type: 'button',
                                text,
                                buttons
                            }
                        }
                    };
                }

                if (op === 'markSeen') {
                    body.sender_action = 'mark_seen';
                }
                if (op === 'sendTypingIndicator') {
                    body.sender_action = this.getNodeParameter('typingIndicator', i) as string;
                }

                if (messageTag && messageTag !== 'STANDARD') {
                    body.tag = messageTag;
                    body.notification_type = 'REGULAR';
                }

                body = clean(body);
                console.log('[n8n-facebook-messenger] Payload:', JSON.stringify(body, null, 2));

                const options = {
                    method: 'POST',
                    url: 'https://graph.facebook.com/v17.0/me/messages',
                    qs: { access_token: accessToken },
                    body,
                    json: true,
                };

                // @ts-expect-error: helpers.request is injected by n8n runtime
                const response = await this.helpers.request!(options);
                returnData.push({ json: response, pairedItem: { item: i } });
            } catch (err: any) {
                if (this.continueOnFail?.()) {
                    returnData.push({ json: { error: err.message }, pairedItem: { item: i } });
                    continue;
                }
                throw err;
            }
        }
        return [returnData];
    }
}
