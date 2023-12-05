/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { useState } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import classnames from 'classnames';
import './Paging.css';

// eslint-disable-next-line import/prefer-default-export
export function Paging({ maxElemPerPage = 6, totalElementsCount, children }) {
  const [currentPage, setCurrentPage] = useState(1);

  const pagesCount = Math.ceil(totalElementsCount / maxElemPerPage);

  const renderPageNumberButton = pageNumber => (
    <div
      role="button"
      tabIndex={0} // indicates that his element can be tabbed to
      onClick={() => setCurrentPage(pageNumber)}
      className={classnames('page-index-button', { 'active-button': pageNumber === currentPage })}
    >
      {pageNumber}
    </div>
  );

  const renderPageIndexes = () => {
    const indexesButtons = [];

    if (pagesCount <= 6) {
      for (let i = 1; i <= pagesCount; i += 1) {
        indexesButtons.push(renderPageNumberButton(i));
      }

      return <div className="pagination-buttons">{indexesButtons}</div>;
    }

    if (currentPage <= 5) {
      for (let i = 1; i <= 5; i += 1) {
        indexesButtons.push(renderPageNumberButton(i));
      }

      return (
        <div className="pagination-buttons">
          {indexesButtons}
          ...
          <div>{renderPageNumberButton(pagesCount)}</div>
        </div>
      );
    }

    if (currentPage > pagesCount - 5) {
      for (let i = pagesCount - 4; i <= pagesCount; i += 1) {
        indexesButtons.push(renderPageNumberButton(i));
      }
      return (
        <div className="pagination-buttons">
          {renderPageNumberButton(1)}
          ...
          {indexesButtons}
        </div>
      );
    }

    for (let i = currentPage - 1; i <= currentPage + 2; i += 1) {
      indexesButtons.push(renderPageNumberButton(i));
    }

    return (
      <div className="pagination-buttons">
        {renderPageNumberButton(1)}
        ...
        {indexesButtons}
        ...
        {renderPageNumberButton(pagesCount)}
      </div>
    );
  };

  const handlePrevArrowClick = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextArrowClick = () => {
    if (currentPage < pagesCount) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <div className="paging-wrapper">
      {React.cloneElement(children, {
        skip: maxElemPerPage * (currentPage - 1),
        take: maxElemPerPage,
      })}

      {totalElementsCount > maxElemPerPage && (
        <div className="pagination-buttons-wrapper">
          <FiChevronLeft
            className={classnames('page-index-button', { disabled: currentPage === 1 })}
            onClick={handlePrevArrowClick}
          />
          {renderPageIndexes()}
          <FiChevronRight
            className={classnames('page-index-button', { disabled: currentPage === pagesCount })}
            onClick={handleNextArrowClick}
          />
        </div>
      )}
    </div>
  );
}
