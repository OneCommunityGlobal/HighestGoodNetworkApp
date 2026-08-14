import { RiLeafLine } from 'react-icons/ri';
import { TbCircleCheck } from 'react-icons/tb';
import { FiAlertCircle, FiAlertTriangle, FiCalendar, FiShoppingCart } from 'react-icons/fi';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { inventoryItemShape } from './KIInventoryPropTypes';
import styles from './KIItemCard.module.css';

const STATUS_COLORS = {
  healthy: '#12ad36ff',
  low: '#dea208ff',
  critical: '#ef2d2dff',
};

const STATUS_ICONS = {
  healthy: TbCircleCheck,
  low: FiAlertTriangle,
  critical: FiAlertCircle,
};

const DATE_STYLES = {
  expiry: {
    dark: { border: '1px solid #e89090' },
    light: { backgroundColor: '#e9dbdb' },
  },
  lastHarvest: {
    dark: { border: '1px solid #71f87a' },
    light: { backgroundColor: '#e8f4e8', color: '#39ae39' },
  },
  nextHarvest: {
    dark: { border: '1px solid #8abbee' },
    light: { backgroundColor: '#cbe0f6', color: '#2a6ad1' },
  },
};

const getStockStatus = item => {
  if (item.presentQuantity > item.reorderAt) {
    return 'healthy';
  }
  if (item.presentQuantity >= item.reorderAt * 0.75) {
    return 'low';
  }
  return 'critical';
};

const getSupplyStatus = supplyRatio => {
  if (supplyRatio >= 1) {
    return 'healthy';
  }
  if (supplyRatio >= 0.6) {
    return 'low';
  }
  return 'critical';
};

const getIconStyle = (darkMode, color) => (darkMode ? { fill: color } : { color });

function CardHeader({ item, darkMode, stockStatus }) {
  const StockStatusIcon = STATUS_ICONS[stockStatus];

  return (
    <div className={styles.cardHeader}>
      <div>
        <h6 style={{ marginBottom: 0 }}>
          {item.name}
          <span>
            {' '}
            {item.onsite && <RiLeafLine style={getIconStyle(darkMode, STATUS_COLORS.healthy)} />}
          </span>
        </h6>
        <p className={styles.smallerText}>{item.type}</p>
      </div>
      <div>
        <StockStatusIcon style={getIconStyle(darkMode, STATUS_COLORS[stockStatus])} />
      </div>
    </div>
  );
}

CardHeader.propTypes = {
  item: inventoryItemShape.isRequired,
  darkMode: PropTypes.bool.isRequired,
  stockStatus: PropTypes.oneOf(['healthy', 'low', 'critical']).isRequired,
};

function StockDetails({ item, stockStatus }) {
  return (
    <div className={styles.quantityDetails}>
      <div className={styles.currentStockDetails}>
        <p style={{ margin: 0, padding: 0 }}>Current Stock</p>
        <p style={{ margin: 0, padding: 0, fontWeight: 'bold' }}>
          {item.presentQuantity} {item.unit}
        </p>
      </div>
      <div className={styles.statusBar}>
        <div
          className={styles.stockBarProgress}
          style={{
            width: `${(item.presentQuantity / item.storedQuantity) * 100}%`,
            '--status-color': STATUS_COLORS[stockStatus],
          }}
        />
      </div>
      <p className={styles.smallerText}>
        Reorder at {item.reorderAt} {item.unit}
      </p>
    </div>
  );
}

StockDetails.propTypes = {
  item: inventoryItemShape.isRequired,
  stockStatus: PropTypes.oneOf(['healthy', 'low', 'critical']).isRequired,
};

function SupplyDetails({ item }) {
  const supplyRatio = item.presentQuantity / item.monthlyUsage;
  const supplyStatus = getSupplyStatus(supplyRatio);
  const supplyColor = supplyStatus === 'healthy' ? '#007bff' : STATUS_COLORS[supplyStatus];

  return (
    <div className={styles.quantityDetails}>
      <div className={styles.currentStockDetails}>
        <p style={{ margin: 0, padding: 0 }}>Monthly Supply</p>
        <p style={{ margin: 0, padding: 0, fontWeight: 'bold' }}>
          {Math.round(supplyRatio * 10) / 10} months
        </p>
      </div>
      <div className={styles.statusBar}>
        <div
          className={styles.supplyBarProgress}
          style={{
            width: `${Math.min(supplyRatio * 100, 100)}%`,
            '--status-color': supplyColor,
          }}
        />
      </div>
      <p className={styles.smallerText}>
        {`Target: 1 month minimum (${item.monthlyUsage} ${item.unit}/month)`}
      </p>
    </div>
  );
}

SupplyDetails.propTypes = {
  item: inventoryItemShape.isRequired,
};

function LocationAndSource({ item }) {
  return (
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
  );
}

LocationAndSource.propTypes = {
  item: inventoryItemShape.isRequired,
};

function DateBadge({ children, darkMode, icon: Icon, variant }) {
  const theme = darkMode ? 'dark' : 'light';

  return (
    <div className={styles.dates} style={DATE_STYLES[variant][theme]}>
      <Icon />
      <p className={styles.smallerText}>{children}</p>
    </div>
  );
}

DateBadge.propTypes = {
  children: PropTypes.node.isRequired,
  darkMode: PropTypes.bool.isRequired,
  icon: PropTypes.elementType.isRequired,
  variant: PropTypes.oneOf(['expiry', 'lastHarvest', 'nextHarvest']).isRequired,
};

function ItemDates({ item, darkMode }) {
  return (
    <div className={styles.datesContainer}>
      {item.expiryDate && (
        <DateBadge darkMode={darkMode} icon={FiCalendar} variant="expiry">
          Expires: {new Date(item.expiryDate).toLocaleDateString()}
        </DateBadge>
      )}
      {item.lastHarvestDate && (
        <DateBadge darkMode={darkMode} icon={FiCalendar} variant="lastHarvest">
          Last harvest: {new Date(item.lastHarvestDate).toLocaleDateString()}
        </DateBadge>
      )}
      {item.nextHarvestDate && (
        <DateBadge darkMode={darkMode} icon={RiLeafLine} variant="nextHarvest">
          Next harvest:{' '}
          {`${item.nextHarvestQuantity} ${item.unit} on ${new Date(
            item.nextHarvestDate,
          ).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
        </DateBadge>
      )}
    </div>
  );
}

ItemDates.propTypes = {
  item: inventoryItemShape.isRequired,
  darkMode: PropTypes.bool.isRequired,
};

function CardActions({ darkMode, item, onReorder, onUpdateItem }) {
  const buttonStyle = darkMode ? { backgroundColor: '#3a3a3a', color: '#ffffff' } : {};

  return (
    <div className={styles.cardButtonContainer}>
      <button
        type="button"
        className={styles.cardButton}
        style={buttonStyle}
        onClick={() => onUpdateItem(item)}
      >
        Update Item
      </button>
      <button
        type="button"
        className={styles.cardButton}
        style={buttonStyle}
        onClick={() => onReorder(item)}
      >
        <FiShoppingCart /> Reorder
      </button>
    </div>
  );
}

CardActions.propTypes = {
  darkMode: PropTypes.bool.isRequired,
  item: inventoryItemShape.isRequired,
  onReorder: PropTypes.func.isRequired,
  onUpdateItem: PropTypes.func.isRequired,
};

function KIItemCard({ item, onUpdateItem, onReorder }) {
  const darkMode = useSelector(state => state.theme.darkMode);
  const stockStatus = getStockStatus(item);

  return (
    <div className={`${styles.cardContainer} ${darkMode ? styles.darkCardContainer : ''}`}>
      <CardHeader item={item} darkMode={darkMode} stockStatus={stockStatus} />
      <div>
        <div className={styles.stockandSupplyContainer}>
          <StockDetails item={item} stockStatus={stockStatus} />
          {item.monthlyUsage && <SupplyDetails item={item} />}
        </div>
        <LocationAndSource item={item} />
        <ItemDates item={item} darkMode={darkMode} />
      </div>
      <CardActions
        darkMode={darkMode}
        item={item}
        onReorder={onReorder}
        onUpdateItem={onUpdateItem}
      />
    </div>
  );
}

KIItemCard.propTypes = {
  item: inventoryItemShape.isRequired,
  onUpdateItem: PropTypes.func,
  onReorder: PropTypes.func,
};

KIItemCard.defaultProps = {
  onUpdateItem: () => {},
  onReorder: () => {},
};

export default KIItemCard;
