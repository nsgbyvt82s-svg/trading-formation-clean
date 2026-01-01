import nodemailer from 'nodemailer';

// Configuration du transporteur Mailtrap pour le développement
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'sandbox.smtp.mailtrap.io',
  port: parseInt(process.env.EMAIL_PORT || '2525'),
  auth: {
    user: process.env.EMAIL_USERNAME || 'votre_username_mailtrap',
    pass: process.env.EMAIL_PASSWORD || 'votre_password_mailtrap',
  },
});

export async function sendVerificationEmail(email: string, code: string) {
  const mailOptions = {
    from: '"Votre Application" <no-reply@votresite.com>',
    to: email,
    subject: 'Votre code de vérification',
    text: `Votre code de vérification est : ${code}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
        <div style="background-color: #f8f9fa; padding: 30px; border-radius: 8px; border: 1px solid #dee2e6;">
          <h2 style="color: #2c3e50; margin-top: 0; text-align: center;">Vérification d'email</h2>
          
          <p style="font-size: 16px; line-height: 1.6;">
            Bonjour,<br><br>
            Voici votre code de vérification à 6 chiffres :
          </p>
          
          <div style="background-color: #e9ecef; padding: 20px; border-radius: 8px; text-align: center; margin: 25px 0; font-size: 32px; font-weight: bold; letter-spacing: 3px; color: #2c3e50;">
            ${code}
          </div>
          
          <p style="font-size: 14px; color: #6c757d; line-height: 1.6;">
            Ce code est valable pendant <strong>15 minutes</strong>.<br>
            Ne partagez jamais ce code avec qui que ce soit.
          </p>
          
          <p style="font-size: 12px; color: #6c757d; margin-top: 30px; border-top: 1px solid #dee2e6; padding-top: 15px;">
            Si vous n'avez pas demandé ce code, veuillez ignorer cet email.
          </p>
        </div>
      </div>
    `,
  };

  try {
    console.log('Envoi de l\'email de vérification à:', email);
    console.log('Code de vérification:', code);
    
    const info = await transporter.sendMail(mailOptions);
    console.log('Email envoyé avec succès:', info.messageId);
    return true;
    
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email :', error);
    return false;
  }
}
