import { WhatsAppClient } from 'whatsapp-cloud';

let client: WhatsAppClient | null = null;

export function getWhatsAppClient(): WhatsAppClient {
  if (!client) {
    client = new WhatsAppClient({
      accessToken: process.env.WHATSAPP_ACCESS_TOKEN!,
      phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
      businessAccountId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID,
    });
  }
  return client;
}
