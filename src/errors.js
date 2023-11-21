export class AuthNotValid extends Error {
  constructor(message, errors) {
    const newMessage = `${message}:\n${errors
      .map((error) => error)
      .join('\n')}`;
    super(newMessage);
  }
}

export class DatabaseError extends Error {
  constructor(e) {
    super(`Database error: ${e.toString()}`);
  }
}
