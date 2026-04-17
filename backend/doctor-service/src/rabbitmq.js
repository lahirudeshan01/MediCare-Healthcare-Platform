const amqp = require('amqplib');

const QUEUE = 'appointment.approved';
let channel = null;

async function connectRabbitMQ() {
  const url = process.env.RABBITMQ_URL || 'amqp://localhost:5672';
  try {
    const conn = await amqp.connect(url);
    channel = await conn.createChannel();
    await channel.assertQueue(QUEUE, { durable: true });
    console.log('[RabbitMQ] Doctor service connected — queue:', QUEUE);

    conn.on('close', () => {
      console.warn('[RabbitMQ] Connection closed. Reconnecting in 5s…');
      channel = null;
      setTimeout(connectRabbitMQ, 5000);
    });

    conn.on('error', (err) => {
      console.error('[RabbitMQ] Connection error:', err.message);
    });
  } catch (err) {
    console.warn('[RabbitMQ] Could not connect:', err.message, '— retrying in 5s');
    setTimeout(connectRabbitMQ, 5000);
  }
}

function publishAppointmentApproved(data) {
  if (!channel) {
    console.warn('[RabbitMQ] Channel not ready. Skipping publish for appointment:', data.appointmentId);
    return;
  }
  channel.sendToQueue(QUEUE, Buffer.from(JSON.stringify(data)), { persistent: true });
  console.log('[RabbitMQ] Published appointment.approved for appointmentId:', data.appointmentId);
}

module.exports = { connectRabbitMQ, publishAppointmentApproved };
