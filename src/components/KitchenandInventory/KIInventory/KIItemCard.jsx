import { RiLeafLine } from 'react-icons/ri';
import { TbCircleCheck } from 'react-icons/tb';
import { FiAlertCircle, FiAlertTriangle, FiCalendar, FiShoppingCart } from 'react-icons/fi';
import { useSelector } from 'react-redux';
import styles from './KIItemCard.module.css';

function KIItemCard(props) {
  const item = props.item;
  const healthyStock = item.presentQuantity > item.reorderAt;
  const lowStock =
    item.presentQuantity <= item.reorderAt && item.presentQuantity >= item.reorderAt * 0.75;
  const darkMode = useSelector(state => state.theme.darkMode);
  return (
    <div className={`${styles.cardContainer} ${darkMode ? styles.darkCardContainer : ''}`}>
      {/* Card Header */}
      <div className={styles.cardHeader}>
        <div>
          <h6 style={{ marginBottom: 0 }}>
            {item.name}
            <span>
              {' '}
              {item.onsite && (
                <RiLeafLine style={darkMode ? { fill: '#12ad36ff' } : { color: '#12ad36ff' }} />
              )}
            </span>
          </h6>
          <p className={styles.smallerText}>{item.type}</p>
        </div>
        <div>
          {healthyStock ? (
            <TbCircleCheck style={darkMode ? { fill: '#12ad36ff' } : { color: '#12ad36ff' }} />
          ) : lowStock ? (
            <FiAlertTriangle style={darkMode ? { fill: '#dea208ff' } : { color: '#dea208ff' }} />
          ) : (
            <FiAlertCircle style={darkMode ? { fill: '#ef2d2dff' } : { color: '#ef2d2dff' }} />
          )}
        </div>
      </div>
      {/* Card Body */}
      <div>
        {/* Stock Quantity Bars */}
        <div className={styles.stockandSupplyContainer}>
          <div className={styles.quantityDetails}>
            <div className={styles.currentStockDetails}>
              <p style={{ margin: 0, padding: 0 }}>Current Stock</p>
              <p style={{ margin: 0, padding: 0, fontWeight: 'bold' }}>
                {item.presentQuantity} {item.unit}
              </p>
            </div>
            <div className={`${styles.statusBar}`}>
              <div
                className={styles.stockBarProgress}
                style={{
                  width: `${(item.presentQuantity / item.storedQuantity) * 100}%`,
                  '--status-color': healthyStock
                    ? '#12ad36ff'
                    : lowStock
                    ? '#dea208ff'
                    : '#ef2d2dff',
                }}
              ></div>
            </div>
            <p className={styles.smallerText}>
              Reorder at {item.reorderAt} {item.unit}
            </p>
          </div>
          <div className={styles.quantityDetails}>
            <div className={styles.currentStockDetails}>
              <p style={{ margin: 0, padding: 0 }}>Monthly Supply</p>
              <p style={{ margin: 0, padding: 0, fontWeight: 'bold' }}>
                {Math.round((item.presentQuantity / item.monthlyUsage) * 10) / 10} months
              </p>
            </div>
            <div className={`${styles.statusBar}`}>
              <div
                className={styles.supplyBarProgress}
                style={{
                  width: `${Math.min((item.presentQuantity / item.monthlyUsage) * 100, 100)}%`,
                  '--status-color': healthyStock ? '#007bff' : lowStock ? '#dea208ff' : '#ef2d2dff',
                }}
              ></div>
            </div>
            <p className={styles.smallerText}>
              {`Target: 1 month minimum (${item.monthlyUsage} ${item.unit}/month)`}
            </p>
          </div>
        </div>
        <div className={styles.locationSourceContainer}>
          <div>
            <p className={styles.smallerText}>Location</p>
            <p style={{ margin: 0, padding: 0, fontWeight: 'bold' }}>{item.location}</p>
          </div>
          <div>
            <p className={styles.smallerText}>Source</p>
            <p style={{ margin: 0, padding: 0, fontWeight: 'bold' }}>
              {item.onsite ? (
                <span className={styles.sourceType}>Onsite</span>
              ) : (
                <span className={styles.sourceType} style={{ backgroundColor: 'grey' }}>
                  Purchased
                </span>
              )}
            </p>
          </div>
        </div>
        <div className={styles.datesContainer}>
          {item.expiryDate && (
            <div
              className={styles.dates}
              style={
                darkMode
                  ? { border: '1px solid #e89090' }
                  : {
                      backgroundColor: '#e9dbdb',
                    }
              }
            >
              <FiCalendar />
              <p className={`${styles.smallerText}`}>
                Expires: {new Date(item.expiryDate).toLocaleDateString()}
              </p>
            </div>
          )}
          {item.lastHarvestDate && (
            <div
              className={styles.dates}
              style={
                darkMode
                  ? { border: '1px solid #71f87a' }
                  : {
                      backgroundColor: '#e8f4e8',
                      color: '#39ae39',
                    }
              }
            >
              <FiCalendar />
              <p className={`${styles.smallerText}`}>
                Last harvest: {new Date(item.lastHarvestDate).toLocaleDateString()}
              </p>
            </div>
          )}
          {item.nextHarvestDate && (
            <div
              className={styles.dates}
              style={
                darkMode
                  ? { border: '1px solid #8abbee' }
                  : {
                      backgroundColor: '#cbe0f6',
                      color: '#2a6ad1',
                    }
              }
            >
              <RiLeafLine />
              <p className={`${styles.smallerText}`}>
                Next harvest:{' '}
                {`${item.nextHarvestQuantity} ${item.unit} on ${new Date(
                  item.nextHarvestDate,
                ).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
              </p>
            </div>
          )}
        </div>
      </div>
      <div className={styles.cardButtonContainer}>
        <button
          className={styles.cardButton}
          style={darkMode ? { backgroundColor: '#3a3a3a', color: '#ffffff' } : {}}
        >
          Update Item
        </button>
        <button
          className={styles.cardButton}
          style={darkMode ? { backgroundColor: '#3a3a3a', color: '#ffffff' } : {}}
        >
          <FiShoppingCart /> Reorder
        </button>
      </div>
    </div>
  );
}

export default KIItemCard;
