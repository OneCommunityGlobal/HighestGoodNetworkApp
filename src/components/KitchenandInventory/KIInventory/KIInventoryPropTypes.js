import PropTypes from 'prop-types';

export const inventoryItemShape = PropTypes.shape({
  _id: PropTypes.string,
  id: PropTypes.string,
  name: PropTypes.string,
  type: PropTypes.string,
  unit: PropTypes.string,
  location: PropTypes.string,
  category: PropTypes.string,
  presentQuantity: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  storedQuantity: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  reorderAt: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  monthlyUsage: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  onsite: PropTypes.bool,
  expiryDate: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
  lastHarvestDate: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
  nextHarvestDate: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
  nextHarvestQuantity: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
});
