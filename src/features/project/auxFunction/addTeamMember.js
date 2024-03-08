import AppError from '../../../utils/appError.js';

const addedTeamMemberFunc = (usersData, teamMembers) => {
  const foundEmails = usersData.map((user) => user.email);
  const notFoundEmails = teamMembers.filter((email) => !foundEmails.includes(email));

  if (notFoundEmails.length > 0) {
    // Return an error immediately
    throw new AppError(
      `Sorry, the following email(s) are not linked to any account on Traverse yet: ${notFoundEmails.join(
        ', '
      )}`,
      400
    );
  }

  // If there are no errors, proceed to create the addedTeamMember array
  const addedTeamMember = usersData.map((userObj) => {
    return {
      user: userObj._id
    };
  });

  // Return the array of added team members
  return addedTeamMember;
};

export default addedTeamMemberFunc;
