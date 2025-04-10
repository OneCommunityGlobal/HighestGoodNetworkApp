import { useEffect, useMemo, useState } from 'react';
import './WeeklyProjectSummary.css';
import { useDispatch, useSelector } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';
import WeeklyProjectSummaryHeader from './WeeklyProjectSummaryHeader';
import { fetchAllMaterials } from '../../../actions/bmdashboard/materialsActions';
import QuantityOfMaterialsUsed from './QuantityOfMaterialsUsed/QuantityOfMaterialsUsed';
import TotalMaterialCostPerProject from './TotalMaterialCostPerProject/TotalMaterialCostPerProject';

export default function WeeklyProjectSummary() {
  const dispatch = useDispatch();
  const materials = useSelector(state => state.materials?.materialslist || []);
  const [openSections, setOpenSections] = useState({});

  const darkMode = useSelector(state => state.theme.darkMode);

  useEffect(() => {
    if (materials.length === 0) {
      dispatch(fetchAllMaterials());
    }
  }, [dispatch, materials.length]);

  const quantityOfMaterialsUsedData = useMemo(() => {
    if (!materials.length) return [];
    const uniqueMaterials = Array.from(new Map(materials.map(m => [m._id, m])).values());
    return uniqueMaterials;
  }, [materials]);

  const toggleSection = category => {
    setOpenSections(prev => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const sections = useMemo(
    () => [
      {
        title: 'Project Status',
        key: 'Project Status',
        className: 'full',
        content: (
          <div className="project-status-grid">
            {Array.from({ length: 12 }).map(() => {
              const uniqueId = uuidv4();
              return (
                <div key={uniqueId} className="weekly-project-summary-card small-card">
                  📊 Card
                </div>
              );
            })}
          </div>
        ),
      },
      {
        title: 'Material Consumption',
        key: 'Material Consumption',
        className: 'large',
        content: [1, 2, 3].map((_, index) => {
          const uniqueId = uuidv4();
          return (
            <div key={uniqueId} className="weekly-project-summary-card normal-card">
              {(() => {
                if (index === 1) {
                  return <QuantityOfMaterialsUsed data={quantityOfMaterialsUsedData} />;
                }
                if (index === 2) {
                  return <TotalMaterialCostPerProject />;
                }
                return '📊 Card';
              })()}
            </div>
          );
        }),
      },
      {
        title: 'Issue Tracking',
        key: 'Issue Tracking',
        className: 'small',
        content: <div className="weekly-project-summary-card normal-card">📊 Card</div>,
      },
      {
        title: 'Tools and Equipment Tracking',
        key: 'Tools and Equipment Tracking',
        className: 'half',
        content: [1, 2].map(() => {
          const uniqueId = uuidv4();
          return (
            <div key={uniqueId} className="weekly-project-summary-card normal-card">
              📊 Card
            </div>
          );
        }),
      },
      {
        title: 'Lessons Learned',
        key: 'Lessons Learned',
        className: 'half',
        content: [1, 2].map(() => {
          const uniqueId = uuidv4();
          return (
            <div key={uniqueId} className="weekly-project-summary-card normal-card">
              📊 Card
            </div>
          );
        }),
      },
      {
        title: 'Financials',
        key: 'Financials',
        className: 'large',
        content: (
          <>
            {Array.from({ length: 4 }).map(() => {
              const uniqueId = uuidv4();
              return (
                <div key={uniqueId} className="weekly-project-summary-card financial-small">
                  📊 Card
                </div>
              );
            })}

            <div className="weekly-project-summary-card financial-big">📊 Big Card</div>
          </>
        ),
      },
      {
        title: 'Loss Tracking',
        key: 'Loss Tracking',
        className: 'small',
        content: <div className="weekly-project-summary-card normal-card">📊 Card</div>,
      },
      {
        title: 'Global Distribution and Project Status',
        key: 'Global Distribution and Project Status',
        className: 'half',
        content: (
          <>
            <div className="weekly-project-summary-card wide-card">📊 Wide Card</div>
            <div className="weekly-project-summary-card normal-card">📊 Normal Card</div>
          </>
        ),
      },
      {
        title: 'Labor and Time Tracking',
        key: 'Labor and Time Tracking',
        className: 'half',
        content: [1, 2].map(() => {
          const uniqueId = uuidv4();
          return (
            <div key={uniqueId} className="weekly-project-summary-card normal-card">
              📊 Card
            </div>
          );
        }),
      },
    ],
    [quantityOfMaterialsUsedData],
  );

  return (
    <div className={`weekly-project-summary-container ${darkMode ? 'dark-mode' : ''}`}>
      <WeeklyProjectSummaryHeader />
      <div className="weekly-project-summary-dashboard-container">
        <div className="weekly-project-summary-dashboard-grid">
          {sections.map(({ title, key, className, content }) => (
            <div key={key} className={`weekly-project-summary-dashboard-section ${className}`}>
              <div
                className="weekly-project-summary-dashboard-category-title"
                onClick={() => toggleSection(key)}
              >
                {title}{' '}
                <span className="weekly-project-summary-dropdown-icon">
                  {openSections[key] ? '∧' : '∨'}
                </span>
              </div>
              {openSections[key] && (
                <div className="weekly-project-summary-dashboard-category-content">{content}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
