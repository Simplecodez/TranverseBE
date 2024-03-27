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

  async setOptionsAndSend(...args) {
    const html = pug.renderFile(
      path.join(currentDir, `../views/email/${args[2]}.pug`),
      args[1]
    );
    const mailOptions = {
      from: this.from,
      to: args[3] ? args[3] : this.to,
      subject: args[0],
      html,
      text: htmlToText.fromString(html)
    };

    await this.newTransport().sendMail(mailOptions);
  }

  async send(...args) {
    const pubObject = {
      name: this.name,
      licenceNumber: args[2],
      subject: args[1]
    };
    await this.setOptionsAndSend(args[1], pubObject, args[0]);
  }

  async sendWelcome(licenceNumber) {
    await this.send('welcome', 'Welcome to Traverse!', licenceNumber);
  }

  async sendRequest() {
    await this.send('requestMessage', 'Demo Request');
  }

  async sendUserProject(message, subject) {
    const pubObject = {
      name: this.name,
      message
    };
    await this.setOptionsAndSend(subject, pubObject, 'userCreatedProject');
  }

  async sendResetToken(resetURL) {
    const pubObject = {
      resetURL
    };
    await this.setOptionsAndSend(subject, pubObject, 'resetToken');
  }

  async sendProjectCreated(recipientEmail, projectName, url, subject) {
    const pubObject = {
      name: this.name,
      projectName,
      subject,
      url
    };

    await this.setOptionsAndSend(subject, pubObject, 'projectCreated', recipientEmail);
  }

  async sendAssignedTask(taskTitle, projectName, url) {
    const pubObject = {
      name: this.name,
      projectName,
      subject: 'Assigned task',
      url,
      taskTitle
    };

    await this.setOptionsAndSend('Assigned task', pubObject, 'assignedTask');
  }

  async sendDeclineProject(message, subject) {
    const pubObject = {
      name: this.name,
      message
    };
    await this.setOptionsAndSend(subject, pubObject, 'userCreatedProject');
  }
}

export default Email;
