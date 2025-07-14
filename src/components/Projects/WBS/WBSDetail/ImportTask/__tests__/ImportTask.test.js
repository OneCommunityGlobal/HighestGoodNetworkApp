import { mount } from 'enzyme';
import { act } from 'react-dom/test-utils';
import ImportTask from '.././ImportTask';
import readXlsxFile from 'read-excel-file';
import { Alert, Modal } from 'reactstrap';
import { TASK_IMPORT_POPUP_ID } from '../../../t./../../../../../src/constants/popupId';

jest.mock('read-excel-file');

const importTaskMock    = jest.fn();
const getPopupByIdMock  = jest.fn();
const loadMock          = jest.fn();
const setIsLoadingMock  = jest.fn();

const defaultProps = {
  wbsId:        42,
  popupContent: '<p>Initial instruction</p>',
  members: [
    { firstName: 'John', lastName: 'Doe', _id: '1', profilePic: null }
  ],
  darkMode:     false,
  importTask:   importTaskMock,
  getPopupById: getPopupByIdMock,
  load:         loadMock,
  setIsLoading: setIsLoadingMock,
};

describe('ImportTask (unconnected)', () => {
  let wrapper;
  const Unconnected = ImportTask.WrappedComponent || ImportTask;

  beforeEach(() => {
    jest.clearAllMocks();
    wrapper = mount(<Unconnected {...defaultProps} />);
  });

  it('renders control button and has modal closed initially', () => {
    expect(wrapper.find('button.controlBtn').exists()).toBe(true);
    expect(wrapper.find(Modal).prop('isOpen')).toBe(false);
  });

  it('opens modal and calls getPopupById when clicking the button', () => {
    wrapper.find('button.controlBtn').simulate('click');
    wrapper.update();

    expect(wrapper.find(Modal).prop('isOpen')).toBe(true);
    expect(getPopupByIdMock).toHaveBeenCalledWith(TASK_IMPORT_POPUP_ID);
  });

  it('handles a successful import, shows upload/reset, and wraps upload in act', async () => {
    // 1) Mock readXlsxFile to return one valid row
    const rows = [
      ['File Instruction'], [],
      [
        '100','Task A', null,null, null,null, null,null,
        'P1','John Doe','Yes','Open',
        '1.5','2.5','3.5','0.0'
      ]
    ];
    readXlsxFile.mockResolvedValue(rows);

    // 2) Open modal & pick a file
    wrapper.find('button.controlBtn').simulate('click');
    wrapper.update();
    wrapper.find('input[type="file"]').simulate('change', {
      target: { files: [ new File([''], 'tasks.xlsx') ] }
    });

    // 3) Wait for the import to finish
    await act(async () => {
      await Promise.resolve();
    });
    wrapper.update();

    // 4) “Are you sure you want to upload it?” prompt should appear
    expect(
      wrapper.find(Alert)
             .filterWhere(n => n.prop('color') === 'primary')
             .text()
    ).toContain('Are you sure you want to upload it?');

    // 5) Wrap the Upload click + async uploadTaskList in act(...)
    importTaskMock.mockResolvedValue();
    await act(async () => {
      wrapper
        .find('button')
        .filterWhere(n => n.text() === 'Upload')
        .simulate('click');
      await Promise.resolve(); // wait for await importTask(...)
    });
    wrapper.update();

    // 6) Assertions
    expect(importTaskMock).toHaveBeenCalledWith(expect.any(Array), defaultProps.wbsId);
    expect(
      wrapper.find(Alert)
             .filterWhere(n => n.text().includes('File Uploaded!'))
             .exists()
    ).toBe(true);
  });

  it('resets back to choosing when “Reset” is clicked after import', async () => {
    // prepare and import
    readXlsxFile.mockResolvedValue([['X'], [], ['1','T', null,null, null,null, null,null,'P','John Doe','Yes','Open','1','2','3','4']]);
    wrapper.find('button.controlBtn').simulate('click');
    wrapper.update();
    wrapper.find('input[type="file"]').simulate('change', {
      target: { files: [ new File([], 'a.xlsx') ] }
    });
    await act(async () => await Promise.resolve());
    wrapper.update();

    // now click Reset
    await act(async () => {
      wrapper
        .find('button')
        .filterWhere(n => n.text() === 'Reset')
        .simulate('click');
    });
    wrapper.update();

    // after reset, we should see the file input again and NO primary Alert
    expect(wrapper.find('input[type="file"]').exists()).toBe(true);
    expect(
      wrapper.find(Alert).filterWhere(n => n.prop('color') === 'primary').exists()
    ).toBe(false);
  });

  it('shows uploading spinner when importTask promise is pending', async () => {
    // first import so Upload button appears
    readXlsxFile.mockResolvedValue([['H'], [], ['1','T', null,null, null,null, null,null,'P','John Doe','Yes','Open','1','2','3','4']]);
    wrapper.find('button.controlBtn').simulate('click');
    wrapper.update();
    wrapper.find('input[type="file"]').simulate('change', {
      target: { files: [ new File([], 'b.xlsx') ] }
    });
    await act(async () => await Promise.resolve());
    wrapper.update();

    // make importTask never resolve
    importTaskMock.mockImplementation(() => new Promise(() => {}));
    await act(async () => {
      wrapper
        .find('button')
        .filterWhere(n => n.text() === 'Upload')
        .simulate('click');
    });
    wrapper.update();

    // should see the spinner with “Uploading…”
    const spinner = wrapper.find('span.spinner-grow');
    expect(spinner.exists()).toBe(true);
    expect(spinner.text()).toContain('Uploading');
  });

  it('calls setIsLoading, load, then setIsLoading on modal close', async () => {
    // open and then close the modal
    wrapper.find('button.controlBtn').simulate('click');
    wrapper.update();

    await act(async () => {
      // directly invoke onClosed prop
      await wrapper.find(Modal).prop('onClosed')();
      await Promise.resolve();
    });
    wrapper.update();

    // first call: true, then load(), then false
    expect(setIsLoadingMock).toHaveBeenNthCalledWith(1, true);
    expect(loadMock).toHaveBeenCalled();
    expect(setIsLoadingMock).toHaveBeenNthCalledWith(2, false);
  });

  it('handles import error when member not found', async () => {
    // rows with unknown “Jane Smith”
    const rows = [
      ['Instr'], [],
      [
        '1','Task X', null,null, null,null, null,null,
        'P2','Jane Smith','Yes','Open',
        '1','2','3','4'
      ]
    ];
    readXlsxFile.mockResolvedValue(rows);

    wrapper.find('button.controlBtn').simulate('click');
    wrapper.update();
    wrapper.find('input[type="file"]').simulate('change', {
      target: { files: [ new File([], 'x.xlsx') ] }
    });

    await act(async () => await Promise.resolve());
    wrapper.update();

    expect(
      wrapper.find(Alert)
             .filterWhere(n => n.prop('color') === 'danger')
             .text()
    ).toContain('Error: Jane Smith is not in the project member list');
  });
});
