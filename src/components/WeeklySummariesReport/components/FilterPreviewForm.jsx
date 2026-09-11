import styles from '../SelectFilterModal.module.scss';
import mainStyles from '../WeeklySummariesReport.module.css';
import WeeklySummariesToggleFilter from './WeeklySummariesToggleFilter.jsx';

export default function FilterPreviewForm({ selectedFilter, darkMode, memberDict }) {
  return (
    <div>
      {selectedFilter && (
        <div>
          <div>Selected Team Codes:</div>
          <div className={styles.smScrollable}>
            {[...selectedFilter.filterData.selectedCodes].map(item => (
              <div
                key={item}
                className={`${mainStyles.chip} ${darkMode ? mainStyles.darkChip : ''}`}
              >
                {item}
              </div>
            ))}
          </div>
          <div>Selected Colors:</div>
          <div className={styles.smScrollable}>
            {[...selectedFilter.filterData.selectedColors].map(item => (
              <div
                key={item}
                className={`${mainStyles.chip} ${darkMode ? mainStyles.darkChip : ''}`}
              >
                {item}
              </div>
            ))}
          </div>
          <div>Selected Extra Member:</div>
          <div className={styles.smScrollable}>
            {[...selectedFilter.filterData.selectedExtraMembers].map(item => (
              <div
                key={item}
                className={`${mainStyles.chip} ${darkMode ? mainStyles.darkChip : ''}`}
              >
                {item in memberDict ? memberDict[item] : 'N/A'}
              </div>
            ))}
          </div>
          <WeeklySummariesToggleFilter
            state={selectedFilter.filterData}
            hasPermissionToFilter={true}
            editable={false}
            formId="preview"
          />
        </div>
      )}
    </div>
  );
}
