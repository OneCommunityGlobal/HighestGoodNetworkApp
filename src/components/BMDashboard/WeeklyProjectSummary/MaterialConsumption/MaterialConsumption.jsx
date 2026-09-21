import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllMaterials } from '../../../../actions/bmdashboard/materialsActions';
import IssueChart from '../../Issues/issueCharts';
import QuantityOfMaterialsUsed from '../QuantityOfMaterialsUsed/QuantityOfMaterialsUsed';
import TotalMaterialCostPerProject from '../TotalMaterialCostPerProject/TotalMaterialCostPerProject';
import styles from '../WeeklyProjectSummary.module.css';
import materialStyles from './MaterialConsumption.module.css';

function useMaterialConsumptionData(quantityOfMaterialsUsedData) {
  const dispatch = useDispatch();
  const materials = useSelector(state => state.materials?.materialslist || []);
  // WeeklyProjectSummary passes preloaded data; the standalone route fetches the same store data here.
  const shouldUseStoreMaterials = quantityOfMaterialsUsedData === undefined;

  useEffect(() => {
    if (shouldUseStoreMaterials && materials.length === 0) dispatch(fetchAllMaterials());
  }, [dispatch, materials.length, shouldUseStoreMaterials]);

  return useMemo(() => {
    if (!shouldUseStoreMaterials) return quantityOfMaterialsUsedData;
    if (!materials.length) return [];
    return Array.from(new Map(materials.map(material => [material._id, material])).values());
  }, [materials, quantityOfMaterialsUsedData, shouldUseStoreMaterials]);
}

function renderMaterialCard(cardKey, quantityOfMaterialsUsedData) {
  if (cardKey === 'quantity') {
    return (
      <div
        className={`${materialStyles.materialConsumptionContent} ${materialStyles.quantityContent}`}
      >
        <QuantityOfMaterialsUsed data={quantityOfMaterialsUsedData} />
      </div>
    );
  }

  if (cardKey === 'issue') {
    // The issue chart is part of the three-card Material Consumption group on this PR.
    return (
      <div
        className={`${materialStyles.materialConsumptionContent} ${materialStyles.issueContent}`}
      >
        <IssueChart variant="card" />
      </div>
    );
  }

  return (
    <div
      className={`${materialStyles.materialConsumptionContent} ${materialStyles.totalCostContent}`}
    >
      <TotalMaterialCostPerProject />
    </div>
  );
}

export function MaterialConsumptionCards({ quantityOfMaterialsUsedData }) {
  const materialData = useMaterialConsumptionData(quantityOfMaterialsUsedData);
  const darkMode = useSelector(state => state.theme.darkMode);
  // Keep this order aligned with the PR requirement for the Material Consumption section and route.
  const cards = ['quantity', 'issue', 'totalCost'];
  const cardClassNames = {
    issue: materialStyles.issueCard,
  };

  return (
    <>
      {cards.map(cardKey => (
        <div
          key={cardKey}
          className={`${styles.weeklyProjectSummaryCard} ${styles.normalCard} ${
            materialStyles.materialConsumptionCard
          } ${cardClassNames[cardKey] || ''} ${
            darkMode ? materialStyles.materialConsumptionCardDark : ''
          }`}
        >
          {renderMaterialCard(cardKey, materialData)}
        </div>
      ))}
    </>
  );
}

function MaterialConsumption() {
  const darkMode = useSelector(state => state.theme.darkMode);

  return (
    <div
      className={`${styles.weeklyProjectSummaryContainer} ${
        materialStyles.materialConsumptionPage
      } ${darkMode ? styles.darkMode : ''}`}
    >
      <div
        className={`${styles.weeklyProjectSummaryDashboardContainer} ${materialStyles.materialConsumptionDashboard}`}
      >
        <div
          className={`${styles.weeklyProjectSummaryDashboardSection} ${styles.large} ${materialStyles.materialConsumptionSection}`}
        >
          {/* This route intentionally shows the full Material Consumption group, not standalone IssueChart. */}
          <div className={styles.weeklyProjectSummaryDashboardCategoryTitle}>
            Material Consumption
          </div>
          <div
            className={`${styles.weeklyProjectSummaryDashboardCategoryContent} ${materialStyles.materialConsumptionGrid}`}
          >
            <MaterialConsumptionCards />
          </div>
        </div>
      </div>
    </div>
  );
}

export default MaterialConsumption;
