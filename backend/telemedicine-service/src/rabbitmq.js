const amqp = require('amqplib');

const QUEUE = 'appointment.approved';

/**
 * @param {(data: object) => Promise<void>} handler - called for every message
 */
async function startConsumer(handler) {
  const url = process.env.RABBITMQ_URL || 'amqp://localhost:5672';
  try {
    const conn = await amqp.connect(url);
    const channel = await conn.createChannel();
    await channel.assertQueue(QUEUE, { durable: true });
    channel.prefetch(1);

    console.log('[RabbitMQ] Telemedicine service listening on queue:', QUEUE);

    channel.consume(QUEUE, async (msg) => {
      if (!msg) return;
      try {
        const data = JSON.parse(msg.content.toString());
        await handler(data);
        channel.ack(msg);
      } catch (err) {
        console.error('[RabbitMQ] Error handling message:', err.message);
        channel.nack(msg, false, false); // discard bad messages
      }
    });

    conn.on('close', () => {
      console.warn('[RabbitMQ] Connection closed. Reconnecting in 5s…');
      setTimeout(() => startConsumer(handler), 5000);
    });

    conn.on('error', (err) => {
      console.error('[RabbitMQ] Connection error:', err.message);
    });
  } catch (err) {
    console.warn('[RabbitMQ] Could not connect:', err.message, '— retrying in 5s');
    setTimeout(() => startConsumer(handler), 5000);
  }
}

module.exports = { startConsumer };
