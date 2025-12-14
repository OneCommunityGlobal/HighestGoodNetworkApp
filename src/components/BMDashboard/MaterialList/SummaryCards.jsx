import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import styles from './SummaryCards.module.css';

const SummaryCards = ({ cardData }) => {
  return (
    <div className={`container ${styles.wrapper}`}>
      <div className="row">
        {cardData.map((card, index) => (
          <div className="col-md-4 mb-3" key={index}>
            <div className={`card border-0 shadow-sm ${styles.card}`}>
              <div className="card-body">
                <h6 className={styles.title}>{card.title}</h6>

                <div className="d-flex align-items-center rounded">
                  <div
                    className={`${styles.icon} ${card.isTriangle ? styles.warningIcon : ''}`}
                    style={{ color: card.color }}
                  >
                    <FontAwesomeIcon icon={card.icon} fixedWidth />
                  </div>

                  <div className="pl-3">
                    <h4 className={styles.value}>{card.value}</h4>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SummaryCards;
