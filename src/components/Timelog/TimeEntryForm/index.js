import TimeEntryForm from './TimeEntryForm';
import NewTimeEntryForm from './NewTimeEntryForm';
import { enableNewTimer } from 'features/enableNewTimer';


export default enableNewTimer ? NewTimeEntryForm : TimeEntryForm;
