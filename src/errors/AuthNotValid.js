export default class AuthNotValid extends Error {
  constructor(message, errors) {
    const newMessage = `${message}:\n${errors
      .map((error) => error)
      .join('\n')}`;
    super(newMessage);
  }
}
