export default class DatabaseError extends Error {
  constructor(e) {
    super(`Database error: ${e.toString()}`);
  }
}
