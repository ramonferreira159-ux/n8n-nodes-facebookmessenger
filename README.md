# n8n-nodes-facebookmessenger

This is an n8n community node for Facebook Messenger. It provides nodes to interact with the Facebook Messenger platform, allowing you to automate your Facebook Messenger interactions.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

[Installation](#installation)
[Operations](#operations)
[Credentials](#credentials)
[Compatibility](#compatibility)
[Resources](#resources)

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

### Quick Installation

1. Go to **Settings > Community Nodes**
2. Select **Install**
3. Enter `n8n-nodes-facebookmessenger` in **Enter npm package name**
4. Agree to the risks of using community nodes: select **I understand the risks of installing unverified code from a third party**
5. Select **Install**

## Operations

### Facebook Messenger Trigger

The Facebook Messenger Trigger node allows you to trigger workflows when events occur in Facebook Messenger.

**Events:**

- Messages
- Message Deliveries
- Message Reads
- Messaging Postbacks
- Messaging Optins
- Message Echoes

### Facebook Messenger Send

The Facebook Messenger Send node allows you to send messages and perform actions in Facebook Messenger.

**Operations:**

- Send Message (Text, Image, Audio, Video, File)
- Send Template (Generic, Button, Media)
- Mark Seen
- Send Typing Indicator

## Credentials

To use the Facebook Messenger nodes, you need to create a Facebook App and configure it for Messenger. You'll need:

1. A Facebook Page
2. A Facebook App with Messenger permissions
3. A Page Access Token

## Compatibility

This node has been tested with n8n version 0.214.0 and later.

## Resources

- [n8n community nodes documentation](https://docs.n8n.io/integrations/community-nodes/)
- [Facebook Messenger Platform documentation](https://developers.facebook.com/docs/messenger-platform)

## License

[MIT](https://github.com/ItsMeStevieG/n8n-nodes-facebookmessenger/blob/main/LICENSE.md)
