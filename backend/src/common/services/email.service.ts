import nodemailer from 'nodemailer';
import { env } from '../../config/env';
import { logger } from '../../config/logger';

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_SECURE,
      auth: env.SMTP_USER ? {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      } : undefined,
    });
  }

  async sendEmail(to: string, subject: string, html: string) {
    try {
      const info = await this.transporter.sendMail({
        from: env.SMTP_FROM,
        to,
        subject,
        html,
      });
      logger.info(`Email sent: ${info.messageId}`);
      return info;
    } catch (error) {
      logger.error('Failed to send email:', error);
      throw error;
    }
  }

  // Helper templates
  async sendApplicationReceived(email: string, candidateName: string, jobTitle: string) {
    const subject = `Postulación recibida: ${jobTitle}`;
    const html = `
      <h1>Hola ${candidateName},</h1>
      <p>Hemos recibido tu postulación para la vacante de <strong>${jobTitle}</strong>.</p>
      <p>Nuestro equipo de RRHH revisará tu perfil y se pondrá en contacto contigo pronto.</p>
      <br>
      <p>Atentamente,<br>Equipo de Reclutamiento - ABA Talent</p>
    `;
    return this.sendEmail(email, subject, html);
  }

  async sendInterviewInvitation(email: string, candidateName: string, jobTitle: string, scheduledAt: Date) {
    const subject = `Invitación a entrevista: ${jobTitle}`;
    const dateStr = scheduledAt.toLocaleString();
    const html = `
      <h1>Hola ${candidateName},</h1>
      <p>Nos gustaría invitarte a una entrevista para la vacante de <strong>${jobTitle}</strong>.</p>
      <p><strong>Fecha y hora:</strong> ${dateStr}</p>
      <p>Pronto recibirás un enlace para la reunión o detalles de la ubicación.</p>
      <br>
      <p>Atentamente,<br>Equipo de Reclutamiento - ABA Talent</p>
    `;
    return this.sendEmail(email, subject, html);
  }

  async sendOfferExtended(email: string, candidateName: string, jobTitle: string) {
    const subject = `Oferta laboral: ${jobTitle}`;
    const html = `
      <h1>¡Felicidades ${candidateName}!</h1>
      <p>Nos complace extenderte una oferta laboral para la posición de <strong>${jobTitle}</strong>.</p>
      <p>Por favor revisa tu portal de candidato o ponte en contacto con nosotros para discutir los detalles.</p>
      <br>
      <p>Atentamente,<br>Equipo de Reclutamiento - ABA Talent</p>
    `;
    return this.sendEmail(email, subject, html);
  }

  async sendRejection(email: string, candidateName: string, jobTitle: string) {
    const subject = `Actualización de tu postulación: ${jobTitle}`;
    const html = `
      <h1>Hola ${candidateName},</h1>
      <p>Gracias por tu interés en la vacante de <strong>${jobTitle}</strong>.</p>
      <p>En esta ocasión hemos decidido no avanzar con tu candidatura. Sin embargo, mantendremos tu perfil en nuestra base de datos para futuras oportunidades.</p>
      <br>
      <p>Atentamente,<br>Equipo de Reclutamiento - ABA Talent</p>
    `;
    return this.sendEmail(email, subject, html);
  }
}

export const emailService = new EmailService();
