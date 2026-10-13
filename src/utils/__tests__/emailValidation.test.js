import { checkEmail } from '../emailValidation';

// With a suggestion on screen the error doesn't repeat "check for a typo"; the hint says it.
const badEnding = (ending, suggestion) =>
  `"${ending}" isn't a valid email domain ending.${suggestion ? '' : ' Check for a typo.'}`;

describe('checkEmail', () => {
  it('rejects a non-existent TLD and suggests the likely address', () => {
    expect(checkEmail('rabstu@gmail.con')).toEqual({
      error: badEnding('.con', true),
      suggestion: 'rabstu@gmail.com',
    });
  });

  it.each([
    ['ada@yahoo.cmo', '.cmo', 'ada@yahoo.com'],
    ['ada@outlook.comm', '.comm', 'ada@outlook.com'],
    ['ada@company.con', '.con', 'ada@company.com'],
    ['ada@school.ogr', '.ogr', 'ada@school.org'],
    ['ada@company.qwzx', '.qwzx', null],
    ['ada@gmial.con', '.con', 'ada@gmail.com'],
    ['ada@hotmial.cmo', '.cmo', 'ada@hotmail.com'],
    ['ada@gmail.CON', '.CON', 'ada@gmail.com'],
  ])('blocks %s (%s) and suggests %s', (email, ending, suggestion) => {
    expect(checkEmail(email)).toEqual({ error: badEnding(ending, suggestion), suggestion });
  });

  it.each([
    ['ada@gmial.com', 'ada@gmail.com'],
    ['ada@gamil.com', 'ada@gmail.com'],
    ['ada@gmail.co', 'ada@gmail.com'],
    ['ada@gmail.cm', 'ada@gmail.com'],
    ['ada@hotmial.com', 'ada@hotmail.com'],
    ['ada@yahooo.com', 'ada@yahoo.com'],
    ['ada@outlok.com', 'ada@outlook.com'],
    ['ada@iclod.com', 'ada@icloud.com'],
    ['ada@yhoo.com', 'ada@yahoo.com'],
    ['ada@hotmial.co.uk', 'ada@hotmail.co.uk'],
    ['ada@hotmial.ca', 'ada@hotmail.ca'],
    ['ada@yahoo.co', 'ada@yahoo.com'],
  ])('allows %s but suggests %s', (email, suggestion) => {
    expect(checkEmail(email)).toEqual({ error: '', suggestion });
  });

  it.each([
    'ada@gmail.com',
    'Ada.Lovelace+jobs@Gmail.com',
    'ada@mail.com',
    'ada@email.com',
    'ada@ymail.com',
    'ada@gm.com',
    'ada@me.com',
    'ada@company.co',
    'ada@startup.io',
    'ada@uni.ac.uk',
    'ada@yahoo.co.uk',
    'ada@例子.中国',
    '  ada@example.org  ',
    // Real regional or company domains that sit close to a provider
    'ada@hotmail.ca',
    'ada@hotmail.cl',
    'ada@hotmail.co.jp',
    'ada@hotmail.fr',
    'ada@yahoo.co.jp',
    'ada@yahoo.co.id',
    'ada@yahoo.co.nz',
    'ada@yahoo.com.br',
    'ada@outlook.cl',
    'ada@outlook.co.uk',
    'ada@protonmail.ch',
    'ada@live.ca',
    'ada@gmx.de',
    'ada@cloud.com',
    'ada@unicloud.com',
    'ada@comcast.com',
  ])('accepts %s without a suggestion', email => {
    expect(checkEmail(email)).toEqual({ error: '', suggestion: null });
  });

  it('requires an email', () => {
    expect(checkEmail('   ')).toEqual({ error: 'Email is required.', suggestion: null });
    expect(checkEmail(undefined)).toEqual({ error: 'Email is required.', suggestion: null });
  });

  it.each([
    ['ada@gmail', 'ada@gmail.com'],
    ['ada@hotmail', 'ada@hotmail.com'],
    ['ada@company', null],
    ['ada', null],
    ['ada@gmail.com.', 'ada@gmail.com'],
    ['ada@gmail.com..', 'ada@gmail.com'],
    ['ada@gmail.con.', 'ada@gmail.com'],
    ['ada @gmail.com', null],
  ])('flags malformed %s with suggestion %s', (email, suggestion) => {
    expect(checkEmail(email)).toEqual({
      error: 'Please enter a valid email address.',
      suggestion,
    });
  });

  it.each([
    ['ada@gmail.c', 'ada@gmail.com'],
    ['ada@gmail.xyzq', 'ada@gmail.com'],
  ])('blocks %s and suggests the provider domain %s', (email, suggestion) => {
    expect(checkEmail(email)).toEqual({ error: badEnding(`.${email.split('.').pop()}`, true), suggestion });
  });

  it('only ever suggests an address that passes the check itself', () => {
    [
      'ada@gmail.c',
      'ada@gmail.con.',
      'ada@gmail.com..',
      'ada@gmial.con',
      'ada@school.ogr',
      'ada@hotmial.cmo',
      'ada@gmail',
    ].forEach(email => {
      const { suggestion } = checkEmail(email);
      expect(suggestion).not.toBeNull();
      expect(checkEmail(suggestion)).toEqual({ error: '', suggestion: null });
    });
  });

  it('rejects hidden characters pasted into the address', () => {
    expect(checkEmail('ada@hotmail.com​')).toEqual({
      error: 'This email has a hidden character in it. Please retype it.',
      suggestion: null,
    });
    expect(checkEmail('a⁠da@gmail.com').error).toBe(
      'This email has a hidden character in it. Please retype it.',
    );
  });

  it('rejects addresses longer than 254 characters without slowing down', () => {
    const long = `ada@${'a'.repeat(100000)}.com`;
    const started = Date.now();
    expect(checkEmail(long)).toEqual({ error: 'Please enter a valid email address.', suggestion: null });
    expect(Date.now() - started).toBeLessThan(50);
  });
});
