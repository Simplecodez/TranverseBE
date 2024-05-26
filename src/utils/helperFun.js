import crypto from 'crypto';
import otpGenerator from 'otp-generator';
import Project from '../models/projectModel.js';
import Email from './email.js';
// import AppError from './appError';

const licenceNumberGenerator = () => {
  const licence = otpGenerator.generate(6, {
    digits: true,
    upperCaseAlphabets: false,
    lowerCaseAlphabets: false,
    specialChars: false
  });
  const hashedLicence = crypto.createHash('sha256').update(licence).digest('hex');

  return { licence, hashedLicence };
};

const emailingPromise = async (url, foundEmails, notFoundEmails, project, action) => {
  try {
    if (foundEmails.length > 0 || notFoundEmails.length > 0) {
      const totalPromise = [];
      if (foundEmails.length > 0) {
        const emailPromise = foundEmails.map((email) => {
          return new Email(project).sendProjectCreated(email, project.title, url, 'Invitation for Collaboration.');
        });
        totalPromise.push(...emailPromise);
      }

      if (notFoundEmails.length > 0) {
        const emailPromise = notFoundEmails.map((email) => {
          return new Email(project).sendProjectCreatedEmailNotFound(
            email,
            project.title,
            url,
            'Invitation to Traverse and Project Collaboration.'
          );
        });
        totalPromise.push(...emailPromise);
      }

      const userProjectPromise = new Email(project).sendUserProject(
        `You have successfully ${action === 'create' ? 'created and ' : ''} sent invite for ${project.title} project.`,
        'Invites success!'
      );

      totalPromise.push(userProjectPromise);

      await Promise.all(totalPromise);
      return;
    }

    if (foundEmails.length <= 0 && notFoundEmails <= 0 && action === 'create') {
      await new Email(project).sendUserProject(`You have successfully created ${project.title} project.`, '');
      return;
    }
  } catch (err) {
    if (action === 'create') await Project.deleteOne({ _id: project._id });
    throw err;
  }
};

export { licenceNumberGenerator, emailingPromise };
