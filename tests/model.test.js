const { jest, expect, it, describe, beforeEach } = require('@jest/globals');
const Auth = require('../src/model');

const mockedDb = { oneOrNone: jest.fn(), result: jest.fn() };

describe('hasValidPassword', () => {
  it('should return true', () => {
    const authWithGoodPassword = new Auth(mockedDb, {
      email: 'test@email.com',
      password: 'password',
    });
    expect(authWithGoodPassword.hasValidPassword()).toBeTruthy();
  });

  it('should return false', () => {
    const authWithoutPassword = new Auth(mockedDb, { email: 'test@email.com' });
    const authWithNullPassword = new Auth(
      {},
      { email: 'test@email.com', password: null },
    );
    expect(authWithoutPassword.hasValidPassword()).toBeFalsy();
    expect(authWithNullPassword.hasValidPassword()).toBeFalsy();
  });
});

describe('hasValidEmail', () => {
  it('should return true', () => {
    const authWithGoodEmail = new Auth(mockedDb, {
      email: 'test@email.com',
      password: 'password',
    });
    expect(authWithGoodEmail.hasValidEmail()).toBeTruthy();
  });

  it('should return false', () => {
    const authWithoutEmail = new Auth(mockedDb, {
      password: 'password',
    });
    const authWithNullEmail = new Auth(mockedDb, {
      email: null,
      password: 'password',
    });
    expect(authWithoutEmail.hasValidEmail()).toBeFalsy();
    expect(authWithNullEmail.hasValidEmail()).toBeFalsy();
  });
});

describe('isValid', () => {
  const auth = new Auth(mockedDb, {
    email: 'test@email.com',
    password: 'password',
  });
  const mockedHasValidEmail = jest.spyOn(auth, 'hasValidEmail');
  const mockedHasValidPassword = jest.spyOn(auth, 'hasValidPassword');

  it('should return true', async () => {
    mockedHasValidEmail.mockReturnValueOnce(true);
    mockedHasValidPassword.mockReturnValueOnce(true);
    expect(await auth.isValid()).toBeTruthy();
  });

  it('should return false when email is not valid', async () => {
    mockedHasValidEmail.mockReturnValueOnce(false);
    expect(await auth.isValid()).toBeFalsy();
  });

  it('should return false when password is not valid', async () => {
    mockedHasValidEmail.mockReturnValueOnce(true);
    mockedHasValidPassword.mockReturnValueOnce(false);
    expect(await auth.isValid()).toBeFalsy();
  });

  it('should return false when both email and password is not valid', async () => {
    mockedHasValidEmail.mockReturnValueOnce(false);
    mockedHasValidPassword.mockReturnValueOnce(false);
    expect(await auth.isValid()).toBeFalsy();
  });
});

describe('save', () => {
  beforeEach(() => {
    mockedDb.result.mockReset();
  });

  it('should save the authentication in db', async () => {
    const auth = new Auth(mockedDb, {
      email: 'test@email.com',
      password: 'password',
    });
    const mockedIsValid = jest.spyOn(auth, 'isValid');
    mockedIsValid.mockReturnValueOnce(true);

    await auth.save();

    expect(mockedIsValid).toBeCalledTimes(1);
    expect(mockedDb.result).toBeCalledTimes(1);
    expect(mockedDb.result).toBeCalledWith(
      'INSERT INTO auth(email, password) VALUES($1, $2)',
      ['test@email.com', 'password'],
    );
  });

  it('should throw an error since auth attributes are not valid', async () => {
    const auth = new Auth(mockedDb, {
      email: 'test@email.com',
      password: 'password',
    });
    const mockedIsValid = jest.spyOn(auth, 'isValid');
    mockedIsValid.mockReturnValueOnce(false);

    await expect(auth.save()).rejects.toThrowErrorMatchingSnapshot();

    expect(mockedIsValid).toBeCalledTimes(1);
    expect(mockedDb.result).not.toBeCalled();
  });

  it('should throw an error when database throws an error', async () => {
    const auth = new Auth(mockedDb, {
      email: 'test@email.com',
      password: 'password',
    });
    const mockedIsValid = jest.spyOn(auth, 'isValid');
    mockedIsValid.mockReturnValueOnce(true);
    mockedDb.result.mockImplementationOnce(() => {
      throw new Error('Error');
    });

    await expect(auth.save()).rejects.toThrowErrorMatchingSnapshot();

    expect(mockedIsValid).toBeCalledTimes(1);
    expect(mockedDb.result).toBeCalledTimes(1);
    expect(mockedDb.result).toBeCalledWith(
      'INSERT INTO auth(email, password) VALUES($1, $2)',
      ['test@email.com', 'password'],
    );
  });
});

describe('findById', () => {
  beforeEach(() => {
    mockedDb.oneOrNone.mockReset();
  });

  it('should return an auth object', async () => {
    mockedDb.oneOrNone.mockResolvedValueOnce({
      id: 1,
      email: 'test@email.com',
      password: 'password',
    });

    const auth = await Auth.findById(mockedDb, 1);

    expect(auth).toEqual(
      new Auth(mockedDb, { email: 'test@email.com', password: 'password' }),
    );
    expect(mockedDb.oneOrNone).toBeCalledTimes(1);
    expect(mockedDb.oneOrNone).toBeCalledWith(
      'SELECT * FROM auth WHERE id=$1 LIMIT 1',
      [1],
    );
  });

  it('should return nothing', async () => {
    mockedDb.oneOrNone.mockResolvedValueOnce(null);

    const auth = await Auth.findById(mockedDb, 2);

    expect(auth).toEqual(null);
    expect(mockedDb.oneOrNone).toBeCalledTimes(1);
    expect(mockedDb.oneOrNone).toBeCalledWith(
      'SELECT * FROM auth WHERE id=$1 LIMIT 1',
      [2],
    );
  });

  it('should handle a database error', async () => {
    mockedDb.oneOrNone.mockImplementationOnce(() => {
      throw new Error('Error');
    });

    await expect(
      Auth.findById(mockedDb, 1),
    ).rejects.toThrowErrorMatchingSnapshot();

    expect(mockedDb.oneOrNone).toBeCalledTimes(1);
    expect(mockedDb.oneOrNone).toBeCalledWith(
      'SELECT * FROM auth WHERE id=$1 LIMIT 1',
      [1],
    );
  });
});

describe('findByEmail', () => {
  beforeEach(() => {
    mockedDb.oneOrNone.mockReset();
  });

  it('should return what the database returns', async () => {
    mockedDb.oneOrNone.mockResolvedValueOnce({
      id: 1,
      email: 'test@email.com',
      password: 'password',
    });

    const auth = await Auth.findByEmail(mockedDb, 'test@email.com');

    expect(auth).toEqual(
      new Auth(mockedDb, { email: 'test@email.com', password: 'password' }),
    );
    expect(mockedDb.oneOrNone).toBeCalledTimes(1);
    expect(mockedDb.oneOrNone).toBeCalledWith(
      'SELECT * FROM auth WHERE email=$1 LIMIT 1',
      ['test@email.com'],
    );
  });

  it('should return nothing', async () => {
    mockedDb.oneOrNone.mockResolvedValueOnce(null);

    const auth = await Auth.findByEmail(mockedDb, 'test@email.com');

    expect(auth).toEqual(null);
    expect(mockedDb.oneOrNone).toBeCalledTimes(1);
    expect(mockedDb.oneOrNone).toBeCalledWith(
      'SELECT * FROM auth WHERE email=$1 LIMIT 1',
      ['test@email.com'],
    );
  });

  it('should handle a database error', async () => {
    mockedDb.oneOrNone.mockImplementationOnce(() => {
      throw new Error('Error');
    });

    await expect(
      Auth.findByEmail(mockedDb, 'test@email.com'),
    ).rejects.toThrowErrorMatchingSnapshot();

    expect(mockedDb.oneOrNone).toBeCalledTimes(1);
    expect(mockedDb.oneOrNone).toBeCalledWith(
      'SELECT * FROM auth WHERE email=$1 LIMIT 1',
      ['test@email.com'],
    );
  });
});
