 

export async function POST() {
  // Process the webhook payload
  return new Response(JSON.stringify({ message: 'Webhook received' }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json'
    }
  });
}