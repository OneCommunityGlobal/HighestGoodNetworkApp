import { readSplitDraft, splitDraftKey } from '../splitTimeEntryUtils';

it.each(['not json', '{}', '{"payload":{"personId":"user"},"rows":[null,null]}', '{"payload":{"personId":"another"},"rows":[]}'])('ignores malformed recovery data: %s', value => {
  localStorage.setItem(splitDraftKey('user'), value);
  expect(readSplitDraft('user')).toBeNull();
  localStorage.clear();
});
