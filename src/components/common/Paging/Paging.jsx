import React, { useState } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import classnames from 'classnames';
import './Paging.css';

export const Paging = ({ maxElemPerPage = 6, totalElementsCount, children, darkMode }) => {
  const [currentPage, setCurrentPage] = useState(1);

  const pagesCount = Math.ceil(totalElementsCount / maxElemPerPage);

  const renderPageNumberButton = pageNumber => (
    <div
      onClick={() => setCurrentPage(pageNumber)}
      className={classnames(`${darkMode ? 'page-index-button-dark' : 'page-index-button'}`, darkMode ? { 'active-button-dark': pageNumber === currentPage } : { 'active-button': pageNumber === currentPage })}
    >
      {pageNumber}
    </div>
  );

  const renderPageIndexes = () => {
    const indexesButtons = [];

    if (pagesCount <= 6) {
      for (let i = 1; i <= pagesCount; i++) {
        indexesButtons.push(renderPageNumberButton(i));
      }

      return <div className={darkMode ? "pagination-buttons-dark" : "pagination-buttons"}>{indexesButtons}</div>;
    }

    if (currentPage <= 5) {
      for (let i = 1; i <= 5; i++) {
        indexesButtons.push(renderPageNumberButton(i));
      }

      return (
        <div className={darkMode ? "pagination-buttons-dark" : "pagination-buttons"}>
          {indexesButtons}
          ...
          <div>{renderPageNumberButton(pagesCount)}</div>
        </div>
      );
    }

    if (currentPage > pagesCount - 5) {
      for (let i = pagesCount - 4; i <= pagesCount; i++) {
        indexesButtons.push(renderPageNumberButton(i));
      }
      return (
        <div className={darkMode ? "pagination-buttons-dark" : "pagination-buttons"}>
          {renderPageNumberButton(1)}
          ...
          {indexesButtons}
        </div>
      );
    }

    for (let i = currentPage - 1; i <= currentPage + 2; i++) {
      indexesButtons.push(renderPageNumberButton(i));
    }

    return (
      <div className={darkMode ? "pagination-buttons-dark" : "pagination-buttons"}>
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
            className={classnames(`${darkMode ? 'page-index-button-dark' : 'page-index-button'}`, { disabled: currentPage === 1 })}
            onClick={handlePrevArrowClick}
          />
          {renderPageIndexes()}
          <FiChevronRight
            className={classnames(`${darkMode ? 'page-index-button-dark' : 'page-index-button'}`, { disabled: currentPage === pagesCount })}
            onClick={handleNextArrowClick}
          />
        </div>
      )}
    </div>
  );
};
