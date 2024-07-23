import React, { useEffect, useRef } from 'react';
import $ from 'jquery';
import PropTypes from 'prop-types';
import './Team.css'; // Make sure to include any necessary CSS
import TeamTableHeader from './TeamTableHeader';

const FixedScrollbar = ({ targetRef }) => {
  const scrollbarRef = useRef(null);
  const fakeContentRef = useRef(null);

  useEffect(() => {
    const scrollbar = $(scrollbarRef.current);
    const fakeContent = $(fakeContentRef.current);

    scrollbar.hide().css({
      overflowX: 'auto',
      position: 'fixed',
      width: '100%',
      bottom: 0,
    });

    const top = (e) => e.offset().top;
    const bottom = (e) => e.offset().top + e.height();

    let active = $();

    const findActive = () => {
      scrollbar.show();
      let active = $();
      const target = $(targetRef.current);
      if (top(target) < top(scrollbar) && bottom(target) > bottom(scrollbar)) {
        fakeContent.width(target.get(0).scrollWidth);
        fakeContent.height(1);
        active = target;
      }
      fit(active);
      return active;
    };

    const fit = (active) => {
      if (!active.length) return scrollbar.hide();
      scrollbar.css({ left: active.offset().left, width: active.width() });
      fakeContent.width(active.get(0).scrollWidth);
      fakeContent.height(1);
      lastScroll = undefined; // Replace delete statement
    };

    const onScroll = () => {
      const oldActive = active;
      active = findActive();
      if (oldActive.not(active).length) {
        oldActive.unbind('scroll', update);
      }
      if (active.not(oldActive).length) {
        active.scroll(update);
      }
      update();
    };

    let lastScroll;
    const scroll = () => {
      if (!active.length) return;
      if (scrollbar.scrollLeft() === lastScroll) return;
      lastScroll = scrollbar.scrollLeft();
      active.scrollLeft(lastScroll);
    };

    const update = () => {
      if (!active.length) return;
      if (active.scrollLeft() === lastScroll) return;
      lastScroll = active.scrollLeft();
      scrollbar.scrollLeft(lastScroll);
    };

    scrollbar.scroll(scroll);

    onScroll();
    $(window).scroll(onScroll);
    $(window).resize(onScroll);

    return () => {
      $(window).off('scroll', onScroll);
      $(window).off('resize', onScroll);
    };
  }, [targetRef]);

  return (
    <div id="fixed-scrollbar" ref={scrollbarRef}>
      <div ref={fakeContentRef}>

      </div>
    </div>
  );
};

FixedScrollbar.propTypes = {
  targetRef: PropTypes.object.isRequired,
};

export default FixedScrollbar;
