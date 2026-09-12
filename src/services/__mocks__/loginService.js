let getCurrentUserResult;
const getCurrentUseroptions = {
  userPresent: { foo: 'bar', baz: 'masklsd' },
  userNotPresent: null,
  headerTest: {
    name: 'Foobar',
    profilePic: undefined,
    userId: '5be0952c633dae0016081b4b',
  },
};

// eslint-disable-next-line no-use-before-define
getCurrentUser.__setValue = option => {
  getCurrentUserResult = getCurrentUseroptions[option];
};

export function getCurrentUser() {
  return getCurrentUserResult;
}

// eslint-disable-next-line no-unused-vars
export function login(credentials) {
  // eslint-disable-next-line no-console
  console.log('Invoking fake login method of loginService');
  return 'Success';
}
