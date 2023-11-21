import DatabaseError from './errors/DatabaseError.js';
import AuthNotValid from './errors/AuthNotValid.js';

class Auth {
  /**
   * Constructor
   * @param {Object} db
   * @param {AuthAttributes} attributes
   */
  constructor(db, attributes) {
    this.db = db;
    const { id, email, password } = attributes;
    this.email = email;
    this.password = password;
    this.errors = [];
    this.id = id;
  }

  /**
   * Find Auth by Id
   * @param {UUID} id
   * @returns Auth | null
   */
  static async findById(db, id) {
    try {
      const row = await db.oneOrNone('SELECT * FROM auth WHERE id=$1 LIMIT 1', [
        id,
      ]);
      if (!row) return null;
      const { email, password } = row;
      return new Auth(db, { id, email, password });
    } catch (e) {
      throw new DatabaseError(e);
    }
  }

  /**
   * Find Auth object according to its email
   * @param {Object} db
   * @param {String} email
   * @returns Auth | null
   */
  static async findByEmail(db, email) {
    try {
      const row = await db.oneOrNone(
        'SELECT * FROM auth WHERE email=$1 LIMIT 1',
        [email],
      );
      if (!row) return null;
      const { id, password } = row;
      return new Auth(db, { id, email, password });
    } catch (e) {
      throw new DatabaseError(e);
    }
  }

  /**
   * Retrieves all accounts
   * @param {Object} db
   * @returns Array<Auth>
   */
  static async findAll(db) {
    try {
      const rows = await db.manyOrNone('SELECT * FROM auth');
      return rows.map(
        ({ id, email, password }) => new Auth(db, { id, email, password }),
      );
    } catch (e) {
      throw new DatabaseError(e);
    }
  }

  /**
   * TODO: implement password rules
   * @returns Boolean
   */
  hasValidPassword() {
    if (!this.password) this.errors.push('Password is required');
    return this.errors.length === 0;
  }

  /**
   * TODO: implement email rules
   * @returns Boolean
   */
  hasValidEmail() {
    if (!this.email) this.errors.push('Email is required');
    return this.errors.length === 0;
  }

  /**
   * Check if auth object valid
   * @returns Boolean
   */
  async isValid() {
    return this.hasValidEmail() && this.hasValidPassword();
  }

  /**
   * Saves the auth object
   */
  async save() {
    if (!this.isValid()) throw new AuthNotValid('Auth not valid', this.errors);

    try {
      await this.db.result('INSERT INTO auth(email, password) VALUES($1, $2)', [
        this.email,
        this.password,
      ]);
    } catch (e) {
      throw new DatabaseError(e);
    }
  }
}

export default Auth;
