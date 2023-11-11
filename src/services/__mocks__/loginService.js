let getCurrentUser_result;
const getCurrentUseroptions = {
  userPresent: { foo: 'bar', baz: 'masklsd' },
  userNotPresent: null,
  headerTest: {
    name: 'Foobar',
    profilePic: undefined,
    userId: '5be0952c633dae0016081b4b',
  },
};

getCurrentUser.__setValue = option => {
  getCurrentUser_result = getCurrentUseroptions[option];
};

export function getCurrentUser() {
  return getCurrentUser_result;
}

export function login(credentials) {
  console.log('Invoking fake login method of loginService');
  return 'Success';
}
