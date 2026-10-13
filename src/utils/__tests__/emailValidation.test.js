import { checkEmail } from '../emailValidation';

const badEnding = ending => `"${ending}" isn't a valid email domain ending. Check for a typo.`;

describe('checkEmail', () => {
  it('rejects a non-existent TLD and suggests the likely address', () => {
    expect(checkEmail('rabstu@gmail.con')).toEqual({
      error: badEnding('.con'),
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
    expect(checkEmail(email)).toEqual({ error: badEnding(ending), suggestion });
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
    ['ada @gmail.com', null],
  ])('flags malformed %s with suggestion %s', (email, suggestion) => {
    expect(checkEmail(email)).toEqual({
      error: 'Please enter a valid email address.',
      suggestion,
    });
  });
});
