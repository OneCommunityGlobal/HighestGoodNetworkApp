import styles from './ItemOverview.module.css';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { FaMapMarkerAlt } from 'react-icons/fa';
import { IoMdHeart, IoMdHeartEmpty } from 'react-icons/io';
import { BsChat } from 'react-icons/bs';
import ImageCarousel from '../Components/ImageCarousel';
import Header from '../Header';
import { addToWishlist, removeFromWishlist } from '../../../actions/lbdashboard/wishlistActions';

function WishListItem() {
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const userId = user?.userid || null;

  const currentItem = useSelector(state => state.wishlistItem.wishListItem);
  const wishlistItems = useSelector(state => state.wishlistItem.wishListItems) || [];

  const isWishlisted = wishlistItems.some(item => item._id === currentItem?._id);

  useEffect(() => {
    const backToTopButton = document.querySelector('.top');
    if (backToTopButton) backToTopButton.style.display = 'none';

    return () => {
      if (backToTopButton) backToTopButton.style.display = 'block';
    };
  }, []);

  const handleWishlistToggle = async () => {
    if (!userId || !currentItem?._id) {
      toast.error('Please login to manage wishlist');
      return;
    }

    const listingId = currentItem._id;

    try {
      if (isWishlisted) {
        await dispatch(removeFromWishlist(userId, listingId));
        toast.info('Removed from Wishlist');
      } else {
        await dispatch(addToWishlist(userId, listingId));
        toast.success('Added to Wishlist');
      }
      // Refetch updated wishlist after toggle
      dispatch(fetchWishlist(userId));
    } catch (error) {
      toast.error('Wishlist update failed');
    }
  };

  if (!currentItem) return null;

  return (
    <div className={`item ${styles.item_overview_module}`}>
      <div className={styles.item__container}>
        <Header />

        <div className={styles.item__overview}>
          <div className={styles.item__details_left}>
            <h1>{currentItem.unit}</h1>
            <h1>{currentItem.title}</h1>

            <ImageCarousel images={currentItem.images || []} />

            <div className={styles.item__location}>
              <FaMapMarkerAlt />
              <a href="/">View on Property Map</a>
            </div>
          </div>

          <div className={styles.item__details_right}>
            <p>
              Price: <b>{currentItem.price}</b>
            </p>

            <div className={styles.footer__icons}>
              <button type="button" onClick={handleWishlistToggle}>
                {isWishlisted ? <IoMdHeart className={styles.saved__item} /> : <IoMdHeartEmpty />}
                Save
              </button>

              <button type="button">
                <BsChat /> Chat with the Host
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WishListItem;
