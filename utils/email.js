import path from 'path';
import { fileURLToPath } from 'url';
import htmlToText from 'html-to-text';
import nodemailer from 'nodemailer';
import pug from 'pug';

const currentDir = path.dirname(fileURLToPath(import.meta.url));

class Email {
  constructor(model) {
    this.to = model.email;
    this.name = model.name.split(' ')[0];
    this.from = `Traverse <welcome@traverse.com>`;
  }

  newTransport() {
    return nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }

  async send(template, subject, licenceNumber) {
    const html = pug.renderFile(path.join(currentDir, `../views/email/welcome.pug`), {
      name: this.name,
      licenceNumber,
      subject
    });

    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText.fromString(html)
    };
    await this.newTransport().sendMail(mailOptions);
  }

  async sendWelcome(licenceNumber) {
    await this.send('Welcome', 'Welcome to Traverse!', licenceNumber);
  }

   async sendProjectCreated(recipientEmail, projectName, url, subject) {
    console.log(url)
    const html = pug.renderFile(path.join(currentDir, `../views/email/projectCreated.pug`), {
      name: this.name,
      projectName,
      subject,
      url
    });

    const mailOptions = {
      from: this.from,
      to: recipientEmail,
      subject,
      html,
      text: htmlToText.fromString(html)
    };
    await this.newTransport().sendMail(mailOptions);
  }

  async sendUserProject(projectName, subject) {
    const html = pug.renderFile(path.join(currentDir, `../views/email/userCreatedProject.pug`), {
      name: this.name,
      projectName,
      subject
    });

    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText.fromString(html)
    };
    await this.newTransport().sendMail(mailOptions);
  }
}

export default Email;
