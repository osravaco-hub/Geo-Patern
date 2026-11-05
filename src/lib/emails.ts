// Email module - Simulates Resend integration
// In production, this would be server-side code in Next.js API routes

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Send email via Resend
 * In production: POST /api/email
 */
export async function sendEmail(options: EmailOptions): Promise<EmailResult> {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  // In production with Resend:
  // const res = await fetch('https://api.resend.com/emails', {
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'application/json',
  //     'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
  //   },
  //   body: JSON.stringify({
  //     from: 'GeoPattern <noreply@geopattern.app>',
  //     to: options.to,
  //     subject: options.subject,
  //     html: options.html,
  //   }),
  // });
  
  // const data = await res.json();
  // return { success: true, messageId: data.id };

  console.log(`📧 Email sent to ${options.to}: ${options.subject}`);
  return { success: true, messageId: `msg_${Date.now()}` };
}

/**
 * Send welcome email to new user
 */
export async function sendWelcomeEmail(email: string, userName?: string): Promise<EmailResult> {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Bienvenido a GeoPattern</title>
  <style>
    body { font-family: 'Inter', sans-serif; line-height: 1.6; color: #1A1A1A; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #2563EB, #8B5CF6); padding: 40px; text-align: center; border-radius: 12px 12px 0 0; }
    .header h1 { color: white; margin: 0; font-size: 32px; }
    .content { background: #FAFAFA; padding: 40px; border-radius: 0 0 12px 12px; }
    .button { display: inline-block; background: #2563EB; color: white; padding: 12px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✨ Bienvenido a GeoPattern</h1>
    </div>
    <div class="content">
      <h2>¡Hola${userName ? ` ${userName}` : ''}!</h2>
      <p>Gracias por registrarte en GeoPattern. Ahora puedes acceder a:</p>
      <ul>
        <li>8 patrones geométricos (ultra-básicos + básicos)</li>
        <li>3 descargas por semana</li>
        <li>Exportación en PNG y SVG sin marca de agua</li>
      </ul>
      <p style="text-align: center; margin: 32px 0;">
        <a href="https://geopattern.app/generator" class="button">Comenzar a crear</a>
      </p>
      <p>¿Quieres acceso ilimitado y patrones avanzados?</p>
      <p><strong>Actualiza a Premium</strong> por solo $4.99/mes y desbloquea:</p>
      <ul>
        <li>12 patrones (incluyendo Voronoi, Art Deco, Fractal Tree)</li>
        <li>Descargas ilimitadas</li>
        <li>Resolución hasta 3000px</li>
        <li>Fondo transparente</li>
      </ul>
    </div>
    <div class="footer">
      <p>© 2024 GeoPattern. Todos los derechos reservados.</p>
    </div>
  </div>
</body>
</html>
  `.trim();

  return sendEmail({
    to: email,
    subject: '¡Bienvenido a GeoPattern! ✨',
    html,
  });
}

/**
 * Send payment confirmation email
 */
export async function sendPaymentConfirmationEmail(
  email: string,
  plan: 'monthly' | 'yearly',
  amount: number
): Promise<EmailResult> {
  const planName = plan === 'monthly' ? 'Mensual' : 'Anual';
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Confirmación de Pago - GeoPattern Premium</title>
  <style>
    body { font-family: 'Inter', sans-serif; line-height: 1.6; color: #1A1A1A; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #8B5CF6, #2563EB); padding: 40px; text-align: center; border-radius: 12px 12px 0 0; }
    .header h1 { color: white; margin: 0; font-size: 32px; }
    .content { background: #FAFAFA; padding: 40px; border-radius: 0 0 12px 12px; }
    .badge { display: inline-block; background: #8B5CF6; color: white; padding: 8px 16px; border-radius: 20px; font-weight: 600; margin: 16px 0; }
    .button { display: inline-block; background: #2563EB; color: white; padding: 12px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 ¡Pago Confirmado!</h1>
    </div>
    <div class="content">
      <h2>¡Felicidades!</h2>
      <p>Tu suscripción a <span class="badge">Premium</span> está activa.</p>
      <p><strong>Detalles de la suscripción:</strong></p>
      <ul>
        <li>Plan: ${planName}</li>
        <li>Monto: $${amount.toFixed(2)}</li>
        <li>Fecha de renovación: ${new Date(Date.now() + (plan === 'monthly' ? 30 : 365) * 24 * 60 * 60 * 1000).toLocaleDateString('es-ES')}</li>
      </ul>
      <p>Ahora tienes acceso a:</p>
      <ul>
        <li>✅ 12 patrones geométricos</li>
        <li>✅ Descargas ilimitadas</li>
        <li>✅ Resolución hasta 3000px</li>
        <li>✅ Fondo transparente</li>
        <li>✅ Aleatorizar colores</li>
      </ul>
      <p style="text-align: center; margin: 32px 0;">
        <a href="https://geopattern.app/dashboard" class="button">Ir al Dashboard</a>
      </p>
      <p>Puedes gestionar tu suscripción en cualquier momento desde el dashboard.</p>
    </div>
    <div class="footer">
      <p>© 2024 GeoPattern. Todos los derechos reservados.</p>
    </div>
  </div>
</body>
</html>
  `.trim();

  return sendEmail({
    to: email,
    subject: '¡Pago confirmado! Ya eres Premium 🎉',
    html,
  });
}

/**
 * Send download reminder email (optional)
 */
export async function sendDownloadReminderEmail(
  email: string,
  downloadsRemaining: number
): Promise<EmailResult> {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Recordatorio de Descargas - GeoPattern</title>
  <style>
    body { font-family: 'Inter', sans-serif; line-height: 1.6; color: #1A1A1A; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #2563EB; padding: 40px; text-align: center; border-radius: 12px 12px 0 0; }
    .header h1 { color: white; margin: 0; font-size: 28px; }
    .content { background: #FAFAFA; padding: 40px; border-radius: 0 0 12px 12px; }
    .counter { font-size: 48px; font-weight: bold; color: #2563EB; text-align: center; margin: 20px 0; }
    .button { display: inline-block; background: #2563EB; color: white; padding: 12px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📊 Tienes descargas disponibles</h1>
    </div>
    <div class="content">
      <h2>¡No olvides usar tus descargas!</h2>
      <div class="counter">${downloadsRemaining}</div>
      <p style="text-align: center;">descargas restantes esta semana</p>
      <p>Las descargas se renuevan cada semana. Aprovecha para crear y descargar tus patrones favoritos.</p>
      <p style="text-align: center; margin: 32px 0;">
        <a href="https://geopattern.app/generator" class="button">Crear patrones</a>
      </p>
      <p><strong>¿Necesitas más descargas?</strong></p>
      <p>Actualiza a Premium y obtén descargas ilimitadas por solo $4.99/mes.</p>
    </div>
    <div class="footer">
      <p>© 2024 GeoPattern. Todos los derechos reservados.</p>
    </div>
  </div>
</body>
</html>
  `.trim();

  return sendEmail({
    to: email,
    subject: `Tienes ${downloadsRemaining} descargas disponibles esta semana`,
    html,
  });
}
