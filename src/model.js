class Auth {
  /**
   * Constructor
   * @param {Object} db
   * @param {AuthAttributes} attributes
   */
  constructor(db, attributes) {
    this.db = db;
    const { email, password } = attributes;
    this.email = email;
    this.password = password;
  }

  /**
   * Find Auth by Id
   * @param {UUID} id
   */
  static async findById(db, id) {
    const { email, password } = await db.result(
      "SELECT * FROM auth WHERE id=$1 LIMIT 1",
      [id]
    );
    return new Auth(db, { email, password });
  }

  /**
   * Find Auth object according to its email
   * @param {Object} db
   * @param {String} email
   * @returns Auth
   */
  static async findByEmail(db, email) {
    const { password } = await db.result(
      "SELECT * FROM auth WHERE email=$1 LIMIT 1",
      [email]
    );
    return new Auth(db, { email, password });
  }

  /**
   * TODO: implement function
   * @returns Boolean
   */
  hasValidPassword() {
    return !!this.password;
  }

  /**
   * TODO: implement function
   * @returns Boolean
   */
  hasValidEmail() {
    return !!this.email;
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
   * TODO: handle duplicate key value error
   * TODO: handle auth not valid
   */
  async save() {
    if (!this.isValid()) throw new Error("Auth not valid");

    await this.db.none(
      "INSERT INTO auth(email, password) VALUES(${email}, ${password})",
      {
        email: this.email,
        password: this.password,
      }
    );
  }
}

module.exports = Auth;
