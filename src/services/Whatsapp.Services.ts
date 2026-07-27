// /**
//  * whatsappService.js
//  *
//  * Core service for sending WhatsApp template messages via Meta's Cloud API.
//  * Use this for logistics-style alerts: "delivery has arrived", "rider is on the way", etc.
//  *
//  * Docs: https://developers.facebook.com/docs/whatsapp/cloud-api
//  */

// require('dotenv').config();
// const axios = require('axios');

// const {
//     WHATSAPP_ACCESS_TOKEN,
//     WHATSAPP_PHONE_NUMBER_ID,
// } = process.env;

// const GRAPH_API_VERSION = 'v21.0';
// const BASE_URL = `https://graph.facebook.com/${GRAPH_API_VERSION}/${WHATSAPP_PHONE_NUMBER_ID}/messages`;

// const client = axios.create({
//     baseURL: BASE_URL,
//     headers: {
//         Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
//         'Content-Type': 'application/json',
//     },
// });

// /**
//  * Send a pre-approved template message.
//  *
//  * @param {string} to - Recipient's WhatsApp number in international format, no "+" (e.g. "2348012345678")
//  * @param {string} templateName - Name of the approved template (e.g. "delivery_status_update")
//  * @param {string} languageCode - Template language code (e.g. "en_US")
//  * @param {Array<string>} bodyParams - Values to fill the template's {{1}}, {{2}}... placeholders, in order
//  * @returns {Promise<object>} API response data
//  */
// async function sendTemplateMessage(to, templateName, languageCode = 'en_US', bodyParams = []) {
//     const payload = {
//         messaging_product: 'whatsapp',
//         to,
//         type: 'template',
//         template: {
//             name: templateName,
//             language: { code: languageCode },
//             components: bodyParams.length
//                 ? [
//                     {
//                         type: 'body',
//                         parameters: bodyParams.map((text) => ({ type: 'text', text: String(text) })),
//                     },
//                 ]
//                 : [],
//         },
//     };

//     try {
//         const response = await client.post('', payload);
//         return response.data;
//     } catch (err) {
//         const details = err.response?.data || err.message;
//         console.error('WhatsApp send failed:', JSON.stringify(details, null, 2));
//         throw new Error(`WhatsApp API error: ${JSON.stringify(details)}`);
//     }
// }

// /**
//  * Send a free-form text message.
//  * Only works if the recipient messaged you within the last 24 hours
//  * (i.e. an open customer service window). Otherwise Meta will reject it —
//  * use sendTemplateMessage() instead.
//  *
//  * @param {string} to - Recipient's WhatsApp number, no "+"
//  * @param {string} text - Message body
//  */
// async function sendFreeformText(to, text) {
//     const payload = {
//         messaging_product: 'whatsapp',
//         to,
//         type: 'text',
//         text: { body: text },
//     };

//     try {
//         const response = await client.post('', payload);
//         return response.data;
//     } catch (err) {
//         const details = err.response?.data || err.message;
//         console.error('WhatsApp send failed:', JSON.stringify(details, null, 2));
//         throw new Error(`WhatsApp API error: ${JSON.stringify(details)}`);
//     }
// }

// // --- Convenience wrappers for your specific logistics alerts ---
// // These assume you've created and had these templates approved in
// // WhatsApp Manager > Message Templates. Adjust names/params to match
// // whatever you actually register.

// async function sendRiderEnRouteAlert(to, orderId, riderName, eta) {
//     return sendTemplateMessage(to, 'rider_en_route', 'en_US', [orderId, riderName, eta]);
// }

// async function sendDeliveryArrivedAlert(to, orderId) {
//     return sendTemplateMessage(to, 'delivery_arrived', 'en_US', [orderId]);
// }

// module.exports = {
//     sendTemplateMessage,
//     sendFreeformText,
//     sendRiderEnRouteAlert,
//     sendDeliveryArrivedAlert,
// };